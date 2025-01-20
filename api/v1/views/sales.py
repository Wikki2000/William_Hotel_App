#!/usr/bin/python3
"""Handle API request for transactions module"""
from models.expenditure import Expenditure
from datetime import date, datetime
from flask import abort, jsonify, request
from api.v1.views import api_views
from api.v1.views.utils import role_required, bad_request
from models.sale import DailySale
from models import storage
from sqlalchemy.exc import IntegrityError


@api_views.route("/sales")
@role_required(["manager", "admin"])
def get_sales(user_role: str, user_id: str):
    """Retrieve all sales from databases."""
    sales = storage.all(DailySale).values()

    if not sales:
        return jsonify([]), 200

    sorted_sales = sorted(
        sales,
        key=lambda sale : sale.updated_at,
        reverse=True
    )

    return jsonify([
        sale.to_dict()
        for sale in sorted_sales
    ]), 200


@api_views.route("/sales/<string:start_date>/<string:end_date>/get")
@role_required(["manager", "admin"])
def get_sale_by_date(
    user_role: str, user_id: str, start_date: str, end_date: str
):
    """Retrieve sales at any interval of time."""
    start_date_obj = datetime.strptime(start_date, "%Y-%m-%d")
    end_date_obj = datetime.strptime(end_date, "%Y-%m-%d")

    # Retrieve expenditure at an interval of time
    sales = storage.get_by_date(
        DailySale, start_date_obj, end_date_obj, "entry_date"
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
    return jsonify({
        "daily_sales": [
            sale.to_dict()
            for sale in sorted_sales
        ],
        "accumulated_sum": accumulated_sum
    }), 200
