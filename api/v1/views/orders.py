#!/usr/bin/python3
"""Handle API request for order module"""
from models.user import User
from models.customer import Customer
from models.order import Order
from models.drink import Drink
from models.food import Food
from models.order_item import OrderItem
#from models.sale import DailySale
from models.booking import Booking
from models.sale import Sale
from flask import abort, jsonify, request
from api.v1.views import api_views
from api.v1.views.utils import bad_request, create_receipt, role_required
from models import storage
from sqlalchemy.exc import IntegrityError
from datetime import datetime, date
from random import randint


@api_views.route("/order-items", methods=["POST"])
@role_required(["staff", "manager", "admin"])
def order_items(user_role: str, user_id: str):
    """Store order details in database

    This endpoint handle request for ordering food or drink items,
    for a customer by a staff. It keep track of drink stock by reduction
    in total drink stock base on the amount order.
    """
    data = request.get_json()

    today_date = date.today() 

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

        customer = storage.get_by(Customer, id=data.get("customer_id"))

        # Add new or existing customer ID to order data
        if customer:
            order_data["customer_id"] = customer.id
        else:
            new_customer = Customer(**customer_data)
            storage.new(new_customer)
            storage.save()
            customer = new_customer
            order_data["customer_id"] = new_customer.id

        # Add user ID to order_data
        order_data["ordered_by_id"] = user.id

        # Place new order
        new_order = Order(**order_data)
        storage.new(new_order)
        storage.save()

        # Create receipt for order made.
        receipt = create_receipt("order_id", new_order.id)
        storage.new(receipt)
        storage.save()

        item_sold = storage.get_by(Sale, entry_date=today_date)
        if not item_sold:
            item_sold = Sale(entry_date=today_date)
            storage.new(item_sold)

        for item in item_data:
            item_field = ""
            if item.get("itemType") == "food":
                item_field = "food_id"

                # Reduce qty of food stock base on qty ordered.
                food = storage.get_by(Food, id=item.get("itemId"))
                if food.qty_stock  < item.get("itemQty"):

                    # Delete if item low in stock
                    if not customer.is_guest:
                        storage.delete(customer)
                    storage.delete(new_order)
                    storage.save()

                    return jsonify({
                        "error": f"{food.name} low in stock ({food.qty_stock} piece(s) available)"
                    }), 422
                else:
                    food.qty_stock -= item.get("itemQty")
                    
                    if item_sold.food_sold:
                        item_sold.food_sold += item.get("itemAmount")
                    else:
                        item_sold.food_sold = item.get("itemAmount")

            elif item.get("itemType") == "drink":
                item_field = "drink_id"

                # Reduce qty of drink stock base on qty ordered.
                drink = storage.get_by(Drink, id=item.get("itemId"))
                if drink.qty_stock  < item.get("itemQty"):

                    # Delete only guest not lodge
                    if not customer.is_guest:
                        storage.delete(customer)

                    storage.delete(new_order)
                    storage.save()

                    return jsonify({
                        "error": f"{drink.name} low in stock ({drink.qty_stock} piece(s) available)"
                    }), 422
                else:
                    drink.qty_stock -= item.get("itemQty")

                    if item_sold.drink_sold:
                        item_sold.drink_sold += item.get("itemAmount")
                    else:
                        item_sold.drink_sold = item.get("itemAmount")
            elif item.get("itemType") == "game":
                item_field = "game_id"

                if item_sold.game_sold:
                    item_sold.game_sold += item.get("itemAmount")
                else:
                    item_sold.game_sold = item.get("itemAmount")
            elif item.get("itemType") == "clothe":
                item_field = "laundry_id"

                if item_sold.laundry_sold:
                    item_sold.laundry_sold += item.get("itemAmount")
                else:
                    item_sold.laundry_sold = item.get("itemAmount")

            # Stored all ordered items
            item_attr = {
                "amount": item.get("itemAmount"),
                "qty_order": item.get("itemQty"),
                f"{item_field}": item.get("itemId"),
                "order_id": new_order.id
            }
            item_order = OrderItem(**item_attr)
            storage.new(item_order)

            # Add new daily transaction if exists else increase sum by existing one
            """
            transaction = storage.get_by(
                DailySale, entry_date=today_date
            )

            if not transaction:
                transaction = DailySale(
                    entry_date=today_date, amount=order_data.get("amount")
                )

                storage.new(transaction)
            else:
                transaction.amount += float(order_data.get("amount"))
            """
        storage.save()
        return jsonify({"order_id": new_order.id}), 200
    except Exception as e:
        print(str(e))

        # Delete an order if an error occured
        storage.delete(new_order)
        storage.save()
        return jsonify({"error": "An Internal Error Occured"}), 500
    finally:
        storage.close()


