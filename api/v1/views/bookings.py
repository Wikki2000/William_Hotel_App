#!/usr/bin/python3
"""Handle API request for Customer module"""
from models.booking import Booking
from models.customer import Customer
from models.room import Room
from models.user import User
from models.sale import DailySale
from flask import abort, jsonify, request
from api.v1.views import api_views
from api.v1.views.utils import bad_request, role_required
from models import storage
from sqlalchemy.exc import IntegrityError
from datetime import datetime, date


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

        response = [{
            "booking": booking.to_dict(),
            "guest": booking.customer.to_dict(),
            "checkin_by": booking.checkin_by.to_dict(),
            "room": booking.room.to_dict(),
            "checkout_by": (
                None if not booking.checkout_by
                else booking.checkout_by.to_dict()
            )} for booking in sorted_books]
        return jsonify(response), 200
    except Exception as e:
        print(str(e))
        return jsonify({"error": "Internal Error Occured"}), 500
    finally:
        storage.close()


@api_views.route("/bookings/<string:start_date>/<string:end_date>/get")
@role_required(["manager", "admin"])
def get_bookings_by_date(
    user_role: str, user_id: str, start_date: str, end_date: str
):
    """Retrieve bookings at any interval of time."""
    start_date_obj = datetime.strptime(start_date, "%Y-%m-%d")
    end_date_obj = datetime.strptime(end_date, "%Y-%m-%d")

    # Retrieve expenditure at an interval of time
    bookings = storage.get_by_date(
        Booking, start_date_obj, end_date_obj, "updated_at"
    )

    # Handle case were there is no expenditure
    if not bookings:
        return jsonify([]), 200

    sorted_bookings = sorted(
        bookings,
        key=lambda booking : booking.updated_at,
        reverse=True
    )

    accumulated_sum = sum(booking.room.amount for booking in sorted_bookings)
    response = {
        "bookings": [{
            "booking": booking.to_dict(),
            "guest": booking.customer.to_dict(),
            "checkin_by": booking.checkin_by.to_dict(),
            "room": booking.room.to_dict(),
            "checkout_by": (
                None if not booking.checkout_by
                else booking.checkout_by.to_dict()
            )} for booking in sorted_bookings
        ],
        "accumulated_sum": accumulated_sum
    }
    return jsonify(response), 200


@api_views.route("/bookings/<string:booking_id>/booking-details")
@role_required(["staff", "manager", "admin"])
def booking_data_by_id(user_id: str, user_role: str, booking_id: str):
    """Fetch booking data of a particular room"""
    try:
        book = storage.get_by(Booking, id=booking_id)
        if not book:
            abort(404)

        if not book:
            return jsonify({
                "room": book.room.to_dict(), "booking": None,
                "checkin_by": None, "checkout_by": None
            }), 200

        # Check if room has been checkout by staff
        checkout_by_dict = (
            None if not book.checkout_by
            else book.checkout_by.to_dict()
        )

        return jsonify({
            "booking": book.to_dict(),
            "room": book.room.to_dict(),
            "customer": book.customer.to_dict(),
            "checkin_by": book.checkin_by.to_dict(),
            "checkout_by": checkout_by_dict
        }), 200
    except Exception as e:
        print(str(e))
        return jsonify({"error": "An Internal Error Occured"}), 500
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

        # Get booking currently in use, so as to get currently lodged guest.
        book = storage.get_by(Booking, room_id=room.id, is_use=True)

        if not book:
            return jsonify({
                "room": room.book.to_dict(), "booking": None,
                "checkin_by": None, "checkout_by": None
            }), 200

        # Check if room has been checkout by staff
        checkout_by_dict = (
            None if not book.checkout_by
            else book.checkout_by.to_dict()
        )

        return jsonify({
            "booking": book.to_dict(),
            "room": room.to_dict(),
            "customer": book.customer.to_dict(),
            "checkin_by": book.checkin_by.to_dict(),
            "checkout_by": checkout_by_dict
        }), 200
    except Exception as e:
        print(str(e))
        return jsonify({"error": "An Internal Error Occured"}), 500
    finally:
        storage.close()


