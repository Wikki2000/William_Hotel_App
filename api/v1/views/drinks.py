#!/usr/bin/python3
"""Handle API request for Drink class"""
from models.drink import Drink
from flask import abort, jsonify, request
from api.v1.views import api_views
from api.v1.views.utils import bad_request, role_required
from models import storage
from typing import Dict


@api_views.route("/drinks")
@role_required(["manager", "staff", "admin"])
def get_drinks(user_id: str, user_role: str) -> Dict:
    """Retrieve drinks data stored in databases."""
    try:
        drinks = storage.all(Drink).values()
        if not drinks:
            return jsonify([]), 200
        sorted_drinks = sorted(drinks, key=lambda drink : drink.name)
        return jsonify([drink.to_dict() for drink in sorted_drinks]), 200
    except Exception as e:
        print(str(e))
        return jsonify({"error": "Internal Error Occured"}), 500
    finally:
        storage.close()
