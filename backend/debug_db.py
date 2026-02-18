import asyncio
from sqlalchemy.future import select
from backend.core.database import async_session_factory
from backend.models.user import User
from backend.models.doctor import Doctor
from backend.models.otp import OTPVerification

async def inspect_db():
    async with async_session_factory() as db:
        print("\n--- USERS ---")
        result = await db.execute(select(User))
        users = result.scalars().all()
        for u in users:
            print(f"ID: {u.id} | Email: {u.email} | Role: {u.role} | Verified: {u.is_verified}")

        print("\n--- DOCTORS ---")
        result = await db.execute(select(Doctor))
        doctors = result.scalars().all()
        for d in doctors:
            print(f"ID: {d.id} | UserID: {d.user_id} | Name/Lic: {d.license_number} | Spec: {d.specialization}")

        print("\n--- OTPs ---")
        result = await db.execute(select(OTPVerification))
        otps = result.scalars().all()
        for o in otps:
            print(f"User: {o.user_id} | OTP: {o.otp_hash} | Expires: {o.expires_at}")

if __name__ == "__main__":
    asyncio.run(inspect_db())
