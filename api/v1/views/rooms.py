#!/usr/bin/python3
"""Handle API request for room module"""
from models.room import Room
from flask import abort, jsonify, request
from api.v1.views import api_views
from api.v1.views.utils import role_required, bad_request
from models import storage
from sqlalchemy.exc import IntegrityError


@api_views.route("/rooms")
@role_required(["staff"])
def get_rooms(user_role: str, user_id: str):
    """Retrieved all rooms"""
    rooms = storage.all(Room).values()
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


@api_views.route("/rooms/<string:room_number>")
@role_required(["staff"])
def get_room_by_number(user_role: str, user_id: str, room_number):
    """Retrieved a room by it number."""
    try:
        room = storage.get_by(Room, number=room_number)
        if not room:
            return jsonify([]), 200
        return jsonify(room.to_dict())
    except Exception as e:
        print(str(e))
        return jsonify({"error": "Internal Error Occured"}), 500
    finally:
        storage.close()


@api_views.route("/rooms/<string:room_status>/filter")
@role_required(["staff"])
def filter_rooms(user_role: str, user_id: str, room_status):
    """Filter room base on it's status e.g., available"""
    try:
        rooms = storage.all(Room).values();
        sorted_rooms = sorted(rooms, key=lambda room : room.number)
        if not rooms:
            return jsonify([]), 200
        response = [room.to_dict() for room in sorted_rooms
                    if room.status == room_status]
        return  jsonify(response), 200
    except Exception as e:
        print(str(e))
        return jsonify({"error": "Internal Error Occured"}), 500
    finally:
        storage.close()
