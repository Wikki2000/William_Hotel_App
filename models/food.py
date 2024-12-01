#!/usr/bin/python3
"""Food Module"""
from models.base_model import Base, BaseModel
from sqlalchemy import Column, String, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship
from models.order import Order

class Food(BaseModel, Base):
    """Define class for storing drinks"""
    __tablename__ = "foods"
    name =  Column(String(20), nullable=False)
    is_available = Column(Boolean, default=False)
    amount = Column(Float, nullable=False)

    orders = relationship('Order', backref='food',
                         cascade='all, delete-orphan')
