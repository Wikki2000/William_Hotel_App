#!/usr/bin/python3
"""Handle API request for room module"""
from models.room import Room
from models.booking import Booking
from models.customer import Customer
from flask import abort, jsonify, request
from api.v1.views import api_views
from api.v1.views.utils import role_required, bad_request, convert_to_binary
from models import storage
from sqlalchemy.exc import IntegrityError
from datetime import datetime


@api_views.route("/rooms", methods=["POST"])
@role_required(["manager", "admin"])
def add_room(user_role: str, user_id: str):
    """Add new room"""
    data = request.get_json()

    required_fields = ["name", "amount", "number"]
    error_response = bad_request(data, required_fields)
    if error_response:
        return jsonify(error_response), 400

    data["amount"] = float(data.get("amount"))
    data["image"] = convert_to_binary(data.get("image"))

    try:
        room = Room(**data)
        storage.new(room)
        storage.save()
        return jsonify({"message": "Room Added Successfully"}), 200
    except IntegrityError:
        error_message = f"Room {data.get('number')} Exist's Already"
        return jsonify({"error": error_message}), 409
    except Exception as e:
        print(str(e))
        abort(500)
    finally:
        storage.close()


@api_views.route("/occupied-room-number")
@role_required(["staff", "manager", "admin"])
def get_available_room_numbers(user_role: str, user_id: str):
    """Get numbers associated with rooms."""
    rooms = storage.all(Room).values()
    if not rooms:
        return jsonify([]), 200

    sorted_rooms = sorted(rooms, key=lambda room : room.number)
    response = [room.number for room in sorted_rooms
                    if room.status == "occupied"]
    return jsonify(response), 200


@api_views.route("/room-numbers")
@role_required(["manager", "admin", "staff"])
def room_number(user_role: str, user_id: str):
    """Get all room numbers of available room"""
    rooms = storage.all(Room).values()
    if not rooms:
        return jsonify([]), 200

    sorted_rooms = sorted(rooms, key=lambda room : room.number)
    return jsonify([room.number for room in sorted_rooms
                    if room.status == "available"])


@api_views.route("/rooms/<room_id>/edit", methods=["PUT"])
@role_required(["admin", "manager"])
def update_room(user_role: str, user_id: str, room_id: str):
    """Update Room Data
    """
    data = request.get_json()
    try:
        room = storage.get_by(Room, id=room_id)
        if not room:
            abort(404)

        # Convert Base64String of profile photo to Binary
        base64_string = data.get("image")
        data["image"] = convert_to_binary(base64_string)
        data["amount"] = float(data.get("amount"))

        for key, val in data.items():
            if val:
                setattr(room, key, val)
        storage.save()
        return jsonify({"message": "Updated Successfully"}), 201
    except Exception as e:
        print(str(e))
        return jsonify({"error": "An Error Occured"}), 500
    finally:
        storage.close()


@api_views.route("/rooms/<room_id>/delete", methods=["DELETE"])
@role_required(["manager", "admin"])
def delete_room(user_role: str, user_id: str, room_id: str):
    """Delete room by it ID's."""
    try:
        room = storage.get_by(Room, id=room_id)
        if not room:
            abort(404)
        storage.delete(room)
        storage.save()
        return jsonify({"name": room.name, "number": room.number}), 200
    except Exception as e:
        print(str(e))
        abort(500)
    finally:
        storage.close()


@api_views.route("/rooms")
@role_required(["staff", "manager", "admin"])
def get_rooms(user_role: str, user_id: str):
    """Retrieved all rooms"""
    rooms = storage.all(Room).values()
    sorted_rooms = sorted(rooms, key=lambda room : room.number)
    if not rooms:
        return jsonify([]), 200

    total_available_room = storage.count_by(Room, status="available")
    total_reserved_room = storage.count_by(Room, status="reserved")

    response = {
        "rooms": [room.to_dict() for room in sorted_rooms],
        "rooms_count": {
            "total_room": len(rooms),
            "total_available_room": total_available_room,
            "total_reserved_room": total_reserved_room
        }
    }
    storage.close()
    return jsonify(response), 200


