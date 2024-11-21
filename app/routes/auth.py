#!/usr/bin/python3
"""Handle Views of Authentication."""
from flask import render_template, session
from app.routes import app_views


AUTH_TEMPLATES_DIRECTORY = "/auth"


@app_views.route("/account/login")
def login():
    """Render template to login user."""
    return render_template(f"{AUTH_TEMPLATES_DIRECTORY}/login.html")

