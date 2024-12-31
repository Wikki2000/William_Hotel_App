#!/usr/bin/python3
"""Handle API request for room module"""
from models.room import Room
from flask import abort, jsonify, request
from api.v1.views import api_views
from api.v1.views.utils import role_required, bad_request, convert_to_binary
from models import storage
from sqlalchemy.exc import IntegrityError


@api_views.route("/rooms", methods=["POST"])
@role_required(["manager", "admin"])
def add_room(user_role: str, user_id: str):
    """Add new room"""
    data = request.get_json()

    required_fields = ["name", "amount", "number"]
    error_response = bad_request(data, required_fields)
    if error_response:
        return jsonify(error_response), 400

    data["amount"] = float(data.get("amount"))
    data["image"] = convert_to_binary(data.get("image"))

    try:
        room = Room(**data)
        storage.new(room)
        storage.save()
        return jsonify({"message": "Room Added Successfully"}), 200
    except IntegrityError:
        error_message = f"Room Exist's Already"
        return jsonify({"error": error_message}), 409
    except Exception as e:
        print(str(e))
        abort(500)
    finally:
        storage.close()


@api_views.route("/rooms/<room_id>/edit", methods=["PUT"])
@role_required(["admin", "manager"])
def update_room(user_role: str, user_id: str, room_id: str):
    """Update Room Data
    """
    data = request.get_json()
    try:
        room = storage.get_by(Room, id=room_id)
        if not room:
            abort(404)

        # Convert Base64String of profile photo to Binary
        base64_string = data.get("image")
        data["image"] = convert_to_binary(base64_string)
        data["amount"] = float(data.get("amount"))

        for key, val in data.items():
            if val:
                setattr(room, key, val)
        storage.save()
        return jsonify({"message": "Updated Successfully"}), 201
    except Exception as e:
        print(str(e))
        return jsonify({"error": "An Error Occured"}), 500
    finally:
        storage.close()


@api_views.route("/rooms/<room_id>/delete", methods=["DELETE"])
@role_required(["manager", "admin"])
def delete_room(user_role: str, user_id: str, room_id: str):
    """Delete room by it ID's."""
    try:
        room = storage.get_by(Room, id=room_id)
        if not room:
            abort(404)
        storage.delete(room)
        storage.save()
        return jsonify({"name": room.name, "number": room.number}), 200
    except Exception as e:
        print(str(e))
        abort(500)
    finally:
        storage.close()


@api_views.route("/rooms")
@role_required(["staff", "manager", "admin"])
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
@role_required(["staff", "manager", "admin"])
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


@api_views.route("/rooms/<string:room_id>/room-data")
@role_required(["staff", "manager", "admin"])
def get_room_by_id(user_role: str, user_id: str, room_id):
    """Retrieved a room by it ID."""
    try:
        room = storage.get_by(Room, id=room_id)
        if not room:
            abort(404)
        return jsonify(room.to_dict()), 200
    except Exception as e:
        print(str(e))
        return jsonify({"error": "Internal Error Occured"}), 500
    finally:
        storage.close()


@api_views.route("/rooms/<string:room_status>/filter")
@role_required(["staff", "manager", "admin"])
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
