#!/usr/bin/python3
"""Food Module"""
from models.base_model import Base, BaseModel
from sqlalchemy import Column, String, Boolean, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship
from models.booking import Booking


class Room(BaseModel, Base):
    """Define class for storing drinks"""
    __tablename__ = "rooms"
    room_type =  Column(String(20), nullable=False)
    is_available = Column(Boolean, default=True)
    is_reserved = Column(Boolean, default=False)
    is_occupied = Column(Boolean, default=False)
    amount = Column(Float, nullable=False)
    room_number = Column(String(20), nullable=False, unique=True)

    books = relationship('Booking', backref='room',
                         cascade='all, delete-orphan')
