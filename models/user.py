#!/usr/bin/python3
"""This module models the storage of user details."""
from datetime import datetime
from models.base_model import Base, BaseModel
from sqlalchemy import Column, String, Boolean, LargeBinary, DateTime
from sqlalchemy.dialects.mysql import ENUM 
from sqlalchemy.orm import relationship
from werkzeug.security import generate_password_hash, check_password_hash
from models.booking import Booking
from models.order import Order
from models.loan_request import LoanRequest


class User(BaseModel, Base):
    """Define class for storing users"""
    __tablename__ = "users"
    title = Column(String(20), nullable=False)
    first_name = Column(String(20), nullable=False)
    middle_name = Column(String(20))
    last_name =  Column(String(20), nullable=False)
    username = Column(String(20), nullable=False)
    profile_photo = Column(LargeBinary)
    email = Column(String(30), nullable=False, unique=True)
    address = Column(String(30))
    gender = Column(String(30))
    dob = Column(String(30))
    #dob = Column(DateTime)
    number = Column(String(30))
    nok = Column(String(30))
    nok_number = Column(String(30))
    religion = Column(String(30))
    state = Column(String(30))
    password = Column(String(1500), nullable=False, default="12345")
    role = Column(ENUM("admin", "manager", "staff"),  nullable=False)
    portfolio = Column(String(1500), nullable=False)
    is_active = Column(Boolean, default=False)
    last_active = Column(DateTime)

    
    # Handle relationship between staff that checkin & checkout guest
    checkin_made_by = relationship(
        'Booking', backref='checkin_by',
        cascade='all, delete-orphan',
        foreign_keys="Booking.checkin_by_id"
    )
    checkout_made_by = relationship(
        'Booking', backref='checkout_by',
        cascade='all, delete-orphan',
        foreign_keys="Booking.checkout_by_id"
    )

    # Handle relationship between staff that made order & cleared bill
    orders_made_by = relationship(
        'Order', backref='ordered_by',
        cascade='all, delete-orphan',
        foreign_keys="Order.ordered_by_id"
    )
    bill_cleared_by = relationship(
        'Order', backref='cleared_by',
        cascade='all, delete-orphan',
        foreign_keys="Order.cleared_by_id"
    )

    # Handle relationship between staff and request for loan
    loans = relationship(
        "LoanRequest", backref="staff",
        cascade='all, delete-orphan',
    )

    # ===================== Method Definition ==================== #
    def hash_password(self):
        """Hash password before storing in database."""
        self.password = generate_password_hash(self.password)

    def check_password(self, password):
        """Verify password and give access."""
        return check_password_hash(self.password, password)
