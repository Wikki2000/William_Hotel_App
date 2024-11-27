#!/usr/bin/python3
"""Handle API views."""
from flask import jsonify, redirect, url_for, render_template
from app.routes import app_views


@app_views.route("/pages/<string:page>")
def page(page):
    """Render any given pages pass as an arguements."""
    return render_template(f"dynamic_pages/{page}.html")
