#!/usr/bin/python3
"""Handle API request for order module"""
from models.user import User
from models.customer import Customer
from models.order import Order
from models.drink import Drink
from models.order_item import OrderItem
from models.vat import Vat
from flask import abort, jsonify, request
from api.v1.views import api_views
from api.v1.views.utils import role_required
from api.v1.views.utils import bad_request
from models import storage
from sqlalchemy.exc import IntegrityError
from datetime import datetime
from random import randint


@api_views.route("/order-items", methods=["POST"])
@role_required(["staff"])
def order_items(user_role: str, user_id: str):
    """Store order details in database

    This endpoint handle request for ordering food or drink items,
    for a customer by a staff. It keep track of drink stock by reduction
    in total drink stock base on the amount order.
    """
    data = request.get_json()

    # Handle 404 error
    required_fields = ["customerData", "itemOrderData", "orderData"]
    error_response = bad_request(data, required_fields)
    if error_response:
        return jsonify(error_response), 400

    customer_data = data.get("customerData")
    item_data = data.get("itemOrderData")
    order_data = data.get("orderData")

    try:
        user = storage.get_by(User, id=user_id)

        # Add customer to db.
        new_customer = Customer(**customer_data)
        storage.new(new_customer)
        storage.save()

        # Add customer and user ID to order_data
        order_data["ordered_by_id"] = user.id
        order_data["customer_id"] = new_customer.id

        # Place new order
        order_data["order_number"] = "RSP" + str(randint(100000000, 999999999))
        new_order = Order(**order_data)
        storage.new(new_order)
        storage.save()

        # Take VAT from order amount
        vat_amount = (7.5 /100) * new_order.amount
        vat_task = Vat(amount=vat_amount, order_id=new_order.id)
        storage.new(vat_task)
        storage.save()

        for item in item_data:
            item_field = ""
            if item.get("itemType") == "food":
                item_field = "food_id"
            else:
                item_field = "drink_id"

                # Reduce qty of drink stock base on qty ordered.
                drink = storage.get_by(Drink, id=item.get("itemId"))
                drink.qty_stock -= item.get("itemQty")

            # Stored all ordered items
            item_attr = {
                "amount": float(item.get("itemAmount").replace(',', '')),
                "qty_order": item.get("itemQty"),
                f"{item_field}": item.get("itemId"),
                "order_id": new_order.id
            }
            item_order = OrderItem(**item_attr)
            storage.new(item_order)
        storage.save()
        return jsonify({"message": "Order Successfull"}), 200
    except Exception as e:
        print(str(e))
        return jsonify({"error": "An Internal Error Occured"}), 500
    finally:
        storage.close()


@api_views.route("/order-items")
@role_required(["staff", "manager", "admin"])
def get_orders(user_role: str, user_id: str):
    """Retrieve all order items"""
    try:
        orders = storage.all(Order).values()

        if not orders:
            return jsonify([]), 200

        sorted_orders = sorted(
            orders, key=lambda order : order.updated_at, reverse=True
        )
        response = [{
            "order": order.to_dict(),
            "customer": order.customer.to_dict(),
            "user": order.ordered_by.to_dict(),
            "order_items": [
                {
                    "qty": order_item.qty_order,
                    "amount": order_item.amount,
                    "name": (
                        order_item.drink.name
                        if order_item.drink_id
                        else order_item.food.name
                    )
                } for order_item in order.order_items]
        } for order in sorted_orders]
        return jsonify(response), 200
    except Exception as e:
        print(str(e))
        return jsonify({"error": "An Internal Error Occured"}), 500
    finally:
        storage.close()


@api_views.route("/orders/<string:order_id>/order-items")
@role_required(["staff", "manager", "admin"])
def get_order(user_role: str, user_id: str, order_id: str):
    """Retrieve order by it ID"""
    try:
        order = storage.get_by(Order, id=order_id)

        if not order:
            abort(404)

        cleared_by_dict = (
            None if not order.cleared_by else order.cleared_by.to_dict()
        )
        print(cleared_by_dict)

        response = {
            "order": order.to_dict(),
            "customer": order.customer.to_dict(),
            "ordered_by": order.ordered_by.to_dict(),
            "cleared_by": cleared_by_dict,
            "order_items": [
                {
                    "qty": order_item.qty_order,
                    "amount": order_item.amount,
                    "name": (
                        order_item.drink.name
                        if order_item.drink_id
                        else order_item.food.name
                    ),
                    "price": (
                        order_item.drink.amount
                        if order_item.drink_id
                        else order_item.food.amount
                    )
                } for order_item in order.order_items]
        }
        return jsonify(response), 200
    except Exception as e:
        print(str(e))
        return jsonify({"error": "An Internal Error Occured"}), 500
    finally:
        storage.close()


@api_views.route("/orders/<string:order_id>/update-payment", methods=["PUT"])
@role_required(["staff", "manager", "admin"])
def update_status(user_role: str, user_id: str, order_id: str):
    """Clear Bill of Customer."""
    order = storage.get_by(Order, id=order_id)
    if not order:
        abort(404)
    elif order.is_paid:
        user_obj = order.cleared_by if order.cleared_by else order.ordered_by
        name = f"{user_obj.first_name} {user_obj.last_name}"
        return jsonify({"error": f"Bill Already Cleared by {name} !"}), 409

    order.is_paid = True
    order.cleared_by_id = user_id
    order.updated_at = datetime.utcnow();
    storage.save()
    return jsonify({"message": "Payment Status Updated to Paid"}), 200


@api_views.route("/orders/<string:payment_status>")
@role_required(["staff", "manager", "admin"])
def filter_orders(user_role: str, user_id: str, payment_status):
    """Filter ordered base on paid or pending payment."""
    try:
        orders = storage.all(Order).values()

        if not orders:
            return jsonify([]), 200

        sorted_orders = sorted(
            orders, key=lambda order : order.updated_at, reverse=True
        )

        response = None
        if payment_status == "paid":
            response = [{
                "order": order.to_dict(),
                "customer": order.customer.to_dict(),
                "ordered_by": order.ordered_by.to_dict()
            } for order in sorted_orders if order.is_paid]
        elif payment_status == "pending":
            response = [{
                "order": order.to_dict(),
                "customer": order.customer.to_dict(),
                "ordered_by": order.ordered_by.to_dict()
            } for order in sorted_orders if not order.is_paid]
        else:
            abort(404)
        return jsonify(response), 200
    except Exception as e:
        print(str(e))
        return jsonify({"error": "An Internal Error Occured"}), 5
    finally:
        storage.close()