@api_views.route("/room-number")
@role_required(["staff", "manager", "admin"])
def get_room_numbers(user_role: str, user_id: str):
    """Get numbers associated with rooms."""
    rooms = storage.all(Room).values()
    if not rooms:
        return jsonify([]), 200

    return jsonify(sorted([room.number for room in rooms])), 200


@api_views.route("/rooms/<string:room_number>/guest-occupied")
@role_required(["staff", "manager", "admin"])
def guest_lodged_in_room(user_role: str, user_id: str, room_number: str):
    """Get guest lodged in a room"""
    room = storage.get_by(Room, number=room_number)
    if not room:
        abort(404)

    room_101_use_booking = storage.get_by(
        Booking, room_id=room.id, is_use=True
    )

    return jsonify(room_101_use_booking.customer.to_dict()), 200


@api_views.route("/rooms/<string:room_number>")
@role_required(["staff", "manager", "admin"])
def get_room_by_number(user_role: str, user_id: str, room_number):
    """Retrieved a room by it number."""
    try:
        room = storage.get_by(Room, number=room_number)
        if not room:
            return jsonify([]), 200
        return jsonify(room.to_dict())
    except Exception as e:
        print(str(e))
        return jsonify({"error": "Internal Error Occured"}), 500
    finally:
        storage.close()


@api_views.route("/rooms/<string:room_id>/room-data")
@role_required(["staff", "manager", "admin"])
def get_room_by_id(user_role: str, user_id: str, room_id):
    """Retrieved a room by it ID."""
    try:
        room = storage.get_by(Room, id=room_id)
        if not room:
            abort(404)
        return jsonify(room.to_dict()), 200
    except Exception as e:
        print(str(e))
        return jsonify({"error": "Internal Error Occured"}), 500
    finally:
        storage.close()


@api_views.route("/rooms/<string:room_status>/filter")
@role_required(["staff", "manager", "admin"])
def filter_rooms(user_role: str, user_id: str, room_status):
    """Filter room base on it's status e.g., available"""
    try:
        rooms = storage.all(Room).values();
        sorted_rooms = sorted(rooms, key=lambda room : room.number)
        if not rooms:
            return jsonify([]), 200
        response = [room.to_dict() for room in sorted_rooms
                    if room.status == room_status]
        return  jsonify(response), 200
    except Exception as e:
        print(str(e))
        return jsonify({"error": "Internal Error Occured"}), 500
    finally:
        storage.close()


@api_views.route("/rooms/<string:room_number>/booking-data")
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
        }), 200
    except Exception as e:
        print(str(e))
        return jsonify({"error": "An Internal Error Occured"}), 500
    finally:
        storage.close()


@api_views.route(
    "/rooms/<room_id>/customer/<customer_id>/checkout", methods=["PUT"]
)
@role_required(["staff", "manager", "admin"])
def check_out(user_id: str, user_role: str, room_id: str, customer_id: str):
    """Check out customer from a room."""
    customer = storage.get_by(Customer, id=customer_id)
    room = storage.get_by(Room, id=room_id)
    if not customer or not room:
        abort(404)

    room.status = "available"
    customer.is_guest = False  # No more guest once checkout

    # Clear all bill once guest is checkout
    for order in customer.orders:
        order.is_paid = True
        order.updated_at = datetime.utcnow()

        # Ensure that no two staff can clear guest ordered bills from room.
        if not order.cleared_by_id:
            order.cleared_by_id = user_id

    for booking in customer.books:
        booking.is_paid = "yes"
        booking.is_use = False
        booking.updated_at = datetime.utcnow()
        
        # Ensure that no two staff can clear guest booking bills from room.
        if not booking.checkout_by_id:
            booking.checkout_by_id = user_id


    storage.save()
    return jsonify({"message": "Checkout Successful"}), 201
