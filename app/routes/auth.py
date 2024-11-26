#!/usr/bin/python3
"""Handle Views of Authentication."""
from flask import render_template, request
from app.routes import app_views
from uuid import uuid4


AUTH_TEMPLATES_DIRECTORY = "/auth"


@app_views.route("/account/login")
def login():
    """Render template to login user."""
    return render_template(
        f"{AUTH_TEMPLATES_DIRECTORY}/login.html", cache_id=uuid4()
    )

@app_views.route("/account/forgot-password")
def forgot_pwd():
    """Render Template to get token email for fogot password"""
    return render_template(
        f"{AUTH_TEMPLATES_DIRECTORY}/forgot_password.html", cache_id=uuid4()
    )


@app_views.route("/account/otp")
def get_otp():
    """Render template for OTP"""

    email = request.args.get("email")
    data = {"email": email, "cache_id": uuid4()};
    return render_template(
        f"{AUTH_TEMPLATES_DIRECTORY}/otp.html", **data
    )

@app_views.route("/account/reset-password")
def reset_password():
    """Render template to reset password"""
    return render_template(
        f"{AUTH_TEMPLATES_DIRECTORY}/reset_password.html", cache_id=uuid4()
    )
