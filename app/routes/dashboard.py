#!/usr/bin/python3
""" Model for handling views for user dashboard. """
from app.routes import app_views
from flask import render_template, request, jsonify
from api.v1.views.utils import role_required
import requests
from uuid import uuid4


@app_views.route(f"/dashboard")
@role_required(["dmin"])
def dashboard(user_id: str):
    """Handle views for user dashboard."""
    return jsonify({"user_id": user_id}), 200
