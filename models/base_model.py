#!/usr/bin/python3
"""This module models the storage of user details."""
from datetime import datetime
from sqlalchemy import Column, String
from sqlalchemy.orm import declarative_base
from uuid import uuid4

Base = declarative_base()

class BaseModel:
    """Define the class models for related method and attribute."""
    id = Column(String(60), primary_key=True, default=lambda: str(uuid4()))

    def __str__(self):
        """String representation of objrct."""
        return f"[{self.__class__.__name__}] ({self.id}) {self.__dict__}"

    def to_dict(self):
        """Return the dict representation of a class instance."""
        new_dict = self.__dict__.copy()
        if "_sa_instance_state" in new_dict:
            del new_dict["_sa_instance_state"]
        new_dict["__class__"] = self.__class__.__name__
        return new_dict
