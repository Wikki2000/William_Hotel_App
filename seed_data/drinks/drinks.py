#!/usr/bin/python3
"""Populate the drinks table in database."""
from models import storage
from models.drink import Drink
from seed_data.utils import read_json_file


json_file_path = 'seed_data/drinks/drinks.json';

drink_data = read_json_file(json_file_path)

for drink in drink_data:
    new_drink = Drink(**drink)
    storage.new(new_drink)
storage.save()
storage.close()
print("Drink data successfully inserted!")
