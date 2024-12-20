#!/usr/bin/python3
"""Handle API request for loan request"""
from models.loan_request import LoanRequest
from flask import abort, jsonify, request
from api.v1.views import api_views
from api.v1.views.utils import role_required, bad_request
from models import storage


@api_views.route("/request-loan", methods=["POST"])
@role_required(["staff", "manager", "admin"])
def loan_request(user_role: str, user_id: str):
    """Request for loan"""
    data = request.get_json()

    required_fields = ["amount", "due_month", "repayment_mode", 
                       "bank_name", "account_name", "account_number"]
    error_response = bad_request(data, required_fields)
    if error_response:
        print(error_response);
        return jsonify(error_response), 400

    data["staff_id"] = user_id  # Add staff ID to data

    try:
        req = LoanRequest(**data)
        storage.new(req)
        storage.save()
        return jsonify({"message": "Loan Request Sent"}), 200
    except Exception as e:
        print(str(e))
        return jsonify({"error": "An Internal Error Occured"}), 500
