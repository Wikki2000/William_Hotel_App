#!/usr/bin/python3
"""Handle API request for Food & Drink class"""
from models.food import Food
from models.drink import Drink
from models.daily_expenditure_sum import DailyExpenditureSum
from models.sale import Sale
from flask import abort, jsonify, request
from api.v1.views import api_views
from api.v1.views.utils import bad_request, role_required, nigeria_today_date
from models import storage
from datetime import date
from typing import Dict


@api_views.route("/inventories")
@role_required(["manager", "admin"])
def get_inventories(user_id: str, user_role: str) -> Dict:
    """Retrieve inventories from databases."""
    try:
        today_date = nigeria_today_date()
        today_expenditure = storage.get_by(
            DailyExpenditureSum, entry_date=today_date
        )
        today_sale = storage.get_by(Sale, entry_date=today_date)

        return jsonify({
            "today_sales": (
                today_sale.food_sold + today_sale.game_sold + 
                today_sale.drink_sold + today_sale.laundry_sold + 
                today_sale.room_sold if today_sale else 0
            ),
            "today_expenditures": (
                today_expenditure.amount if today_expenditure else 0
            ),
            "total_drinks": len(storage.all(Drink).values()),
            "total_foods": len(storage.all(Food).values()) 
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        storage.close()
