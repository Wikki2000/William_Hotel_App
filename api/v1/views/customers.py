#!/usr/bin/python3
"""Handle API request for Customer module"""
from models.customer import Customer
from models.booking import Booking
from models.room import Room
from models.sale import Sale
from models.order import Order
from flask import abort, jsonify, request
from api.v1.views import api_views
from api.v1.views.utils import (
    create_receipt, bad_request, role_required, nigeria_today_date,
    write_to_file
)
from models import storage
from datetime import date, datetime


ERROR_LOG_FILE = "logs/error.log"


@api_views.route(
    "/guests/<string:old_room_number>/<string:new_room_number>/change-room",
    methods=["PUT"]
)
@role_required(["manager", "admin"])
def change_guest_room(
    user_role: str, user_id: str, old_room_number, new_room_number
):
    """Checkout guest to a different room."""
    TODAY_DATE = nigeria_today_date()
    CURRENT_TIME = time = datetime.now().strftime("%I:%M %p")
    old_room = storage.get_by(Room, number=old_room_number)
    new_room = storage.get_by(Room, number=new_room_number)
    if not old_room or not new_room:
        abort(404)

    old_room.status = "available"
    new_room.status = "occupied"

    # Book the new room selected for the guest.
    booking = storage.get_by(Booking, room_id=old_room.id, is_use=True)
    if booking:
        booking.room_id = new_room.id

    storage.save()
    return jsonify({
        "room": {"name": new_room.name, "amount": new_room.amount},
    }), 200


@api_views.route(
    "/guests/<string:customer_id>/rooms/<string:room_id>/extend-stay",
    methods=["POST"]
)
@role_required(["manager", "admin", "staff"])
def extend_guest_stay(user_role: str, user_id: str, room_id, customer_id):
    """Extend guest stay by placing new booking."""
    TODAY_DATE = nigeria_today_date()
    CURRENT_TIME = time = datetime.now().strftime("%I:%M %p")
    data = request.get_json()
    api_path = request.path

    required_fields = ["duration", "checkin", "checkout", "amount", "is_paid"]
    error_response = bad_request(data, required_fields)
    if error_response:
        abort(400)

    data.update({
        "room_id": room_id, "customer_id": customer_id, "checkin_by_id": user_id
    })

    previous_booking_amount = 0
    book = None
    receipt = None
    try:
        # Create booking object
        book = Booking(**data)
        storage.new(book)
        storage.save()

        # Add new booking to daily sale
        transaction = storage.get_by(
            Sale, entry_date=TODAY_DATE
        )

        if not transaction:
            transaction = Sale(
                entry_date=TODAY_DATE,
                room_sold=booking_data.get("amount")
            )
            storage.new(transaction)

        else:
            previous_booking_amount = getattr(transaction, "room_sold", 0)
            transaction.room_sold += data.get("amount")

        # Create booking receipt object.
        receipt = create_receipt("booking_id", book.id) 
        storage.new(receipt)

        storage.save()
        book = storage.get_by(Booking, id=book.id)
        return jsonify(book.to_dict()), 200

    except Exception as e:
        storage.delete_many([book, receipt])
        if transaction:
            if transaction.room_sold:
                transaction.room_sold = previous_booking_amount
        storage.save()
        print(str(e))
        error = f"{CURRENT_TIME}\t{TODAY_DATE}\t{api_path}\t{str(e)}\n\n"
        write_to_file(ERROR_LOG_FILE, error)
        return jsonify({"error": str(e)}), 500

    finally:
        storage.close()

@api_views.route(
    "/guests/<string:customer_id>/<string:booking_id>/<string:status>/service-list"
)
@role_required(["manager", "admin", "staff"])
def customer_service_list(
    user_role: str, user_id: str, booking_id: str,
    customer_id: str, status: str
):
    """Retrieve all services given to a guest."""
    TODAY_DATE = nigeria_today_date()
    CURRENT_TIME = time = datetime.now().strftime("%I:%M %p")
    customer = storage.get_by(Customer, id=customer_id)
    if not customer:
        abort(404)

    orders = bookings = None
    # Filter base on payment status
    if status == "all":
        bookings = storage.all_get_by(Booking, customer_id=customer_id, is_use=True)
        #orders = customer.orders
        orders = storage.all_get_by(Order, customer_id=customer_id)
    elif status == "pending":
        bookings = storage.all_get_by(
            Booking, customer_id=customer_id, is_use=True, is_paid="no"
        )
        orders = storage.all_get_by(Order, customer_id=customer_id, is_paid=False)
    elif status == "paid":
        bookings = storage.all_get_by(
            Booking, customer_id=customer_id, is_use=True, is_paid="yes"
        )
        orders = storage.all_get_by(Order, customer_id=customer_id, is_paid=True)

    if not orders and not bookings:
        return jsonify([]), 200

    # Sort list of bookings and orders.
    sorted_bookings = sorted(
        bookings, key=lambda book: book.updated_at, reverse=True
    )
    sorted_orders = sorted(
        orders, key=lambda order: order.updated_at, reverse=True
    )

    total_order_amount = sum(order.amount for order in sorted_orders)
    total_booking_amount = sum(booking.amount for booking in sorted_bookings)

    sorted_orders_list = [order.to_dict() for order in sorted_orders]
    sorted_bookings_list = [booking.to_dict() for booking in sorted_bookings]

    return jsonify({
        "bookings": sorted_bookings_list,
        "orders": sorted_orders_list,
        "bookings_amount": total_booking_amount,
        "orders_amount": total_order_amount,
    }), 200
