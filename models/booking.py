#!/usr/bin/python3
"""book Module"""
from datetime import datetime
from models.base_model import Base, BaseModel
from sqlalchemy import (
    Column, String, ForeignKey, Boolean, Float, Date
)
from sqlalchemy.dialects.mysql import ENUM
from sqlalchemy.orm import relationship


class Booking(BaseModel, Base):
    """Define class for storing booking of rooms"""
    __tablename__ = "bookings"
    duration = Column(String(20), default=datetime.utcnow())
    checkout_date = Column(Date)
    is_paid = Column(ENUM("yes", "no"), nullable=False)
    guest_number = Column(String(30), nullable=False)
    customer_id = Column(
        String(30), ForeignKey("customers.id"), nullable=False
    )
    user_id = Column(
        String(30), ForeignKey("users.id"), nullable=False
    )
    room_id = Column(
        String(30), ForeignKey("rooms.id"), nullable=False
    )
