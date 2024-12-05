#!/usr/bin/python3
"""Handle API request for room module"""
from models.room import Room
from flask import abort, jsonify, request
from api.v1.views import api_views
from api.v1.views.utils import role_required
from api.v1.views.utils import bad_request
from models import storage
from sqlalchemy.exc import IntegrityError


@api_views.route("/rooms")
@role_required(["staff"])
def get_rooms(user_role, user_id):
    """Retrieved all rooms"""
    rooms = storage.all(Room).values()
    sorted_rooms = sorted(rooms, key=lambda room : room.room_number)
    if not rooms:
        return jsonify([]), 200
    
    total_available_room = storage.count_by(Room, is_available=True)
    total_reserved_room = storage.count_by(Room, is_reserved=True)

    response = {
        "rooms": [room.to_dict() for room in sorted_rooms],
        "rooms_count": {
            "total_room": len(rooms), 
            "total_available_room": total_available_room,
            "total_reserved_room": total_reserved_room
        }
    }
    return jsonify(response), 200


@api_views.route("/rooms/<string:room_number>")
@role_required(["staff"])
def get_room_by_number(room_number):
    """Retrieved a room by it number."""
    print(room_number)
    room = storage.get_by(Room, room_number=int(room_number))
    if not room:
        return jsonify([]), 200
    return jsonify(room.to_dict()), 200
