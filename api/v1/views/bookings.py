#!/usr/bin/python3
"""Handle API request for Customer module"""
from models.booking import Booking
from models.customer import Customer
from models.room import Room
from models.user import User
from models.vat import Vat
from flask import abort, jsonify, request
from api.v1.views import api_views
from api.v1.views.utils import bad_request, role_required
from models import storage
from sqlalchemy.exc import IntegrityError


@api_views.route("/bookings")
@role_required(["staff", "manager", "admin"])
def bookings(user_id: str, user_role: str):
    """Fetch booking data"""
    try:
        books = storage.all(Booking).values()
        if not books:
            return jsonify([]), 200

        sorted_books = sorted(
            books, key=lambda book : book.updated_at, reverse=True
        )
        return jsonify([booking.to_dict() for booking in sorted_books]), 200
    except Exception as e:
        print(str(e))
        return jsonify({"error": "Internal Error Occured"}), 500
    finally:
        storage.close()


@api_views.route("/bookings/<string:room_number>/booking-data")
@role_required(["staff", "manager", "admin"])
def booking_data(user_id: str, user_role: str, room_number):
    """Fetch booking data of a particular room"""
    try:
        room = storage.get_by(Room, number=room_number)
        if not room:
            abort(404)

        booking = storage.get_by(Booking, room_id=room.id)

        if not booking:
            return jsonify({
                "room": room.to_dict(), "booking": None,
                "user": None, "customer": None
            }), 200

        # Check if room has been checkout by staff
        checkout_by_dict = (
            None if not booking.checkout_by
            else book.checkout_by.to_dict()
        )

        return jsonify({
            "booking": booking.to_dict(),
            "room": room.to_dict(),
            "customer": room.book.customer.to_dict(),
            "checkin_by": room.book.checkin_by.to_dict(),
            "checkout_by": checkout_by_dict
        }), 200
    except Exception as e:
        print(str(e))
        return jsonify({"error": "An Internal Error Occured"}), 500
    finally:
        storage.close()


@api_views.route("/rooms/<string:room_number>/checkout", methods=["PUT"])
@role_required(["staff"])
def check_out(user_id: str, user_role: str, room_number: str):
    """Check out customer from a room."""
    room = storage.get_by(Room, number=room_number)
    if room.status == "available":
        return jsonify({"error": "Room Already Available"}), 409
    elif room.book.checkout_by_id:
        first_name = room.book.checkout_by.first_name
        last_name = room.book.checkout_by.last_name
        return jsonify({"error": f"{first_name} {last_name}"}), 409

    room.status = "available"
    room.book.is_paid = "yes"
    room.book.checkout_by_id = user_id
    storage.save()
    return jsonify({"message": "Checkout Successful"}), 201


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
            "expiration": str(booking_data.get("expiration")),
            "is_paid": booking_data.get("is_paid"),
            "customer_id": customer.id,
            "guest_number": booking_data.get("guest_number"),
            "room_id": room.id, "checkin_by_id": user_id
    }
    try:
        book = Booking(**book_attr)
        storage.new(book)

        room.status = "occupied"   # Cheange room status once book
        storage.save()

        # Take out vat from amount
        vat_amount = (7.5 / 100) * room.amount
        vat = Vat(amount=vat_amount, booking_id=book.id)
        storage.new(vat)
        storage.save()

        return jsonify({"message": "Booking Successfully"}), 200
    except Exception as e:
        print(str(e))
        return jsonify({
            "error": "Internal Error Occured Booking Room"
            }), 500
    finally:
        storage.close()
