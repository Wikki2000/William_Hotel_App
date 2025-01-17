#!/usr/bin/python3
"""This Module accumulate the sum of daily transactions."""
from models.base_model import Base, BaseModel
from sqlalchemy import Column, Float, Date


class DailyTransaction(BaseModel, Base):
    """Define class for storing summation of transactions"""
    __tablename__ = "daily_transactions"
    amount = Column(Float, nullable=False)
    entry_date = Column(Date, nullable=False, unique=True)
