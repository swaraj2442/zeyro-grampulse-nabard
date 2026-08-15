"""Feature computation worker logic."""

import asyncio
import json
import os
import signal
import sys
from datetime import datetime
import psycopg
from nats.aio.client import Client as NATS
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))
from features.extractors.cashflow import extract_all_features

async def main() -> None:
    print("Starting feature-pipeline worker...")
    
    db_url = os.environ.get("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/zeyro")
    nats_url = os.environ.get("NATS_URL", "nats://localhost:4222")
    
    nc = NATS()
    await nc.connect(nats_url)
    js = nc.jetstream()
    
    # Ensure stream exists (usually created by Go layer or enrichment, but good to check)
    try:
        await js.add_stream(name="EVENTS", subjects=["EVENTS.*", "EVENTS.*.*"])
    except Exception as e:
        print(f"Warning on stream creation: {e}")
        
    async def recompute_handler(msg):
        data = msg.data.decode()
        print(f"Received recompute request: {data}")
        
        try:
            payload = json.loads(data)
            user_ref_hash = payload.get("user_ref_hash")
            if not user_ref_hash:
                print("Missing user_ref_hash in event payload.")
                await msg.ack()
                return
            
            # 1. Query enriched transactions from DB
            print(f"Fetching enriched transactions for user: {user_ref_hash}")
            txns = []
            async with await psycopg.AsyncConnection.connect(db_url) as aconn:
                async with aconn.cursor(row_factory=psycopg.rows.dict_row) as cur:
                    await cur.execute(
                        """
                        SELECT txn_id, partner_id, user_ref_hash, txn_timestamp,
                               amount_inr, direction, counterparty_vpa_enc,
                               merchant_name, business_type, sub_category,
                               confidence, entity_tier, data_source
                        FROM enriched_transactions
                        WHERE user_ref_hash = %s
                        """,
                        (user_ref_hash,)
                    )
                    txns = await cur.fetchall()
            
            print(f"Found {len(txns)} transactions for user: {user_ref_hash}")
            
            # 2. Extract features
            # We calculate 90d window features as default
            window = "90d"
            features = extract_all_features(user_ref_hash, txns, window_days=90)
            
            # 3. Persist features to feature_vectors table
            print(f"Saving computed features to database for user: {user_ref_hash}")
            computed_at = datetime.now()
            
            async with await psycopg.AsyncConnection.connect(db_url) as aconn:
                async with aconn.cursor() as cur:
                    for group_name, group_features in features.items():
                        for feat_name, feat_val in group_features.items():
                            await cur.execute(
                                """
                                INSERT INTO feature_vectors (
                                    user_ref_hash, feature_window, feature_group,
                                    feature_name, feature_value_json, computed_at
                                ) VALUES (
                                    %s, %s, %s, %s, %s, %s
                                ) ON CONFLICT (user_ref_hash, feature_window, feature_group, feature_name)
                                DO UPDATE SET
                                    feature_value_json = EXCLUDED.feature_value_json,
                                    computed_at = EXCLUDED.computed_at
                                """,
                                (
                                    user_ref_hash,
                                    window,
                                    group_name,
                                    feat_name,
                                    json.dumps(feat_val),
                                    computed_at
                                )
                            )
            
            print(f"Successfully computed and saved features for user: {user_ref_hash}")
            
            # Publish pipeline.complete event to NATS
            try:
                complete_payload = {"user_ref_hash": user_ref_hash}
                await js.publish("EVENTS.pipeline.complete", json.dumps(complete_payload).encode('utf-8'))
                print(f"Published pipeline.complete event for user: {user_ref_hash}")
            except Exception as pe:
                print(f"Failed to publish pipeline.complete: {pe}")
                
            await msg.ack()
            
        except Exception as e:
            print(f"Error in recompute_handler: {e}")
            await msg.nak()
            
    print("Subscribing to EVENTS.pipeline.recompute...")
    sub = await js.subscribe(
        "EVENTS.pipeline.recompute",
        durable="feature_pipeline_worker",
        cb=recompute_handler
    )
    
    # Graceful shutdown
    loop = asyncio.get_running_loop()
    stop_event = asyncio.Event()
    
    def shutdown():
        print("Shutting down feature-pipeline worker...")
        stop_event.set()
        
    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, shutdown)
        
    await stop_event.wait()
    await sub.unsubscribe()
    await nc.close()

if __name__ == "__main__":
    asyncio.run(main())
