#!/usr/bin/python3
"""Drink Module"""
from models.base_model import Base, BaseModel
from sqlalchemy import Column, String, Integer, ForeignKey, Float, LargeBinary
from sqlalchemy.orm import relationship
from models.order_item import OrderItem


class Drink(BaseModel, Base):
    """Define class for storing drinks"""
    __tablename__ = "drinks"
    image = Column(LargeBinary)
    name =  Column(String(225), nullable=False)
    qty_stock = Column(Integer, nullable=False)
    amount = Column(Float, nullable=False)
    
    order_items = relationship('OrderItem', backref='drink',
                               cascade='all, delete-orphan')
