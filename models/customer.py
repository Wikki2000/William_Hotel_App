#!/usr/bin/python3
"""This module models the storage of customer/guess details."""
from models.base_model import Base, BaseModel
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import relationship


class Customer(BaseModel, Base):
    """Define class for storing customers"""
    __tablename__ = "customers"
    name =  Column(String(20), nullable=False)
    address = Column(String(30))
    gender = Column(String(30))
    phone = Column(String(30))
    customer_id = Column(String(30))
