#!/usr/bin/python3
"""vat Module"""
from datetime import datetime
from models.base_model import Base, BaseModel
from sqlalchemy import Column, Date, String, Boolean, Float

class Vat(BaseModel, Base):
    """Store monthly vats of sales."""
    __tablename__ = "vats"
    month = Column(Date, nullable=False, unique=True)
    amount = Column(Float, nullable=False)
    is_paid = Column(Boolean, default=False)
