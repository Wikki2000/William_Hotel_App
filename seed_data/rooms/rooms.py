#!/usr/bin/python3
"""Populate the rooms table in database."""
from models import storage
from models.room import Room
from seed_data.utils import read_image_file, get_file_names


rooms_attr = [
    {
        "name": "standard", "number": "101", "amount": 18750, 
        "image": read_image_file('seed_data/rooms/images/room1.jpg')
    },
    {
        "name": "standard", "number": "102", "amount": 18750,
        "image": read_image_file('seed_data/rooms/images/room2.jpg')
    },
    {
        "name": "standard", "number": "103", "amount": 18750,
        "image": read_image_file('seed_data/rooms/images/room3.jpg')
    },
    {
        "name": "standard", "number": "104", "amount": 18750, 
        "image": read_image_file('seed_data/rooms/images/room4.jpg')
    },
    {
        "name": "standard", "number": "105", "amount": 18750, 
        "image": read_image_file('seed_data/rooms/images/room5.jpg')
    },
    {
        "name": "deluxe", "number": "201", "amount": 21750, 
        "image": read_image_file('seed_data/rooms/images/room6.jpg')
    },
    {
        "name": "deluxe", "number": "202", "amount": 21750, 
        "image": read_image_file('seed_data/rooms/images/room7.jpg')
    },
    {
        "name": "deluxe", "number": "203", "amount": 21750,
        "image": read_image_file('seed_data/rooms/images/room8.jpg')
    },
    {
        "name": "deluxe", "number": "204", "amount": 21750,
        "image": read_image_file('seed_data/rooms/images/room9.jpg')
    },
    {
        "name": "deluxe", "number": "205", "amount": 21750,
        "image": read_image_file('seed_data/rooms/images/room10.jpg')
    },
    {
        "name": "deluxe", "number": "206", "amount": 21750, 
        "image": read_image_file('seed_data/rooms/images/room11.jpg')
    },
    {
        "name": "deluxe", "number": "207", "amount": 21750, 
        "image": read_image_file('seed_data/rooms/images/room12.jpg')
    }
]

obj_list = [Room(**room_atr) for room_atr in rooms_attr]

try:
    storage.add_many(obj_list)
    storage.save()
    print("Room added successfully!")
except Exception as e:
    print(str(e))
finally:
    storage.close()
