#!/usr/bin/python3
"""Setuo Flask Appplication."""
from flask import Flask, redirect, url_for, jsonify
from flask_jwt_extended import JWTManager
from flasgger import Swagger
from api.v1.views import api_views
from app.routes import app_views
from app.config import Config
from models.storage import Storage

# Initialize storage
storage = Storage()

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
jwt = JWTManager(app)
Swagger(app)

# Register blueprint
app.register_blueprint(api_views, url_prefix="/api/v1")
app.register_blueprint(app_views, url_prefix="/app")


@app.errorhandler(404)
def not_found_error(error):
    """Not Found error handler"""
    return jsonify({"error": "Not Found"}), 404


@app.errorhandler(401)
def unauthorize(error):
    """Unauthorized error handler"""
    return redirect(url_for('app_views.login'))


@app.errorhandler(403)
def forbidden(error):
    """Forbidden error handler"""
    return jsonify({"error": "Forbidden Access"}), 403


@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    """Redirect to login page on token expiry."""
    return redirect(url_for('app_views.login'))


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5002)
