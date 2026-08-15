"""Database seeder to prepare tables for testing."""

import os
import psycopg

def seed() -> None:
    db_url = os.environ.get("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/zeyro?sslmode=disable")
    partner_id = "00000000-0000-0000-0000-000000000001"
    
    print(f"Connecting to database at {db_url}...")
    conn = psycopg.connect(db_url)
    try:
        with conn.cursor() as cur:
            # Clear old records to start clean
            print("Cleaning up old test tables...")
            cur.execute("TRUNCATE TABLE consortium_outcomes CASCADE;")
            cur.execute("TRUNCATE TABLE assessments CASCADE;")
            cur.execute("TRUNCATE TABLE consent_artifacts CASCADE;")
            cur.execute("TRUNCATE TABLE enriched_transactions CASCADE;")
            cur.execute("TRUNCATE TABLE raw_upi_transactions CASCADE;")
            cur.execute("TRUNCATE TABLE feature_vectors CASCADE;")
            cur.execute("DELETE FROM partners WHERE id = %s;", (partner_id,))
            
            # Seed partner
            print(f"Seeding partner {partner_id}...")
            cur.execute(
                """
                INSERT INTO partners (id, partner_code, display_name, status)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
                """,
                (partner_id, "zeyro_dev", "Zeyro Dev Partner", "ACTIVE")
            )
            
            # Seed mock merchant entities for enrichment
            print("Seeding merchant entity rules...")
            cur.execute("TRUNCATE TABLE merchant_entities CASCADE;")
            cur.execute(
                """
                INSERT INTO merchant_entities (canonical_vpa, display_name, mcc_equivalent, business_type, tier)
                VALUES 
                  ('swiggy@icici', 'Swiggy', 'FOOD_DELIVERY', 'FOOD_DELIVERY', 'VERIFIED'),
                  ('zomato@icici', 'Zomato', 'FOOD_DELIVERY', 'FOOD_DELIVERY', 'VERIFIED'),
                  ('uber@paytm', 'Uber', 'TRANSPORTATION', 'TRANSPORTATION', 'VERIFIED'),
                  ('ola@sbi', 'Ola', 'TRANSPORTATION', 'TRANSPORTATION', 'VERIFIED')
                ON CONFLICT (canonical_vpa) DO NOTHING;
                """
            )
            
        conn.commit()
        print("Database seeded successfully!")
    except Exception as e:
        conn.rollback()
        print(f"Error seeding database: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    seed()
