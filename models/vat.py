#!/usr/bin/python3
"""vat Module"""
from datetime import datetime
from models.base_model import Base, BaseModel
from sqlalchemy import (
    Column, String, Boolean, ForeignKey, Float, ForeignKey
)


class Vat(BaseModel, Base):
    """Define class for storing customer orders"""
    __tablename__ = "vats"
    amount = Column(Float, nullable=False)
    is_due = Column(Boolean, default=False)
    order_id = Column(
        String(60), ForeignKey("orders.id"), nullable=False
    )
