#!/usr/bin/python3
"""Drink Module"""
from models.base_model import Base, BaseModel
from sqlalchemy import Column, String, Integer, ForeignKey, Float
from sqlalchemy.orm import relationship


class Drink(BaseModel, Base):
    """Define class for storing drinks"""
    __tablename__ = "drinks"
    name =  Column(String(20), nullable=False)
    qty_stock = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    service_id = Column(String(60), ForeignKey('services.id'))
