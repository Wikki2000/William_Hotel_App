#!/usr/bin/python3
"""Create the Blueprint of Flask"""
from flask import Blueprint

api_views = Blueprint('api_views', __name__)

from api.v1.views.auth.login import *
from api.v1.views.auth.logout import *
from api.v1.views.auth.password_recovery import *
from api.v1.views.users import *
from api.v1.views.rooms import * 
from api.v1.views.customers import *
from api.v1.views.bookings import *
from api.v1.views.foods_drinks import *
from api.v1.views.foods import *
from api.v1.views.drinks import *
