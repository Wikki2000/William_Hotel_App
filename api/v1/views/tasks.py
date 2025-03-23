#!/usr/bin/python3
"""Handle API request for vat module"""
from models.vat import Vat
from models.cat import Cat
from flask import abort, jsonify, request
from api.v1.views import api_views
from api.v1.views.utils import role_required, bad_request
from models import storage
from sqlalchemy.exc import IntegrityError
from dateutil.relativedelta import relativedelta
from datetime import date, datetime
from models.sale import Sale



@api_views.route("/tasks/<string:year>/<string:task_type>/get")
@role_required(["manager", "admin"])
def get_vats(user_role: str, user_id: str, year: str, task_type: str):
    """
    => Retrieve all vats for a specific year.
    => Get Vat on 19th of every month.
    """
    tasks = {"vat": Vat, "cat": Cat}
    if not task_type in tasks.keys():
        abort(404)

    start_date_obj = datetime.strptime(f"{year}-01-01", "%Y-%m-%d") 
    end_date_obj = datetime.strptime(f"{year}-12-30", "%Y-%m-%d")

    monthly_tasks = storage.get_by_date(
        tasks[task_type], start_date_obj, end_date_obj, "created_at"
    )

    sorted_tasks = sorted(monthly_tasks, key=lambda task: task.created_at)
    if not sorted_tasks:
        return jsonify([]), 200

    response = [task.to_dict() for task in sorted_tasks]

    return jsonify(response), 200


@api_views.route(
    "/tasks/<string:task_id>/<string:task_type>/update", methods=["PUT"]
)
@role_required(["manager", "admin"])
def vat_status(user_role: str, user_id: str, task_id: str, task_type: str):
    """Change vat status to paid."""
    tasks = {"vat": Vat, "cat": Cat}     
    if not task_type in tasks.keys():       
        abort(404)

    task = storage.get_by(tasks[task_type], id=task_id)
    if not task:
        abort(404)
    task.is_paid = True
    storage.save()
    return jsonify({
        "message": f"{task.month} {task_type} Status Updated Successfully"
    }), 200
