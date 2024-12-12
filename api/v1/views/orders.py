#!/usr/bin/python3
"""Handle API request for order module"""
from models.user import User
from flask import abort, jsonify, request
from api.v1.views import api_views
from api.v1.views.utils import role_required
from api.v1.views.utils import bad_request
from models import storage
from sqlalchemy.exc import IntegrityError


@api_views.route("/order-items")
@role_required(["staff"])
def get_rooms(user_role: str, user_id: str):
    """Handle API request to ordered items."""
    users = storage.get_by(User, id=user_id)
    sorted_rooms = sorted(rooms, key=lambda room : room.number)
    if not rooms:
        return jsonify([]), 200
    
    total_available_room = storage.count_by(Room, status="available")
    total_reserved_room = storage.count_by(Room, status="reserved")

    response = {
        "rooms": [room.to_dict() for room in sorted_rooms],
        "rooms_count": {
            "total_room": len(rooms), 
            "total_available_room": total_available_room,
            "total_reserved_room": total_reserved_room
        }
    }
    storage.close()
    return jsonify(response), 200
