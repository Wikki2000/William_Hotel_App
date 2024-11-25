#!/usr/bin/python3
"""room Module"""
from models.base_model import Base, BaseModel
from sqlalchemy import Column, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship


class RoomDetail(BaseModel, Base):
    """Define class for storing rooms type"""
    __tablename__ = "rooms_detail"
    room_number = Column(String(20), nullable=False)
    is_occupied = Column(Boolean, default=False)
    is_reserved = Column(Boolean, default=False)
    room_id = Column(String(60), ForeignKey('rooms.id'))
