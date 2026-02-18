import asyncio
from backend.core.database import engine
from backend.models.user import User, UserRole
from backend.core.security import get_password_hash
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker

async def seed_data():
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as db:
        print("Checking for Health Officer (Authority) user...")
        result = await db.execute(select(User).where(User.email == "admin@mediguard.com"))
        user = result.scalars().first()
        
        if not user:
            print("Creating Health Officer user...")
            user = User(
                email="admin@mediguard.com",
                password_hash=get_password_hash("admin123"), # Hardcoded as requested
                role=UserRole.authority,
                is_verified=True
            )
            db.add(user)
            await db.commit()
            print("Health Officer created successfully.")
        else:
            print("Health Officer user already exists.")

if __name__ == "__main__":
    from sqlalchemy.ext.asyncio import AsyncSession
    asyncio.run(seed_data())
