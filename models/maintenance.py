#!/usr/bin/python3
"""Maintenance Module"""
from models.base_model import Base, BaseModel
from sqlalchemy import Column, String, Integer, ForeignKey, LargeBinary, Text
from sqlalchemy.dialects.mysql import ENUM


class Maintenance(BaseModel, Base):
    """Define class for maintenence list"""
    __tablename__ = "maintenances"
    fault = Column(String(225), nullable=False)
    image = Column(LargeBinary)
    description = Column(Text)
    room_id = Column(String(225), nullable=False)
    status = status = Column(
        ENUM("approved", "pending", "rejected"), default="pending"
    )
    maintenance_id = Column(String(60), ForeignKey("users.id"))
