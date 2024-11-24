#!/usr/bin/python3
"""Handles password reset from users."""
from api.v1.views import api_views
from flask import abort, request,url_for, jsonify, session
from models import storage
from models.user import User
from flasgger.utils import swag_from
from datetime import timedelta
from api.v1.views.utils import (
    bad_request, read_html_file, send_mail,
    generate_token, is_valid, delete_token
)


@api_views.route("/account/reset-token", methods=["POST"])
@swag_from('../documentation/auth/send_token.yml')
def pwd_reset_token():
    """Send OTP to email for password recovery"""

    # Handle missing field error
    data = request.get_json()

    # Handle Bad Request Error
    required_fields = ["email"]
    response = bad_request(data, required_fields)
    if response:
        return jsonify(response), 400

    # Check if user with email exists
    email = data.get("email")
    user = storage.get_by(User, email=email)
    if not user:
        abort(404)

    token = generate_token()
    name = user.first_name + " " + user.last_name
    file_name = "api/v1/views/auth/mail.html"
    placeholders = {"name": name, "token": token}
    email_content = read_html_file(file_name, placeholders)
    mail_reciever = {"name": name, "email": email}
    is_sent = send_mail(email_content, mail_reciever)
    if is_sent:

        # To be retrieve in /account/reset-password route
        session["email"] = email

        return jsonify({"message": "Token Sent to Email"}), 200
    return jsonify({"error": "Token Delivery Failed"}), 500


@api_views.route("/account/validate-token", methods=["POST"])
@swag_from('../documentation/auth/validate_token.yml')
def validate_token():
    """Check if token is valid"""
    data = request.get_json()
    
    required_fields = ["token"]
    response = bad_request(data, required_fields)
    if response:
        return jsonify(response), 400
    token = data.get("token")

    if is_valid(token):
        return jsonify({
            "status": "Success",
            "message": "Token is Valid"
        }), 200
    else:
        session.pop("email", None)
        abort(401)


@api_views.route("/account/reset-password", methods=["PUT"])
@swag_from('../documentation/auth/update_password.yml')
def update_password():
    """Update new password to database as enter by user."""
    data = request.get_json()

    # Handle 400 error
    required_fields = ["password"]
    response = bad_request(data, required_fields)
    if response:
        return jsonify(response), 400

    email = session.get("password")

    email = data.get("email")
    user = storage.get_by(User, email=email)
    if not user:
        session.pop("email", None)
        abort(404)

    user.password = password
    user.hash_password(password)
    storage.save()
    session.pop("email", None)
    delete_token(token)
    return jsonify({"message": "Password Reset Success"}), 200
