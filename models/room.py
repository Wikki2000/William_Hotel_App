#!/usr/bin/python3
"""room Module"""
from models.base_model import Base, BaseModel
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from models.room_detail import RoomDetail


class Room(BaseModel, Base):
    """Define class for storing rooms type"""
    __tablename__ = "rooms"
    name = Column(String(30), nullable=False)
    service_id = Column(String(60), ForeignKey('services.id'))

    rooms_detail = relationship('RoomDetail', backref='room',
                         cascade='all, delete-orphan')
