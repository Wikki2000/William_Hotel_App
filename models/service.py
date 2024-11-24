#!/usr/bin/python3
"""This module models the storage of services offered."""
from datetime import datetime
from models.base_model import Base, BaseModel
from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
"""
from models.food import Food
from models.room import Room
from models.drink import Drink
"""

class Service(BaseModel, Base):
    """Define class for services offered"""
    __tablename__ = "services"
    name = Column(String(30))

    #foods = relationship('Food', backref='service',
    #                     cascade='all, delete-orphan')
    #rooms = relationship('Room', backref='service',
    #                     cascade='all, delete-orphan')
    #drinks = relationship('Drink', backref='service',
    #                     cascade='all, delete-orphan')
