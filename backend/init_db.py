import asyncio
from backend.core.database import engine, Base
from backend.models import user, doctor, otp, patient, laboratory  # Import models to register them with Base

async def init_models():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all) # Optional: Drop all validation
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created successfully!")

if __name__ == "__main__":
    asyncio.run(init_models())
