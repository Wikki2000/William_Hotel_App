#!/usr/bin/python3
"""This Module accumulate the sum of daily transactions."""
from models.base_model import Base, BaseModel
from models.sale_comment import SaleComment
from sqlalchemy import Column, Float, Date, Boolean
from sqlalchemy.orm import relationship


class Sale(BaseModel, Base):
    """Define class for storing summation of transactions"""
    __tablename__ = "sales"
    food_sold = Column(Float, default=0)
    drink_sold = Column(Float, default=0)
    laundry_sold = Column(Float, default=0)
    game_sold = Column(Float, default=0)
    room_sold = Column(Float, default=0)

    sale_by_pos = Column(Float, default=0)
    sale_by_cash = Column(Float, default=0)
    sale_by_transfer = Column(Float, default=0)

    is_approved = Column(Boolean, default=False)
    entry_date = Column(Date, nullable=False, unique=True)

    sale_comments = relationship('SaleComment', backref='sale',
                                  cascade='all, delete-orphan')
