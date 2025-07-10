#!/usr/bin/python3
"""Daily Food Stock Module"""
from models.base_model import Base, BaseModel
from sqlalchemy import (
    Column, String, Boolean, Integer, Float, ForeignKey, Index, Date
)
from sqlalchemy.orm import relationship
from datetime import date


class DailyFoodStock(BaseModel, Base):
    __tablename__ = 'daily_food_stock'

    id = Column(Integer, primary_key=True)
    food_id = Column(
        String(60),
        ForeignKey('foods.id', ondelete="CASCADE"),
        nullable=False
    )
    date = Column(Date, default=date.today, nullable=False)
    opening_stock = Column(Integer, nullable=False)
