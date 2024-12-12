#!/usr/bin/python3
"""Populate the foods table in database."""
from models import storage
from models.food import Food
from seed_data.utils import read_json_file


json_file_path = 'seed_data/foods/foods.json';

food_data = read_json_file(json_file_path)
obj_list = [Food(**food) for food in food_data]
storage.add_many(obj_list)
storage.save()
print("Food data successfully inserted!")
