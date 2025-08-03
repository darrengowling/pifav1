#!/usr/bin/env python3
"""
Clear all tournaments from the database to provide a clean testing environment
"""

import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def clear_tournaments():
    # Load environment variables
    load_dotenv('/app/backend/.env')
    
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']
    
    print(f"Connecting to MongoDB at: {mongo_url}")
    print(f"Database: {db_name}")
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        # Check current tournaments
        tournaments_count = await db.tournaments.count_documents({})
        print(f"Current tournaments in database: {tournaments_count}")
        
        if tournaments_count > 0:
            # List current tournaments
            tournaments = await db.tournaments.find({}).to_list(length=None)
            print("\nExisting tournaments:")
            for tournament in tournaments:
                print(f"  - {tournament.get('name', 'Unknown')} (ID: {tournament.get('id', 'Unknown')})")
            
            # Clear all tournaments
            result = await db.tournaments.delete_many({})
            print(f"\n✅ Deleted {result.deleted_count} tournaments")
            
            # Verify deletion
            remaining_count = await db.tournaments.count_documents({})
            print(f"Remaining tournaments: {remaining_count}")
            
            if remaining_count == 0:
                print("🎉 Database successfully cleared of all tournaments!")
            else:
                print("⚠️ Some tournaments may still remain")
        else:
            print("✅ No tournaments found in database - already clean!")
            
    except Exception as e:
        print(f"❌ Error clearing tournaments: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(clear_tournaments())