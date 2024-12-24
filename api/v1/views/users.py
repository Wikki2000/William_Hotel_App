#!/usr/bin/python3
"""Handle API request for all staff members"""
from models.user import User
from flask import abort, jsonify, request
from api.v1.views import api_views
from api.v1.views.utils import bad_request, role_required
from models import storage
import base64
#from sqlalchemy.exc import Integrity


@api_views.route("/users")
@role_required(["staff", "ceo", "manager"])
def get_user(user_role: str, user_id: str):
    """Retrieved a staff data using his ID
    """
    user = storage.get_by(User, id=user_id)
    if not user:
        abort(404)
    response = user.to_dict()
    return jsonify({**user.to_dict()})


@api_views.route("/users", methods=["PUT"])
@role_required(["staff", "ceo", "manager"])
def update(user_role: str, user_id: str):
    """Update Staff profile
    """
    data = request.get_json()
    try:
        user = storage.get_by(User, id=user_id)
        if not user:
            abort(404)

        # Convert Base64String of profile photo to Binary
        base64_string = data.get("profile_photo")
        if base64_string.startswith('data:image'):
            base64_string = base64_string.split(',')[1]  # Remove the prefix
            img_data = base64.b64decode(base64_string)  # Decode back to binary.
            data["profile_photo"] = img_data  # Add the binary data to data.

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
