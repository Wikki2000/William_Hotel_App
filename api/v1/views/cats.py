#!/usr/bin/python3
"""Handle API request for vendor module"""
from models.cat import Cat
from flask import abort, jsonify, request
from api.v1.views import api_views
from api.v1.views.utils import role_required, bad_request
from models import storage
from sqlalchemy.exc import IntegrityError
from datetime import datetime, date
from dateutil.relativedelta import relativedelta
from models.sale import DailySale


@api_views.route("/cats/<string:year>/get")
@role_required(["manager", "admin"])
def get_cats(user_role: str, user_id: str, year: str):
    """
    => Retrieve all vats for a specific year.
    => Get Vat on 19th of every month.
    """

    today_date = date.today()  # Crone job always runs on 19th of every month.

    # Get Vat monthly payment on 19th of every month.
    if today_date.day == 28:
        previous_month_date = (
            today_date - relativedelta(months=1)
        ).replace(day=28)

        # Vat monthly payment due on 19th of every month.
        # Get the accumalated sum of daily sales till 19th.
        monthly_sales = storage.get_by_date(
            DailySale, previous_month_date, today_date, "entry_date"
        )
        accumulated_monthly_sales_sum = sum(
            sale.amount for sale in monthly_sales
        )
        vat_amount = 0.005 * accumulated_monthly_sales_sum;
        cat = Cat(month=today_date, amount=vat_amount)
        storage.new(cat)
        storage.save()
        print(f"{today_date} cat added successfully !")

    # Get the vat of choosen year.
    cats = storage.all(Cat).values()

    # Sort vats by updated_at in descending order
    sorted_cats = sorted(cats, key=lambda cat: cat.updated_at, reverse=True)

    if not sorted_cats:
        return jsonify([]), 200

    # Filter VATs by the requested year
    result = [
        {
            "id": cat.id,
            "amount": cat.amount,
            "is_paid": cat.is_paid,
            "month": cat.month.strftime("%B")  # Extract month name
        }
        for cat in sorted_cats if cat.month.year == int(year)
    ]

    return jsonify(result), 200


@api_views.route("/cats/<string:cat_id>/status", methods=["PUT"])
@role_required(["manager", "admin"])
def cat_status(user_role: str, user_id: str, cat_id: str):
    """Change vat status to paid."""
    cat = storage.get_by(Cat, id=cat_id)
    if not cat:
        abort(404)
    cat.is_paid = True
    storage.save()
    return jsonify({"message": "Vat Status Updated Successfully"}), 200
