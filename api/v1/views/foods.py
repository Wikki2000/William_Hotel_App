#!/usr/bin/python3
"""Handle API request for Food class"""
from models.food import Food
from flask import abort, jsonify, request
from api.v1.views import api_views
from api.v1.views.utils import bad_request, role_required
from models import storage
from typing import Dict


@api_views.route("/foods")
@role_required(["manager", "staff", "admin"])
def get_foods(user_id: str, user_role: str) -> Dict:
    """Retrieve foods data stored in databases."""
    try:
        foods = storage.all(Food).values()
        if not foods:
            return jsonify([]), 200
        sorted_foods = sorted(foods, key=lambda food : food.name)
        return jsonify([food.to_dict() for food in sorted_foods]), 200
    except Exception as e:
        print(str(e))
        return jsonify({"error": "Internal Error Occured"}), 500
    finally:
        storage.close()


@api_views.route("/foods/<drink_id>/update", methods=["PUT"])
@role_required(["manager", "admin"])
def update_food(user_id: str, user_role: str, drink_id: str) -> Dict:
    """Update drink."""
    data = request.get_json()

    error_404 = bad_request(data)
    if error_404:
        return jsonify(error_404), 400

    drink = storage.get_by(Drink, id=drink_id)
    if not drink:
        abort(404)

    for key, val in data.items():
        if key != 'id':
            setattr(drink, key, val)
    storage.save()
    drink = storage.get_by(Drink, id=drink_id)
    return jsonify(drink.to_dict()), 201


@api_views.route("/foods/<food_id>/get")
@role_required(["manager", "admin"])
def get_food(user_id: str, user_role: str, drink_id: str) -> Dict:
    """Retrieve drink using it ID"""
    food = storage.get_by(Food, id=food_id)
    if not food:
        abort(404)

    return jsonify(food.to_dict()), 200


@api_views.route("/foods", methods=["POST"])
@role_required(["manager", "admin"])
def add_food(user_id: str, user_role: str) -> Dict:
    """Add new food in stock."""
    data = request.get_json()

    required_fields = ["name", "amount"]
    error_404 = bad_request(data, required_fields)
    if error_404:
        return jsonify(error_404), 404
    drink = Food(**data)
    storage.new(food)
    storage.save()
    drink = storage.get_by(Food, id=food.id)
    return jsonify(food.to_dict())


@api_views.route("/foods/<string:food_id>/delete", methods=["DELETE"])
@role_required(["manager", "admin"])
def remove_food(user_id: str, user_role: str, food_id: str) -> Dict:
    """Remove drink from stock."""
    food = storage.get_by(Food, id=food_id)

    if not food:
        abort(404)
    storage.delete(food)
    storage.save()
    return jsonify({"message": "Food successfully remove from stock"}), 200
