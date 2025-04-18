#!/usr/bin/python3
"""Handle API request for SaleComment class"""
from models.sale_comment import SaleComment
from flask import abort, jsonify, request
from api.v1.views import api_views
from api.v1.views.utils import bad_request, role_required
from models import storage
from typing import Dict



@api_views.route("/comments", methods=["POST"])
@role_required(["manager", "admin"])
def add_comment(user_id: str, user_role: str) -> Dict:
    """Add new comment to sale."""
    data = request.get_json()

    required_fields = ["comment", "sale_id"]
    error_400 = bad_request(data, required_fields)
    print(error_400)
    if error_400:
        return jsonify(error_400), 400

    data["user_id"] = user_id  # Add user ID to comment.

    comment = SaleComment(**data)
    storage.new(comment)
    storage.save()
    comment = storage.get_by(SaleComment, id=comment.id)
    return jsonify(comment.to_dict()), 200


@api_views.route("/comments/<string:comment_id>/delete", methods=["DELETE"])
@role_required(["manager", "admin"])
def remove_comment(user_id: str, user_role: str, comment_id: str) -> Dict:
    """Delete comment."""
    comment = storage.get_by(SaleComment, id=comment_id)

    if not comment: 
        abort(404)
    storage.delete(comment)
    storage.save()
    return jsonify({"message": "Comment Delete Successfully!"}), 200


@api_views.route("/comments/<string:comment_id>")
@role_required(["manager", "admin"])
def get_comment(user_id: str, user_role: str, comment_id: str) -> Dict:
    """Get comment by ID."""
    comment = storage.get_by(SaleComment, id=comment_id)
    if not comment:     
        abort(404)

    return jsonify(comment.to_dict()), 200


@api_views.route("/comments/<string:sale_id>/get")
@role_required(["manager", "admin"])
def get_comments(user_id: str, user_role: str, sale_id) -> Dict:                    
    """Retrieve all comments."""                   
    comments = storage.all_get_by(SaleComment, sale_id=sale_id)

    if not comments:
        return jsonify([]), 200


    sorted_comments = sorted(
            comments,
            key=lambda comment : comment.updated_at, reverse=True
    )

    return jsonify([{
        **comment.to_dict(), "role": comment.user.portfolio,
        "comment_by": f"{comment.user.first_name} {comment.user.last_name}"
    } for comment in sorted_comments]), 200 



@api_views.route("/comments/<string:comment_id>/update", methods=["PUT"])
@role_required(["manager", "admin"])
def update_comment(user_id: str, user_role: str, comment_id: str) -> Dict:
    """Update comments."""
    data = request.get_json()

    error_404 = bad_request(data)
    if error_404:
        return jsonify(error_404), 400

    comment = storage.get_by(SaleComment, id=comment_id)
    if not comment:
        abort(404)

    for key, val in data.items():
        if key != 'id':
            setattr(comment, key, val)
    storage.save()
    comment = storage.get_by(SaleComment, id=comment_id)
    return jsonify(comment.to_dict()), 201