@api_views.route("/rooms/<string:booking_id>/checkout", methods=["PUT"])
@role_required(["staff", "manager", "admin"])
def check_out(user_id: str, user_role: str, booking_id: str):
    """Check out customer from a room."""
    booking = storage.get_by(Booking, id=booking_id)
    if not booking:
        abort(404)

    room = booking.room

    if room.status == "available":
        return jsonify({"error": "Room Already Available"}), 409
    elif booking.checkout_by_id:
        first_name = booking.checkout_by.first_name
        last_name = booking.checkout_by.last_name
        return jsonify({"error": f"{first_name} {last_name}"}), 409

    room.status = "available"
    booking.is_paid = "yes"
    booking.checkout_by_id = user_id  # Record staff that checkout guest
    booking.customer.is_guest = False  # No more guest once checkout
    booking.is_use = False

    # Clear all bill once guest is checkout
    for order in booking.customer.orders:
        order.is_paid = True
        order.cleared_by_id = user_id

    storage.save()
    return jsonify({"message": "Checkout Successful"}), 201


@api_views.route("/bookings/<booking_id>/edit", methods=["PUT"])
@role_required(["staff", "manager", "admin"])
def update_booking_data(user_id: str, user_role: str, booking_id: str):
    """Update guest data use in booking"""
    data = request.get_json()
    required_fields = ["customer", "booking", "room"]
    error_response = bad_request(data, required_fields)
    if error_response:
        return jsonify(error_response), 400

    booking = storage.get_by(Booking, id=booking_id)
    if not booking:
        abort(404)

    booking_data = data.get("booking")
    customer_data = data.get("customer")
    room_data = data.get("room")
    customer = booking.customer

    # Change new room statis to occupied
    new_room = storage.get_by(Room, number=room_data.get("room_number"))
    new_room.status = "occupied"

    # Update booking data
    for key, val in booking_data.items():
        setattr(booking, key, val)
    booking.checkin_by_id = user_id  # Update with staff that made changes
    booking.updated_at = datetime.utcnow()
    
    booking.room.status = "available"  # Change old room occupied to available

    booking.room_id = new_room.id  # Book new room to guest

    # Update customer data
    for key, val in customer_data.items():
        setattr(customer, key, val)
    customer.updated_at = datetime.utcnow()

    storage.save()
    storage.close()
    return jsonify({"message": "Booking Data Updated Successfully"}), 201


@api_views.route("/rooms/<string:room_number>/book", methods=["POST"])
@role_required(["staff", "manager", "admin"])
def book_room(user_id: str, user_role: str, room_number: str):
    """Book a room"""
    data = request.get_json()

    # Handle Bad Request error
    if not data:
        return jsonify({"error": "Bad Request"}), 400

    user = storage.get_by(User, id=user_id)
    room = storage.get_by(Room, number=room_number)
    if not user or not room:
        abort(404)

    customer_data = data.get("customer")

    booking_data = data.get("book")

    # Add new daily transaction if exists else increase sum by existing one
    today_date = date.today()
    transaction = storage.get_by(
        DailySale, entry_date=today_date
    )

    if not transaction:
        transaction = DailySale(entry_date=today_date, amount=room.amount)
        storage.new(transaction)
    else:
        transaction.amount += room.amount

    customer = Customer(**customer_data)
    storage.new(customer)
    customer.is_guest = True
    storage.save()


    # Ensure that can't book room already in use
    if room.status == "occupied" or room.status == "reserved":
        return jsonify({"error": f"Room {room.number} is occupied"}), 409

    book_attr = {
            "checkin": booking_data.get("checkin"),
            "checkout": booking_data.get("checkout"),
            "duration": booking_data.get("duration"),
            "checkout": str(booking_data.get("expiration")),
            "is_paid": booking_data.get("is_paid"),
            "customer_id": customer.id, "checkin_by_id": user.id,
            "guest_number": booking_data.get("guest_number"),
            "room_id": room.id, "amount": booking_data.get("amount"),
    }
    try:
        book = Booking(**book_attr)
        storage.new(book)
        room.status = "occupied"   # Cheange room status once book
        storage.save()

        return jsonify({"message": "Booking Successfully"}), 200
    except Exception as e:
        print(str(e))
        return jsonify({
            "error": "Internal Error Occured Booking Room"
        }), 500
    finally:
        storage.close()
