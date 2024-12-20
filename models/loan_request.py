#!/usr/bin/python3
"""loan_request Module"""
from models.base_model import Base, BaseModel
from sqlalchemy import Column, String, Boolean, Float, ForeignKey, Integer



class LoanRequest(BaseModel, Base):
    """Define class for storing loans request by staff."""
    __tablename__ = "loan_requests"
    amount = Column(Float, nullable=False)
    due_month =  Column(Integer, nullable=False)  # 1-12 Month in a year
    repayment_mode = Column(String(40), nullable=False)
    bank_name =   Column(String(40), nullable=False)
    account_number =  Column(String(20), nullable=False)
    account_name =  Column(String(40), nullable=False)
    is_paid = Column(Boolean, default=False)  # Is loan paid to staff
    is_refund = Column(Boolean, default=False)  # Is loan repay by staff.
    is_approved_by_manager = Column(Boolean, default=False)
    is_approved_by_ceo = Column(Boolean, default=False)
    staff_id = Column(
        String(60), ForeignKey("users.id"), nullable=False
    )
