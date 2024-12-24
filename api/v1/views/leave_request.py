#!/usr/bin/python3
"""Handle API request for leave request"""
from models.leave_request import LeaveRequest
from flask import abort, jsonify, request
from api.v1.views import api_views
from api.v1.views.utils import role_required, bad_request
from models import storage


@api_views.route("/request-leave", methods=["POST"])
@role_required(["staff", "manager", "admin"])
def leave_request(user_role: str, user_id: str):
    """Request for leave"""
    data = request.get_json()

    required_fields = ["leave_type", "start_date", "end_date", "description"]
    error_response = bad_request(data, required_fields)
    if error_response:
        return jsonify(error_response), 400

    data["staff_id"] = user_id  # Add staff ID to data

    try:
        req = LeaveRequest(**data)
        storage.new(req)
        storage.save()
        return jsonify({"message": "Loan Request Sent"}), 200
    except Exception as e:
        print(str(e))
        return jsonify({"error": "An Internal Error Occured"}), 500


@api_views.route("/leaves")
@role_required(["staff", "manager", "admin"])
def get_leaves(user_role: str, user_id: str):
    """Retrieve leave request from db."""
    try:
        leaves = storage.all(LeaveRequest).values()
        if not leaves:
            return jsonify([]), 200
        sorted_leaves = sorted(
            leaves, key=lambda leave: leave.updated_at, reverse=True
        )
        return jsonify([leave.to_dict() for leave in sorted_leaves]), 200
    except Exception as e:
        print(str(e))
        return jsonify({"error": "An Internal Error Occored"}), 500
    finally:
        storage.close()


@api_views.route("/leaves/<string:leave_id>")
@role_required(["staff", "manager", "admin"])
def get_leave_by_id(user_role: str, user_id: str, leave_id: str):
    """Retrieve leave data using it ID."""
    try:
        leave = storage.get_by(LeaveRequest, id=leave_id)
        if not leave:
            abort(404)
        return jsonify(leave.to_dict())
    except Exception as e:
        print(str(e))
        abort(500)
