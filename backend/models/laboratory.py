from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from backend.core.database import Base

class Laboratory(Base):
    __tablename__ = "laboratories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    
    lab_name = Column(String, nullable=False)
    license_number = Column(String, nullable=True)
    accreditation_number = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String, nullable=True)
    lab_head_name = Column(String, nullable=True)
    tests_available = Column(JSONB, nullable=True) # List of tests
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="lab_profile")
