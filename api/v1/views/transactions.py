#!/usr/bin/python3
"""Handle API request for transactions module"""
from models.expenditure import Expenditure
from datetime import date, datetime
from flask import abort, jsonify, request
from api.v1.views import api_views
from api.v1.views.utils import role_required, bad_request
from models.transaction import DailyTransaction

from models import storage
from sqlalchemy.exc import IntegrityError


@api_views.route("/transactions")
@role_required(["manager", "admin"])
def get_expenditures(user_role: str, user_id: str):
    """Retrieve all expenditure from databases."""
    expenditures = storage.all(Expenditure).values()

    if not expenditures:
        return jsonify([]), 200

    sorted_expenditures = sorted(
        expenditures,
        key=lambda expenditure : expenditure.updated_at,
        reverse=True
    )

    return jsonify([
        expenditure.to_dict()
        for expenditure in sorted_expenditures
    ]), 200


@api_views.route("/transactions/<string:start_date>/<string:end_date>/get")
@role_required(["manager", "admin"])
def get_transactions_by_date(
    user_role: str, user_id: str, start_date: str, end_date: str
):
    """Retrieve expenditur at a range of time."""
    """
    start_date_obj = datetime.strptime(start_date, "%Y-%m-%d")
    end_date_obj = datetime.strptime(end_date, "%Y-%m-%d")

    # Retrieve expenditure at an interval of time
    transactions = storage.get_by_date(
        DailyTransaction, start_date_obj, end_date_obj, "created_at"
    )
    daily_expenditure_sum = storage.get_by_date(
        DailyTransaction, start_date_obj, end_date_obj, "entry_date"
    )

    # Handle case were there is no expenditure
    if not expenditures or not daily_expenditure_sum:
        return jsonify([]), 200

    sorted_expenditures = sorted(
        expenditures,
        key=lambda expenditure : expenditure.updated_at,
        reverse=True
    )

    expenditure_accumulated_sum = sum(
        expense_daily_sum.amount
        for expense_daily_sum in daily_expenditure_sum
    )
    return jsonify({
        "daily_expenditures": [
            expenditure.to_dict()
            for expenditure in sorted_expenditures
        ],
        "daily_expenditure_sum": expenditure_accumulated_sum
    }), 200
    """
