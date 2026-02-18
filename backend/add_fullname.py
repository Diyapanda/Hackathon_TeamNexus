import asyncio
import asyncpg
from backend.core.config import settings

async def migrate():
    print("Connecting to database...")
    # Extract connection details from DATABASE_URL
    # database_url format: postgresql+asyncpg://user:pass@host/dbname
    url = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
    
    try:
        conn = await asyncpg.connect(url)
        print("Connected. Adding 'full_name' column to 'doctors' table...")
        
        await conn.execute("""
            ALTER TABLE doctors 
            ADD COLUMN IF NOT EXISTS full_name VARCHAR;
        """)
        
        print("Success! Column 'full_name' added.")
        await conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(migrate())
