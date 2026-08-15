"""Bootstrap entrypoint for the enrichment engine."""

import asyncio
import json
import os
import signal
import sys
from datetime import datetime
from typing import Optional

from nats.aio.client import Client as NATS
from pydantic import BaseModel, ConfigDict
import psycopg

# Pydantic model for incoming event
class RawUPITransaction(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    partner_id: str
    user_ref: str
    txn_id: str
    timestamp: datetime
    amount_inr: float
    direction: str
    counterparty_vpa: Optional[str] = None
    raw_description: Optional[str] = None
    data_source: str

async def main() -> None:
    print("Starting enrichment-engine...")

    db_url = os.environ.get("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/zeyro")
    nats_url = os.environ.get("NATS_URL", "nats://localhost:4222")

    nc = NATS()
    await nc.connect(nats_url)
    js = nc.jetstream()

    # Ensure stream exists (usually created by Go layer, but good to ensure)
    try:
        await js.add_stream(name="EVENTS", subjects=["EVENTS.*", "EVENTS.*.*"])
    except Exception as e:
        print(f"Warning on stream creation: {e}")

    async def message_handler(msg):
        subject = msg.subject
        data = msg.data.decode()
        
        try:
            payload_dict = json.loads(data)
            txn = RawUPITransaction.model_validate(payload_dict)
            
            # --- Mock Enrichment Logic ---
            # In a real system, this would call models or external APIs
            business_type = "UNKNOWN"
            sub_category = None
            merchant_name = None
            entity_tier = "TIER_3"
            confidence = 0.5
            
            if txn.counterparty_vpa:
                if "swiggy" in txn.counterparty_vpa.lower() or "zomato" in txn.counterparty_vpa.lower():
                    business_type = "FOOD_DELIVERY"
                    merchant_name = "Food Delivery Partner"
                    confidence = 0.95
                elif "uber" in txn.counterparty_vpa.lower() or "ola" in txn.counterparty_vpa.lower():
                    business_type = "TRANSPORTATION"
                    merchant_name = "Cab Aggregator"
                    confidence = 0.90
            
            import hashlib
            user_ref_hash = hashlib.sha256(txn.user_ref.encode('utf-8')).hexdigest()

            # --- Persistence ---
            async with await psycopg.AsyncConnection.connect(db_url) as aconn:
                async with aconn.cursor() as cur:
                    await cur.execute(
                        """
                        INSERT INTO enriched_transactions (
                            txn_id, partner_id, user_ref_hash, txn_timestamp,
                            amount_inr, direction, counterparty_vpa_enc,
                            merchant_name, business_type, sub_category,
                            confidence, entity_tier, data_source, raw_description_enc
                        ) VALUES (
                            %s, %s, %s, %s,
                            %s, %s, %s,
                            %s, %s, %s,
                            %s, %s, %s, %s
                        ) ON CONFLICT (partner_id, user_ref_hash, txn_id) DO NOTHING
                        """,
                        (
                            txn.txn_id, txn.partner_id, user_ref_hash, txn.timestamp,
                            txn.amount_inr, txn.direction, txn.counterparty_vpa,
                            merchant_name, business_type, sub_category,
                            confidence, entity_tier, txn.data_source, txn.raw_description
                        )
                    )
            
            print(f"Successfully enriched and saved txn_id: {txn.txn_id}")
            
            # Trigger feature recomputation
            try:
                recompute_payload = {"user_ref_hash": user_ref_hash}
                await js.publish("EVENTS.pipeline.recompute", json.dumps(recompute_payload).encode('utf-8'))
                print(f"Published recompute trigger for user: {user_ref_hash}")
            except Exception as pe:
                print(f"Failed to publish recompute trigger: {pe}")

            await msg.ack()
            
        except Exception as e:
            print(f"Error processing message {msg.seq}: {e}")
            await msg.nak()

    # Create durable consumer
    print("Subscribing to EVENTS.transaction.raw...")
    sub = await js.subscribe("EVENTS.transaction.raw", durable="enrichment_engine", cb=message_handler)

    # Graceful shutdown handling
    loop = asyncio.get_running_loop()
    stop_event = asyncio.Event()

    def shutdown():
        print("Shutting down...")
        stop_event.set()

    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, shutdown)

    await stop_event.wait()
    
    await sub.unsubscribe()
    await nc.close()

if __name__ == "__main__":
    asyncio.run(main())
