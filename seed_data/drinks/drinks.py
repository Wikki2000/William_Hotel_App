#!/usr/bin/python3
"""Populate the drinks table in database."""
from models import storage
from models.drink_category import DrinkCategory
from models.drink import Drink
from seed_data.utils import read_json_file


json_file_path = 'seed_data/drinks/drinks.json';

drink_data = read_json_file(json_file_path)

for drinks in drink_data:
    drink_category = DrinkCategory(category=drinks["category"])
    storage.new(drink_category)
    storage.save()

    for drink in drinks["items"]:
        # Add drink_category id to obj attr.
        drink["drink_category_id"] = drink_category.id
        new_drink = Drink(**drink)
        storage.new(new_drink)
    storage.save()
    storage.close()
print("Drink data successfully inserted!")
