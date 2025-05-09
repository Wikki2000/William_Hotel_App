#!/usr/bin/python3
"""This modules defines helper function for API"""
from flask import abort, request, jsonify
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
from models.sale import Sale
import base64
from datetime import date, datetime, timedelta
import pytz
from calendar import monthrange
from dateutil.relativedelta import relativedelta
from api.v1.views import constant
from sqlalchemy import case, func


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
                booking_checkin_date < checkout_date
            ):
            msg = (
                f"Room {room_no} already reserved for " +
                f"{booking.customer.name} from {booking_checkin_date} to " +
                f"{booking_checkout_date}. Please contact the management " +
                "to cancel or adjust reservation date."
            )
            return {"error": msg}


# ===================================================================== #
#                          VAT/CAT Helper Function                        #
# ===================================================================== #
def create_monthly_task(
    cls, task_amount: float, due_day: int,
    task_type: str, old_amount: float = 0
):
    """
    Create or accumulate monthly VAT/CAT.

    :cls - The VAT/CAT class
    :task_amount - The VAT/CAT amount.
    :due_day - The time due for VAT/CAT payment.
    """
    try:
        today_date = nigeria_today_date()         
        day = today_date.day
        year = today_date.year

        task_month = get_task_month(due_day, task_type)
        task = get_current_task(cls, due_day, task_type)

        # Vat due 1 day ahead the due day.
        if task and day == due_day + 1:
            task.is_due = True

        if not task:
            task = cls(month=f"{task_month}_{year}", amount=task_amount)
            storage.new(task)
        else:
            task.amount += task_amount - old_amount
    except Exception as e:
        storage.rollback()
        raise Exception("An Internal Error Occur")


def update_task(increase_task: float, reduce_task: float = 0):
    """
    Update the task (VAT/CAT) of every sales.

    :increase_task - The value to add to the task. E.g., Making new sales
    :reduce_task - The value to deduct from task. E.g., Canceling reservation.
    """
    vat_new_amount = constant.VAT_RATE_MULTIPLIER * increase_task
    vat_old_amount = constant.VAT_RATE_MULTIPLIER * reduce_task
    create_monthly_task(Vat, vat_new_amount, constant.VAT_DUE_DAY, "vat", vat_old_amount)

    cat_new_amount = constant.CAT_RATE_MULTIPLIER * increase_task
    cat_old_amount = constant.CAT_RATE_MULTIPLIER * reduce_task
    create_monthly_task(Cat, cat_new_amount, last_month_day(), "cat", cat_old_amount)


def get_current_task(cls, due_day, task_type):
    """
    """
    today_date = nigeria_today_date() 
    task_month = get_task_month(due_day, task_type)
    year = today_date.year
    task = storage.get_by(cls, month=f"{task_month}_{year}")
    if task:
        return task
    return None


def get_task_month(due_day, task_type):
    """
    Get the month of task base on it due date.

    :due_day - The due date for paymenbt of task.
    :rtype - The actual month for active task.
    """
    month_mapper = {
        1: "jan", 2: "feb", 3: "march",
        4: "april", 5: "may", 6: "june",
        7: "july", 8: "aug", 9: "sept", 
        10: "oct", 11: "nov", 12: "dec"
    }
    tasks = ["vat", "cat"]
    today_date = nigeria_today_date()
    today = today_date.day
    month = today_date.month

    last_day = last_month_day()
    first_day = 1  # First day of the month.

    if task_type not in tasks:
        return None

    """
    => VAT for a month is due every 19th.
    => Accumulation for new month VAT start on 20th.
    => E.g., 0 - 19th March stills accumulate February VAT.
    => March VAT start counting from 20th March.

    => CAT is due for every last day of the month.
    => CAT accumulation depends on the current month.
    """
    if task_type == "vat":
        if due_day < today <= last_day:
            return month_mapper[month] 
        elif first_day < today <= due_day:
            return month_mapper[month - 1]
    elif task_type == "cat":
        return month_mapper[month]


def update_room_sold(new_amount, old_amount=0, date=None):
    sale_date = date if date else nigeria_today_date()
    current_hour = datetime.now().hour

    if 0 <= current_hour <= constant.BOOKING_END_BY:
        sale_date -= timedelta(days=1)

    # Update the room sold.
    today_sale = storage.get_by(Sale, entry_date=sale_date)
    if not today_sale:
        today_sale = Sale(entry_date=sale_date, room_sold=new_amount)
        storage.new(today_sale)
    else:
        today_sale.room_sold += new_amount - old_amount


def nigeria_today_date():
    nigeria_tz = pytz.timezone('Africa/Lagos')
    nigeria_date = datetime.now(nigeria_tz).date()
    return nigeria_date


def last_month_day():
    today = nigeria_today_date()
    last_day = monthrange(today.year, today.month)[1]
    return last_day


def get_payment_totals(session, date):
    from sqlalchemy import case, func, cast, Date
    from models.order import Order
    from models.booking import Booking
    
    # Cast the date to remove time for accurate filtering
    date_cast = cast(date, Date)

    # Case expression for Order: Determine if payment is made or pending
    order_paid_case = case(
        (Order.is_paid == True, Order.payment_type),
        else_='pending'  # unpaid, mark as pending
    )

    # Query for Orders with date filtering
    order_query = (
        session.query(
            order_paid_case.label('status'),
            func.sum(Order.amount).label('total')
        )
        .filter(cast(Order.created_at, Date) == date_cast)  # filter based on the date
        .group_by('status')
    ) 

    # Case expression for Booking: Determine if payment is made or pending
    booking_paid_case = case(
        (Booking.is_paid.ilike('yes'), Booking.payment_type),  # paid, use payment_type
        else_='pending'  # unpaid, mark as pending
    )

    # Query for Bookings with date filtering
    booking_query = (
        session.query(
            booking_paid_case.label('status'),
            func.sum(Booking.amount).label('total')
        )
        .filter(cast(Booking.created_at, Date) == date_cast)  # filter based on the date
        .group_by('status')
    )

    # Combine the results from Orders and Bookings
    final_query = order_query.union_all(booking_query)

    # Execute the combined query
    results = session.execute(final_query).all()

    # Initialize result dictionary
    final_result = {
        'pos': 0,
        'cash': 0,
        'transfer': 0,
        'pending': 0
    }

    # Aggregate results into the final result dictionary
    for status, total in results:
        status = status.lower()  # Convert status to lowercase for consistency
        if status in final_result:
            final_result[status] += total or 0  # Add total amount, protect against None
        else:
            # If status is unexpected, log or ignore (optional)
            pass

    return final_result

