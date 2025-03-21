#!/usr/bin/python3
"""This modules defines helper function for API"""
from flask import abort, request, jsonify
from datetime import timedelta
from os import environ
import sib_api_v3_sdk
from random import randint
from dotenv import load_dotenv
from models import storage
from functools import wraps
from flask_jwt_extended import get_jwt, jwt_required, get_jwt_identity
from typing import(
    Any, Dict, Union, Optional, List, Tuple, Callable, TypeVar
)
from redis import Redis
from models.private_message import PrivateMessage
from models.receipt import Receipt
import base64
from datetime import datetime
import pytz


r = Redis(host="localhost", port=6379, db=0)  # Create Redis instance
load_dotenv()   # Load environ variables
F = TypeVar("F", bound=Callable[..., any])  # Generic type for callable


# =================================================== #
#               Email Sending Helper Function         #
# =================================================== #
def send_mail(
    mail: str, kwargs: Dict[str, str],
    mail_subject="[William's Court Hotel]"
) -> bool:
    """Send token to email.

    Args:
        mail (string): The mail to be sent
        kwargs (dict): Key-value pairs of recipient info.

    Return:
        bool: True if email successfully delivered, else false.
    """
    config = sib_api_v3_sdk.Configuration()
    config.api_key["api-key"] = environ["MAIL_API_KEY"]

    # Create an instance of the API class
    api_instance = sib_api_v3_sdk.TransactionalEmailsApi(
        sib_api_v3_sdk.ApiClient(config)
    )

    sender = {
        "name": "William's Court Hotel",
        "email": environ["SENDER_EMAIL"]
    }
    email_subject = mail_subject
    recipient = [kwargs]

    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=recipient, sender=sender, subject=email_subject,
        html_content=mail
    )
    try:
        api_response = api_instance.send_transac_email(send_smtp_email)
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False
    except Exception:
        return False


def read_html_file(
        file_path: str, placeholders: Dict[Any, Any] = None
) -> str:
    """
    Read email from file and substitue placeholder if given.

    :placeholders - Dict. of placeholder (key) and value to be interpolated
    :return - The email content of file
    """
    with open(file_path, "r") as f:
        content = f.read()

    # Replace content with placeholder
    if placeholders:
        for key, val in placeholders.items():
            content = content.replace(f"[ {key} ]", val)
    return content


# =============================================#
#       Authentication Helper Function         #
# ============================================ #
def role_required(roles: List[str]) -> Callable[[F], F]:
    """
    Decorator to enforce role-based access control for routes.

    Args:
        roles (List[str]): A list of roles allowed to access the route.

    Returns:
        Callable[[F], F]: The decorated function with access control.
    """
    def decorator(func: F) -> F:
        @wraps(func)
        @jwt_required()  # Ensures JWT authentication is applied
        def wrapper(*args, **kwargs) -> Tuple[Dict, int]:
            """
            Wrapper function to validate user role and identity.

            Args:
                *args: Positional arguments passed to the decorated function.
                **kwargs: Keyword arguments passed to the decorated function.
            """
            # Extract claims and user identity
            claims = get_jwt()
            user_id = get_jwt_identity()  # Retrieve the user ID
            user_role = claims.get("role")

            # Inject as a keyword argument
            kwargs['user_role'] = user_role
            kwargs['user_id'] = user_id

            # Check if the user's role is allowed
            if user_role not in roles:
                abort(403)

            # Pass user_id and allow kwargs to include dynamic route arguments
            return func(*args, **kwargs)
        return wrapper
    return decorator


def generate_token(mins: int = 60) -> str:
    """
    Create random numbers and cache in redis db.

    :mins - Expiration time in minute for token
    :return - The token generated
    """
    expiring_time = timedelta(minutes=mins)
    token = str(randint(100000, 999999))
    r.setex(token, expiring_time, "valid")
    return token


def is_valid(token: str) -> bool:
    """
    Check if token is valid

    :token - Token whooose validity is checked.
    :return - True if token is valid, else false.
    """
    if r.get(token):
        return True
    return False

def delete_token(token: str) -> bool:
    """Remove cache token in redis
    """
    return r.delete(token)


# =============================================#
#       Common API Helper Function             #
# ============================================ #
def bad_request(
    data: Dict, required_fields: List[Any] = []
) -> Optional[Dict[str, str]]:
    """Handle response for Bad Request (400) error.

    :data - The request body to API endpoint.
    :required_fields - Required fields in request body.
    """
    if not data:
        return {"error": "Empty Request Body"}
    for field in required_fields:
        if not data.get(field):
            return {"error": f"{field} is required"}
    return None


def convert_to_binary(base64_string: str) -> bytes:
    """Convert Base64String of photo to Binary."""
    if not base64_string:
        return None
    if base64_string.startswith('data:image'):
        base64_string = base64_string.split(',')[1]  # Remove the prefix
        img_binary_data = base64.b64decode(base64_string)  # Decode to binary.
    return img_binary_data


def write_to_file(file_path, content):
    with open(file_path, "a") as f:
        f.write(content)

