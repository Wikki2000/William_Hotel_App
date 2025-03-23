#!/usr/bin/python3
"""vat Module"""
from datetime import datetime
from models.base_model import Base, BaseModel
from sqlalchemy import Column, String, Boolean, Float

class Vat(BaseModel, Base):
    """Store monthly vats of sales."""
    __tablename__ = "vats"
    month = Column(String(100), nullable=False, unique=True)
    amount = Column(Float, nullable=False)
    is_paid = Column(Boolean, default=False)
    is_due = Column(Boolean, default=False)
