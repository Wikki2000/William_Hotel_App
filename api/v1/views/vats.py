#!/usr/bin/python3
"""Handle API request for vat module"""
from models.vat import Vat
from flask import abort, jsonify, request
from api.v1.views import api_views
from api.v1.views.utils import role_required, bad_request
from models import storage
from sqlalchemy.exc import IntegrityError
from dateutil.relativedelta import relativedelta
from datetime import date, datetime
from models.sale import DailySale



"""
@api_views.route("/vats", methods=["POST"])
@role_required(["manager", "admin"])
def add_vat(user_role: str, user_id: str):
    Add new VAT entry

    # Get JSON data from the request
    data = request.get_json()

    # Required fields for the VAT entry
    required_fields = ["month", "amount"]
    error_response = bad_request(data, required_fields)
    if error_response:
        print(error_response)
        return jsonify(error_response), 400


    try:
        # Parse month and format to match the database date
        month = datetime.strptime(data["month"], "%Y-%m").date()

        # Check if the VAT already exists for this month (unique constraint)
        vat = Vat(month=month, amount=data["amount"], is_paid=data["is_paid"])

        # Store VAT record in the database
        storage.new(vat)
        storage.save()

        # Return the response
        month_name = vat.month.strftime("%B")  # Get full month name (January, February, etc.)
        return jsonify({
            "id": vat.id,
            "amount": vat.amount,
            "is_paid": vat.is_paid,
            "month": month_name
        }), 200

    except IntegrityError:
        # Handle the case where VAT for this month already exists
        error_msg = f"VAT record for {month.strftime('%B %Y')} has already been entered."
        return jsonify({"error": error_msg}), 409

    except Exception as e:
        print(str(e))
        abort(500)

    finally:
        # Close the database session
        storage.close()
"""

@api_views.route("/vats/<string:year>/get")
@role_required(["manager", "admin"])
def get_vats(user_role: str, user_id: str, year: str):
    """
    => Retrieve all vats for a specific year.
    => Get Vat on 19th of every month.
    """

    today_date = date.today()  # Crone job always runs on 19th of every month.

    # Get Vat monthly payment on 19th of every month.
    if today_date.day == 19:
        previous_month_date = (
            today_date - relativedelta(months=1)
        ).replace(day=19)

        # Vat monthly payment due on 19th of every month.
        # Get the accumalated sum of daily sales till 19th.
        monthly_sales = storage.get_by_date(
            DailySale, previous_month_date, today_date, "entry_date"
        )
        accumulated_monthly_sales_sum = sum(
            sale.amount for sale in monthly_sales
        )
        vat_amount = 0.075 * accumulated_monthly_sales_sum;
        vat = Vat(month=today_date, amount=vat_amount)
        storage.new(vat)
        storage.save()
        print(f"{today_date} Vat added successfully !")

    # Get the vat of choosen year.
    vats = storage.all(Vat).values()

    sorted_vats = sorted(vats, key=lambda vat: vat.updated_at, reverse=True)
    if not sorted_vats:
        return jsonify([]), 200

    # Filter VATs by the requested year
    result = [
        {
            "id": vat.id,
            "amount": vat.amount,
            "is_paid": vat.is_paid,
            "month": vat.month.strftime("%B")  # Extract month name
        }
        for vat in sorted_vats if vat.month.year == int(year)
    ]

    return jsonify(result), 200


@api_views.route("/vats/<string:vat_id>/status", methods=["PUT"])
@role_required(["manager", "admin"])
def vat_status(user_role: str, user_id: str, vat_id: str):
    """Change vat status to paid."""
    vat = storage.get_by(Vat, id=vat_id)
    if not vat:
        abort(404)
    vat.is_paid = True
    storage.save()
    return jsonify({"message": "Vat Status Updated Successfully"}), 200
