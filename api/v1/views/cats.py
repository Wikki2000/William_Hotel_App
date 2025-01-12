#!/usr/bin/python3
"""Handle API request for vendor module"""
from models.cat import Cat
from flask import abort, jsonify, request
from api.v1.views import api_views
from api.v1.views.utils import role_required, bad_request
from models import storage
from sqlalchemy.exc import IntegrityError
from datetime import datetime


@api_views.route("/cats", methods=["POST"])
@role_required(["manager", "admin"])
def add_cat(user_role: str, user_id: str):
    """Add new CAT entry"""

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
        cat = Cat(month=month, amount=data["amount"], is_paid=data["is_paid"])

        # Store VAT record in the database
        storage.new(cat)
        storage.save()

        # Return the response
        month_name = cat.month.strftime("%B")  # Get full month name (January, February, etc.)
        return jsonify({
            "id": cat.id,
            "amount": cat.amount,
            "is_paid": cat.is_paid,
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


@api_views.route("/cats/<string:year>/get")
@role_required(["manager", "admin"])
def get_cats(user_role: str, user_id: str, year: str):
    """Retrieve all cats for a specific year."""
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
