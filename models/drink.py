#!/usr/bin/python3
"""Drink Module"""
from models.base_model import Base, BaseModel
from sqlalchemy import Column, String, Integer, ForeignKey, Float
from sqlalchemy.orm import relationship
from module.order import Order


class Drink(BaseModel, Base):
    """Define class for storing drinks"""
    __tablename__ = "drinks"
    name =  Column(String(20), nullable=False)
    qty_stock = Column(Integer, nullable=False)
    amount = Column(Float, nullable=False)
    
    order = relationship('Order', backref='drink',
                         cascade='all, delete-orphan')
