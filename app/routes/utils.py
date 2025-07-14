#!/usr/bin/python3
"""Define function needed accross different files."""
from uuid import uuid4
from models.room import Room
from models.drink import Drink
from models.food import Food
from models.game import Game
from models.laundry import Laundry
from models import storage

def cache_burst_versioning(version_id="v1"):
    """Version ID for static files cache bursting."""
    return version_id if version_id else str(uuid4())


def get_service(category):
    models = {
        "foods": Food, "drinks": Drink,
        "games": Game, "laundry": Laundry
    }

    if category not in models:
        return None

    service = storage.all_get_by(models.get(category))
    sorted_services = sorted(service, key=lambda service : service.name)
    items = [item.to_dict() for item in sorted_services]
    return items
