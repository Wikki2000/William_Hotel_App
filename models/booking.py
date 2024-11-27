#!/usr/bin/python3
"""book Module"""
from datetime import datetime
from models.base_model import Base, BaseModel
from sqlalchemy import Column, String, ForeignKey, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship


class Booking(BaseModel, Base):
    """Define class for storing booking of rooms"""
    __tablename__ = "bookings"
    duration = Column(String(30), nullable=False)
    expired_at = Column(DateTime, default=datetime.utcnow())
    total_cost = Column(Float, nullable=False)
    customer_id = Column(
        String(30), ForeignKey("customers.id"), nullable=False
    )
    user_id = Column(
        String(30), ForeignKey("users.id"), nullable=False
    )
    room_id = Column(
        String(30), ForeignKey("rooms.id"), nullable=False
    )
