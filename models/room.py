#!/usr/bin/python3
"""Food Module"""
from models.base_model import Base, BaseModel
from sqlalchemy import (
    Column, String, Boolean, Float, ForeignKey, Integer, LargeBinary
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.mysql import ENUM, LONGBLOB
from models.booking import Booking
from models.maintenance import Maintenance
from models.order import Order


class Room(BaseModel, Base):
    """Define class for storing drinks"""
    __tablename__ = "rooms"
    image = Column(LONGBLOB)
    name =  Column(String(20), nullable=False)
    status = Column(
        ENUM("available", "reserved", "occupied"),
        default="available"
    )
    amount = Column(Float, nullable=False)
    number = Column(String(20), nullable=False, unique=True)

    maintenances = relationship('Maintenance', backref='room',
                                cascade='all, delete-orphan')
    book = relationship('Booking', backref='room',
                         cascade='all, delete-orphan')
    orders = relationship(
        'Order', backref='room', cascade='all, delete-orphan'
    )
