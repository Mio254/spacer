from flask import Blueprint
from app.controller.booking_controller import create_booking_controller, check_availability_controller
from app.middleware.auth_middleware import auth_required

booking_bp = Blueprint("booking", __name__)

booking_bp.route("/space/<int:space_id>", methods=["GET"])(check_availability_controller)
booking_bp.route("/", methods=["POST"])(auth_required(create_booking_controller))
