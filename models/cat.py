#!/usr/bin/python3
"""vat Module"""
from datetime import datetime
from models.base_model import Base, BaseModel
from sqlalchemy import Column, Date, String, Boolean, Float

class Cat(BaseModel, Base):
    """Store monthly cats of sales."""
    __tablename__ = "cats"
    month = Column(String(100), nullable=False, unique=True)
    amount = Column(Float, nullable=False)
    is_paid = Column(Boolean, default=False)
    is_due = Column(Boolean, default=False)
