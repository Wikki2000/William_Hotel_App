#!/usr/bin/python3
"""Populate the foods table in database."""
from models import storage
from models.laundry import Laundry
from seed_data.utils import read_json_file, read_image_file


#json_file_path = 'seed_data/games/games.json';

laundry_data = [
    {
        "name": "Agbada (Complete)",
        "amount": 3500,
        "image": read_image_file("seed_data/laundry/images/agbada.jpeg")
    },
    {
        "name": "Native",
        "amount": 2500,
        "image": read_image_file("seed_data/laundry/images/native.jpeg")
    },
    {
        "name": "Shirt",
        "amount": 700,
        "image": read_image_file("seed_data/laundry/images/shirt.jpeg")
    },
    {
        "name": "Round Neck",
        "amount": 500,
        "image": read_image_file("seed_data/laundry/images/round_neck.jpeg")
    },
    {
        "name": "Trouser",
        "amount": 800,
        "image": read_image_file("seed_data/laundry/images/trouser.jpeg")
    },
    {
        "name": "Polo",
        "amount": 500,
        "image": read_image_file("seed_data/laundry/images/polo.jpeg")
    },
    {
        "name": "Suite (Complete)",
        "amount": 1000,
        "image": read_image_file("seed_data/laundry/images/suite.jpeg")
    },
    {
        "name": "Pajamas",
        "amount": 1000,
        "image": read_image_file("seed_data/laundry/images/pajamas.jpeg")
    },
    {
        "name": "Sneakers",
        "amount": 2500,
        "image": read_image_file("seed_data/laundry/images/sneaker.jpg")
    },
]

#game_data = read_json_file(json_file_path)
obj_list = [Laundry(**laundry) for laundry in laundry_data]
storage.add_many(obj_list)
storage.save()
print("Laundry Added successfully !")
