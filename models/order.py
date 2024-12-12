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
    payment_type = Column(String(50), nullable=False)
    amount = Column(Float, nullable=False)
    is_paid = Column(Boolean, default=False)
    qty_order = Column(Integer, nullable=False)
    customer_id = Column(
        String(60), ForeignKey("customers.id"), nullable=False
    )
    user_id = Column(
        String(60), ForeignKey("users.id"), nullable=False
    )
    food_id = Column(
        String(60), ForeignKey("foods.id"), nullable=False
    )
    drink_id = Column(
        String(60), ForeignKey("drinks.id"), nullable=False
    )
