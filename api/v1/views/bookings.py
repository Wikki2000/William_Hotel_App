#!/usr/bin/python3
"""Handle API request for Customer module"""
from models.booking import Booking
from models.customer import Customer
from models.room import Room
from models.user import User
from flask import abort, jsonify, request
from api.v1.views import api_views
from api.v1.views.utils import bad_request, role_required
from models import storage
from sqlalchemy.exc import IntegrityError


@api_views.route("/bookings")
@role_required(["staff", "manager", "admin"])
def booking_data(user_id: str, user_role: str):
    """Fetch booking data"""
    bookings = storage.all(Booking).values()
    if not bookings:
        return jsonify([]), 200
    return jsonify([book.to_dict() for book in bookings]), 200


@api_views.route("/rooms/<string:room_number>/book", methods=["POST"])
@role_required(["staff"])
def book_room(user_id: str, user_role: str, room_number: str):
    """Book a room"""
    data = request.get_json()

    # Handle Bad Request error
    if not data:
        return jsonify({"error": "Bad Request"}), 400

    customer_data = data.get("customer")

    booking_data = data.get("book")

    # Register customer if not exist's
    customer = storage.get_by(
        Customer, id_number=customer_data.get("id_number")
    )
    if not customer:
        customer = Customer(**customer_data)
        storage.new(customer)
        storage.save()

    # Change room
    room = storage.get_by(Room, number=room_number)
    if not room:
        abort(404)
    room.status = "occupied"
    storage.save()

    book_attr = {
        "duration": booking_data.get("duration"),
        "expiration": booking_data.get("expiration"),
        "is_paid": booking_data.get("is_paid"),
        "customer_id": customer.id,
        "guest_number": booking_data.get("guest_number"),
        "room_id": room.id, "user_id": user_id
    }
    try:
        book = Booking(**book_attr)
        storage.new(book)

        room.status = "occupied"   # Cheange room status once book

        storage.save()
        storage.close()
        return jsonify({"message": "Booking Successfully"}), 200
    except Exception as e:
        print(str(e))
        return jsonify({
            "error": "Internal Error Occured Booking Room"
        }), 500
    finally:
        storage.close()
