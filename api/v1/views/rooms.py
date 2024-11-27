#!/usr/bin/python3
"""Handle API request for room module"""
from models.room import Room
from models.service import Service
from flask import abort, jsonify, request
from api.v1.views import api_views
from api.v1.views.utils import bad_request
from models import storage
from sqlalchemy.exc import IntegrityError


@api_views.route("/services/<service_id:string>/add-room", method=["POST"])
@role_required(["admin", "manager"])
def add_room(service_id: str):
    """Add new room"""
    data = request.get_json()

    # Handle Bad Request error
    required_fields = ["room_type", "room_number", "unit_cost"]:
    response = bad_request(data, required_fields)
    if response:
        return jsonify(response), 400

    # Check if the service exists
    service = storage.get_by(id=service_id)
    if not service:
        abort(404)

    data["service_id"] = service_id #  Add service_id to data

    try:
        room = Room(**data)
        storage.new(customer)
        storage.save()
        return jsonify({"message": "Room Added Successfully"}), 200
    except IntegrityError:
        return jsonify({"error": "Room number exist's already"}), 409
    except Exception as e:
        print(str(e))
        return jsonify({"error": "Internal Error Occured"}), 500

