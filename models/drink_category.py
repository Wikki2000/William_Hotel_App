#!/usr/bin/python3
"""Stores class of drinks available."""
from models.base_model import Base, BaseModel
from sqlalchemy import Column, String, Integer, ForeignKey, Float, LargeBinary
from sqlalchemy.orm import relationship
from models.drink import Drink


class DrinkCategory(BaseModel, Base):
    """DrinkCategory class definition."""
    __tablename__ = "drink_categories"
    category =  Column(String(225), nullable=False)
    
    drinks = relationship('Drink', backref='drink',
                         cascade='all, delete-orphan')
