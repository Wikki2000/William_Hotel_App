#!/usr/bin/python3
""" Model for handling views for user dashboard. """
from app.routes import app_views
from flask import abort, render_template, request, jsonify
from api.v1.views.utils import role_required
import requests
from uuid import uuid4

API_BASE_URL = 'http://127.0.0.1:5002/api/v1'


@app_views.route(f"/dashboard")
@role_required(["staff"])
def dashboarde(user_role: str, user_id: str):
    """"Render templates for user dashboard"""
    if user_role == "staff":
        return render_template("dashboard/staff_dashboard.html")
    elif user_role == "manager":
        return render_template("dashboard/manager_dashboard.html")
    elif user_role == "ceo":
        return render_template("dashboard/ceo_dashboard.html")
    else:
        abort(403)
