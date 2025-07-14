#!/usr/bin/python3
""" Model for handling views for guest dashboard. """
from app.routes import app_guests
from flask import abort, render_template, request
from app.routes.utils import cache_burst_versioning, get_service


DIRECTORY = "guest"
@app_guests.route("/guest")
def guest_dashbord():
    """"Render template for guest portal."""
    return render_template(
        f"{DIRECTORY}/dashboard.html",
    )


@app_guests.route('/guest/<category>')
def guest_category(category):
    """"Render template for guest portal."""
    data_map = {
        "foods": {
            "title": "🍽️ Food Menu",
            "items": get_service
        },
        "drinks": {
            "title": "🍹 Drinks Menu",
            "items": get_service
        },
        "rooms": {
            "title": "🛏️ Rooms",
            "items": get_service
        },
        "games": {
            "title": "🎮 Games",
            "items": get_service
        },
        "laundry": {
            "title": "🧺 Laundry",
            "items": get_service
        },
    }

    if category not in data_map:
        abort(404)

    items = data_map[category]["items"](category)

    if not items:
        abort(404)

    return render_template(
        f"{DIRECTORY}/service_category.html",
        title=data_map[category]["title"],
        items=items, category=category
    )
