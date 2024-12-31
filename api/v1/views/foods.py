#!/usr/bin/python3
"""Handle API request for Food class"""
from models.food import Food
from flask import abort, jsonify, request
from api.v1.views import api_views
from api.v1.views.utils import bad_request, role_required
from models import storage
from typing import Dict


@api_views.route("/foods")
@role_required(["manager", "staff", "admin"])
def get_foods(user_id: str, user_role: str) -> Dict:
    """Retrieve foods data stored in databases."""
    try:
        foods = storage.all(Food).values()
        if not foods:
            return jsonify([]), 200
        sorted_foods = sorted(foods, key=lambda food : food.name)
        return jsonify([food.to_dict() for food in sorted_foods]), 200
    except Exception as e:
        print(str(e))
        return jsonify({"error": "Internal Error Occured"}), 500
    finally:
        storage.close()
