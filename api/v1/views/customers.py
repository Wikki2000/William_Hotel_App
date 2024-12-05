#!/usr/bin/python3
"""Handle API request for Customer module"""
from models.customer import Customer
from flask import abort, jsonify, request
from api.v1.views import api_views
from api.v1.views.utils import role_required
from api.v1.views.utils import bad_request
from models import storage


@api_views.route("/customers", methods=["POST"])
@role_required(["staff"])
def add_customer():
    """Add new customer"""
    data = request.get_json()

    # Handle Bad Request error
    required_fields = ["name"]
    response = bad_request(data, required_fields)
    if response:
        return jsonify(response), 400

    try:
        customer = Customer(**data)
        storage.new(customer)
        storage.save()
    except Exception as e:
        print(str(e))
        return jsonify({"error": "Internal Error Occured"}), 500

