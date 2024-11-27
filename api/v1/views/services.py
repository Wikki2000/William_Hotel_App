#!/usr/bin/python3
"""Handle API request for service module"""
from models.service import Service
from flask import abort, jsonify, request
from api.v1.views import api_views
from api.v1.views.utils import bad_request, role_required
from models import storage


@api_views.route("/services", methods=["POST"])
#@role_required(["admin", "manager"])
def add_room():
    """Add new room"""
    data = request.get_json()

    # Handle Bad Request error
    required_fields = ["name"]
    response = bad_request(data, required_fields)
    if response:
        return jsonify(response), 400

    try:
        service = Service(**data)
        storage.new(service)
        storage.save()
        return jsonify({"message": "Service Added Successfully"}), 200
    except Exception as e:
        print(str(e))
        return jsonify({"error": "Internal Error Occured"}), 500
