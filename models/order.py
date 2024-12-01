#!/usr/bin/python3
"""order Module"""
from datetime import datetime
from models.base_model import Base, BaseModel
from sqlalchemy import (
    Column, String, Boolean, ForeignKey, Float, ForeignKey, Integer
)
from sqlalchemy.orm import relationship


class Order(BaseModel, Base):
    """Define class for storing customer orders"""
    __tablename__ = "orders"
    payment_type = Column(String(30), nullable=False)
    amount = Column(Float, nullable=False)
    is_paid = Column(Boolean, default=False)
    qty_order = Column(Integer, nullable=False)
    customer_id = Column(
        String(30), ForeignKey("customers.id"), nullable=False, unique=True
    )
    user_id = Column(
        String(30), ForeignKey("users.id"), nullable=False, unique=True
    )
