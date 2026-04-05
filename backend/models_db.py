import uuid
from sqlalchemy import Column, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime
from sqlalchemy.dialects.postgresql import UUID
from backend.database import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    status = Column(String, default="pending")  # pending, processing, completed, failed
    job_type = Column(String) # image_batch, video
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    results = relationship("Result", back_populates="job", cascade="all, delete-orphan")

class Result(Base):
    __tablename__ = "results"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    job_id = Column(String, ForeignKey("jobs.id", ondelete="CASCADE"))
    
    file_name = Column(String, nullable=True) # for batch images
    frame_timestamp = Column(Float, nullable=True) # for video in seconds
    pest_name = Column(String)
    confidence = Column(Float)
    severity = Column(String)
    
    # Bounding box info
    box_x1 = Column(Float, nullable=True)
    box_y1 = Column(Float, nullable=True)
    box_x2 = Column(Float, nullable=True)
    box_y2 = Column(Float, nullable=True)
    
    job = relationship("Job", back_populates="results")
