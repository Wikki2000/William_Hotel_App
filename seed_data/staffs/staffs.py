#!/usr/bin/python3
"""Populate the rooms table in database."""
from models import storage
from models.user import User
from seed_data.utils import read_image_file, get_file_names

try:
    attr = {"first_name": "Pope", "last_name": "Love", 
            "username": "pope",
            "password": "12345", "email": "pope@gmail.com",
            "role": "staff", "portfolio": "Waiter"}
    user = User(**attr)
    user.hash_password()
    storage.new(user)
    storage.save()
    print("Staff added successfully!")
except Exception as e:
    print(str(e))
finally:
    storage.close()
