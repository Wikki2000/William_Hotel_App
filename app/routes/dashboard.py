#!/usr/bin/python3
""" Model for handling views for user dashboard. """
from app.routes import app_views
from flask import render_template, request, jsonify
from api.v1.views.utils import role_required
import requests
from uuid import uuid4


@app_views.route(f"/staff-dashboard")
@role_required(["staff"])
def dashboard(user_role: str, user_id: str):
    """Handle views for user dashboard."""
    return render_template("dashboard/user_dashboard.html")
