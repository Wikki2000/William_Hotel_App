#!/usr/bin/python3
"""This Module accumulate the sum of daily transactions."""
from models.base_model import Base, BaseModel
from sqlalchemy import Column, Float, Date, Boolean


class Sale(BaseModel, Base):
    """Define class for storing summation of transactions"""
    __tablename__ = "sales"
    food_sold = Column(Float, default=0)
    drink_sold = Column(Float, default=0)
    laundry_sold = Column(Float, default=0)
    game_sold = Column(Float, default=0)
    room_sold = Column(Float, default=0)
    is_approved = Column(Boolean, default=False)
    entry_date = Column(Date, nullable=False, unique=True)
