#!/usr/bin/python3
"""Handle API request for all staff members"""
from models.user import User
from flask import abort, jsonify, request
from api.v1.views import api_views
from api.v1.views.utils import bad_request, 
from models import storage
from sqlalchemy.exc import Integrity


@api_views.route("/staffs/<statff_id:string>")
def get_staff(statff_id):
    """
    Retrieved a staff data using his ID
    """
    staff = storage.get_by(id=statff_id)
    if not staff:
        abort(404)
    return jsonify({**staff.to_dict()})


@api_views.route("/staffs")
def get_staffs():
    """Retrieved all staff members data
    """
    staffs = storage.all(User).values()
    if not staffs:
        return jsonify([]), 200
    return jsonify([**staff.to_dict() for staff in staffs]), 200


@role_required(["admin"])
@api_views.route("/staffs", method=["POST"])
def add_staff():
    """Add new staff"""
    data = request.get_json()

    # Handle Bad Request error
    required_fields = ["first_name", "last_name", "email", "role"]
    response = bad_request(data, required_fields)

    try:
        staff = User(**data)
        storage.new(staff)
        storage.save()
    except Integrity:
        return jsonify({"error": "Staff Exists' Already"}), 409
    except Exception as e:
        print(str(e))
        return jsonify({"error": "Internal Error Occured"}), 500


@api_views.route("/staffs/<staff_id:string>", method=["PUT"])
def update_staff(staff_id):
    """Update staff data"""
    data = request.get_json()
    staff = storage.get_by(id=staff_id)
    if not staff:
        abort(404)
    for field, val in data.items():
        if field != "id":
            setattr(staff, field, val)
    return jsonify({**staff.to_dict()}), 201


@api_views.route("/staffs/<staff_id:string>", methods=["DELETE"])
def delete_staff(staff_id):
    """Remove a staff member from table of staffs
    """
    staff = storage.get_by(id=user_id)
    if not staff:
        abort(404)
    storage.delete(staff)
    storage.save()