# ===================================================================== #
#                     Messages Module Helper Function                   #
# ===================================================================== #
def user_friend_messages(
    user_id: str, friend_id, is_reverse: bool = False
) -> Optional[PrivateMessage]:
    """
    Retrieve messages b/w logged-in user and friend(s),
    and sort the message base on time in ascendind order.

    :user_id - The logged-in user ID
    :friend_id - The friend ID

    :rtype - The sorted message if found, else None.
    """
    sender_attr_val = ["sender_id", user_id]
    receiver_attr_val = ["receiver_id", friend_id]
    messages = storage.get_by_double_field(
        PrivateMessage, sender_attr_val, receiver_attr_val
    )

    if not messages:
        return None

    sorted_messages = sorted(
        messages, key=lambda msg: msg.created_at, reverse=is_reverse
    )
    return sorted_messages


# ===================================================================== #
#                     Order Module Helper Function                   #
# ===================================================================== #
def update_item_stock(item, customer, new_order, item_sold):
    """Update stock levels and sales records based on item type."""

    from models.food import Food
    from  models.drink import Drink
    from models.order_item import OrderItem

    item_type = item.get("itemType")
    item_id = item.get("itemId")
    item_qty = item.get("itemQty")
    item_amount = item.get("itemAmount")

    stock_model = {"food": Food, "drink": Drink}.get(item_type)
    sales_field = f"{item_type}_sold" if item_type in ["food", "drink", "game", "laundry"] else None

    if stock_model and (item_type == "food" or item_type == "drink"):
        stock_item = storage.get_by(stock_model, id=item_id)
        if stock_item.qty_stock < item_qty:
            raise ValueError(f"{stock_item.name} low in stock ({stock_item.qty_stock} available)")

        stock_item.qty_stock -= item_qty

    if sales_field:
        setattr(
            item_sold, sales_field,
            getattr(item_sold, sales_field, 0) + 
            item_amount
        )

    # Store ordered item
    order_item = OrderItem(
        amount=item_amount, qty_order=item_qty, order_id=new_order.id,
        **{f"{item_type}_id": item_id}
    )
    storage.new(order_item)


def rollback_order_on_error(new_order, item_sold, prev_sales):
    """Rollback order and restore sales data on error."""
    if new_order:
        storage.delete(new_order)

    if item_sold:
        update_sales_data(item_sold, prev_sales)

    storage.save()


def update_sales_data(item_sold, prev_sales):
    """Restore previous sales values after an error."""
    for key, value in prev_sales.items():
        setattr(item_sold, f"{key}_sold", value)


# ===================================================================== #
#                          Redis Helper Function                        #
# ===================================================================== #
def rd_get(key: str = "receipt_number") -> Optional[bytes]:
    """Retrievea value from Redis db.

    :key - The corresponding key to get value.

    :returns - The value corresponding to the key if found else none.
    """
    return r.get(key)


def rd_set(value: Any, key: str = "receipt_number"):
    """Insert a value to corresponnding key.

    :key - The key of value to be inserted.
    :value - The correspondig value to be stored.
    """
    r.set(key, value)


def create_receipt(attr_str: str, obj_id: str) -> Optional[Receipt]:
    """
    Create receipt for every service render,
    this receipt number are incremental by one on every sales.

    :attr_str - The attr of bookin_id or order_id of receipts.
    :obj_id - The ID of object of service to render, e.g., Bookings or Orders made.
    
    :retype - The object of receipt created or None on failure.
    """
    try:
        # Check if Receipt class has the attribute attr_str.
        getattr(Receipt, attr_str)
    except AttributeError:
        return None

    val = rd_get()
    receipt_no = int(val) + 1 if val else 1
    rd_set(receipt_no)

    # Dynamically pass the attribute as a keyword argument.
    receipt = Receipt(receipt_no=f"WCHS{receipt_no:04}", **{attr_str: obj_id})
    return receipt


def check_reservation(obj_list, checkout_date, checkin_date, room_no):
    """ 
    Check if there is reservation for a room with a set time.

    :obj_list - The list of all reserved room.
    :checkout_date - The booking check out date.
    :checkout_in_date - The booking check im date. 
    :room_no - The room number to check for reservation.

    :rtype - The message string of reservation found.
    """
    if not checkin_date or not checkout_date or not obj_list:
        return None
    for booking in obj_list:
        booking_checkin_date = booking.checkin.strftime("%Y-%m-%d")
        booking_checkout_date = booking.checkout.strftime("%Y-%m-%d")
        if (
                booking.is_reserve and
                booking_checkin_date <= checkin_date or
                booking_checkin_date <= checkout_date
            ):
            msg = (
                f"Room {room_no} already reserved for " +
                f"{booking.customer.name} from {booking_checkin_date} to " +
                f"{booking_checkout_date}. Please contact the management " +
                "to cancel or adjust reservation date."
            )
            return {"error": msg}




def nigeria_today_date():
    nigeria_tz = pytz.timezone('Africa/Lagos')
    nigeria_date = datetime.now(nigeria_tz).date()
    return nigeria_date

