#!/usr/bin/python3
"""Handle API request for vat module"""
from flask import abort, jsonify, request
from api.v1.views import api_views
from api.v1.views.utils import role_required, bad_request
from models import storage
from sqlalchemy.exc import IntegrityError
from dateutil.relativedelta import relativedelta
from datetime import date, datetime
from models.sale import Sale
from models.hotel_setting import HotelSetting


@api_views.route(
    "/tasks/<string:start_date>/<string:end_date>/<string:task_type>/get"
)
@role_required(["manager", "admin"])
def get_vats(
    user_role, user_id, start_date, end_date, task_type
):
    """ Retrieve vats for a duration of time.
    """
    hotel = storage.get_by(HotelSetting)
    vat_rate = hotel.vat_rate / 100
    cat_rate = hotel.cat_rate / 100
    tasks = {"vat": vat_rate, "cat": cat_rate}
    if not task_type in tasks:
        return jsonify({"Task Not Found"}), 404

    start_date_obj = datetime.strptime(start_date, "%Y-%m-%d") 
    end_date_obj = datetime.strptime(end_date, "%Y-%m-%d")


    # Retrieve expenditure at an interval of time
    sales = storage.get_by_date(
        Sale, start_date_obj, end_date_obj, "entry_date"
    )


    total_sale = sum(
        sale.food_sold + sale.drink_sold + 
        sale.laundry_sold + sale.game_sold +
        sale.room_sold for sale in sales
    )
    storage.close()
    return jsonify({
        task_type: total_sale * tasks[task_type],
        "sale_amount": total_sale
    }), 200
