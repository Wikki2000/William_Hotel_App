#!/usr/bin/python3
"""Handle API request for all staff members"""
from models.user import User
from flask import abort, jsonify, request
from api.v1.views import api_views
from api.v1.views.utils import bad_request, role_required, convert_to_binary
from models import storage


@api_views.route("/members/<string:member_id>")
@role_required(["staff", "admin", "manager"])
def get_user(user_role: str, user_id: str, member_id: str):
    """Retrieved a staff data using his ID
    """
    member = storage.get_by(User, id=member_id)
    if not member:
        abort(404)
    return jsonify(member.to_dict())


@api_views.route("/users", methods=["PUT"])
@role_required(["staff", "admin", "manager"])
def update_profile(user_role: str, user_id: str):
    """Update Staff profile
    """
    data = request.get_json()
    try:
        user = storage.get_by(User, id=user_id)
        if not user:
            abort(404)

        # Convert Base64String of profile photo to Binary
        base64_string = data.get("profile_photo")
        data["profile_photo"] = convert_to_binary(base64_string)

        for key, val in data.items():
            if val:
                setattr(user, key, val)
        storage.save()
        return jsonify({"message": "Updated Successfully"}), 201
    except Exception as e:
        print(str(e))
        return jsonify({"error": "An Error Occured"}), 500
    finally:
        storage.close()