@api_views.route("/order-items")
@role_required(["staff", "manager", "admin"])
def get_orders(user_role: str, user_id: str):
    """Retrieve all order items"""
    try:
        #orders = storage.all(Order).values()

        start_date_obj = end_date_obj = date.today()

        orders = storage.get_by_date(
            Order, start_date_obj, end_date_obj, "created_at",
        )

        if not orders:
            return jsonify([]), 200

        sorted_orders = sorted(
            orders, key=lambda order : order.updated_at, reverse=True
        )
        obj = sorted_orders[0]
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
                        else order_item.food.name if order_item.food_id
                        else order_item.game.name if order_item.game_id
                        else None
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

        response = {
            "order": {
                **order.to_dict(),
                "order_receipt": order.receipt.receipt_no
            },
            "customer": order.customer.to_dict(),
            "ordered_by": order.ordered_by.to_dict(),
            "cleared_by": cleared_by_dict,
            "order_items": [
                {
                    "qty": order_item.qty_order,
                    "amount": order_item.amount,
                    "name": (
                        order_item.drink.name if order_item.drink_id
                        else order_item.food.name if order_item.food_id
                        else order_item.game.name if order_item.game_id
                        else order_item.laundry.name if order_item.laundry_id
                        else None
                    ),
                    "price": (
                        order_item.drink.amount if order_item.drink_id
                        else order_item.food.amount if order_item.food_id
                        else order_item.game.amount if order_item.game_id
                        else order_item.laundry.amount if order_item.laundry_id
                        else None
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

        name = (
            "You" if user_id == order.cleared_by.id
            else f"{user_obj.first_name} {user_obj.last_name}"
        )
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
        # Get all pending payment from databases
        if payment_status == "pending":
            all_pending_orders = storage.all_get_by(Order, is_paid=False)
            if not all_pending_orders:
                return jsonify([]), 200
            else:
                sorted_pending_orders = sorted(
                    all_pending_orders,
                    key=lambda order : order.updated_at,
                    reverse=True
                                                                                                )
                response = [{
                    "order": order.to_dict(),
                    "customer": order.customer.to_dict(),
                    "ordered_by": order.ordered_by.to_dict()
                    } for order in  sorted_pending_orders]
            return jsonify(response), 200
        elif payment_status == "paid":
            # Get paid orders for today
            start_date_obj = end_date_obj = date.today()
            orders = storage.get_by_date(
                Order, start_date_obj, end_date_obj, "created_at",
            )

            sorted_orders = sorted(
                orders, key=lambda order : order.updated_at, reverse=True
            )
            if not orders:
                return jsonify([]), 200
            response = [{
                "order": order.to_dict(),
                "customer": order.customer.to_dict(),
                "ordered_by": order.ordered_by.to_dict()
            } for order in sorted_orders if order.is_paid]
        else:
            abort(404)
        return jsonify(response), 200
    except Exception as e:
        print(str(e))
        abort(500)
    finally:
        storage.close()


@api_views.route("/orders/<string:start_date>/<string:end_date>/get")
@role_required(["manager", "admin", "staff"])
def get_order_by_date(
    user_role: str, user_id: str, start_date: str, end_date: str
):
    """Retrieve sales at any interval of time."""
    start_date_obj = datetime.strptime(start_date, "%Y-%m-%d")
    end_date_obj = datetime.strptime(end_date, "%Y-%m-%d")

    # Retrieve expenditure at an interval of time
    sales = storage.get_by_date(
        Order, start_date_obj, end_date_obj, "updated_at"
    )

    # Handle case were there is no expenditure
    if not sales:
        return jsonify([]), 200

    sorted_sales = sorted(
        sales,
        key=lambda sale : sale.updated_at,
        reverse=True
    )

    accumulated_sum = sum(sale.amount for sale in sorted_sales)

    response = {
            "orders": [{
                "order": order.to_dict(),
                "customer": order.customer.to_dict(),
                "user": order.ordered_by.to_dict(),
               } for order in sorted_sales
            ],
            "accumulated_sum": accumulated_sum
    }
    return jsonify(response), 200
