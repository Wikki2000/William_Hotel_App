#!/usr/bin/python3
"""This module models the storage of the authentication API"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from models.base_model import Base
from dotenv import load_dotenv
from os import getenv
from typing import Type, Any, List

load_dotenv()

class Storage:
    """ Defines storage model using SQLAlchemy. """
    __session = None
    __engine = None

    def __init__(self):
        """ Create session engine to interact with database. """
        username = getenv('WILLIAM_COURT')
        password = getenv('WILLIAM_COURT_PASSWORD')
        database = getenv('WILLIAM_COURT_DATABASE')

        if not username or not password:
            error = "Environment variables must be set for database URL"
            raise ValueError(error)

        url = f'mysql+mysqldb://{username}:{password}@localhost:5432/{database}'
        self.__engine = create_engine(url, pool_pre_ping=True)
        Base.metadata.create_all(self.__engine)
        if not self.__session:
            session_factory = sessionmaker(bind=self.__engine)
            self.__session = scoped_session(session_factory)

    def refresh(self, obj: object) -> object:
        """Refresh to get current state
        """
        return self.__session.refresh(obj)

    def all(self, cls=None):
        """Retrieve data from database."""
        new_dict = {}

        rows = self.__session.query(cls).all()
        for row in rows:
            key = f"{row.__class__.__name__}.{row.id}"
            new_dict.update({key: row})
        return new_dict

    def new(self, obj):
        """ Add user object to session.new """
        self.__session.add(obj)

    def rollback(self):
        """ Rollback a session on error. """
        self.__session.rollback()

    def get_by(self, cls, **kwargs):
        """Retrieve an instance with an arbituary fields/values.

        Args:
            cls (class) - The class to filter for an object.
            kwargs (dict) - Dict of fields and value to filter for object.

        Return: The object filter from database
        """
        obj = self.__session.query(cls).filter_by(**kwargs).first()
        return obj

    def get_by_field(self, model: Type, field: str, value: Any) -> object:
        """
        General function to filter a model by it field and class.

        :param model - SQLAlchemy model class (e.g., Lecturer, Student etc.)
        :param field - The colum or attribute to filter for in the model
        :param value - The corresponding value of field to filter on

        :rtype - The first matching object or None if not found
        """
        try:

            # Get the attributes and filter by it corresponding value.
            return self.__session.query(model).filter(
                getattr(model, field) == value
            ).all()
        except AttributeError:
            return None

    def save(self):
        """ Commit change to database """
        self.__session.commit()

    def delete(self, obj):
        """ Delete an instance of a class. """
        self.__session.delete(obj)

    def close(self):
        """ Close database session. """
        self.__session.close()
