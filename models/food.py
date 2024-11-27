#!/usr/bin/python3
"""Food Module"""
from models.base_model import Base, BaseModel
from sqlalchemy import Column, String, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship


class Food(BaseModel, Base):
    """Define class for storing drinks"""
    __tablename__ = "foods"
    name =  Column(String(20), nullable=False)
    is_available = Column(Boolean, default=False)
    unit_price = Column(Float, nullable=False)
    service_id = Column(String(60), ForeignKey('services.id'))
