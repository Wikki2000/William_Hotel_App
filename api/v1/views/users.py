#!/usr/bin/python3
"""Handle API request for all staff members"""
from models.user import User
from flask import abort, jsonify, request
from api.v1.views import api_views
from api.v1.views.utils import bad_request, role_required
from models import storage
#from sqlalchemy.exc import Integrity


@api_views.route("/users")
@role_required(["staff", "ceo", "manager"])
def get_user(user_id: str):
    """Retrieved a staff data using his ID
    """
    user = storage.get_by(id=user_id)
    if not user:
        abort(404)
    return jsonify({**user.to_dict()})
