from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import Booking, Space


bookings_bp = Blueprint("bookings", __name__, url_prefix="/bookings")


def parse_iso_datetime(value: str) -> datetime:
    """
    Accepts ISO8601 strings like:
      - 2026-02-10T09:00:00
      - 2026-02-10T09:00:00+03:00
    """
    if not value or not isinstance(value, str):
        raise ValueError("datetime must be an ISO string")
    return datetime.fromisoformat(value)


def overlaps(space_id: int, start_time: datetime, end_time: datetime) -> bool:
    """
    Overlap condition:
      existing.start < new.end AND existing.end > new.start
    """
    conflict = (
        Booking.query
        .filter(
            Booking.space_id == space_id,
            Booking.status == "confirmed",
            Booking.start_time < end_time,
            Booking.end_time > start_time,
        )
        .first()
    )
    return conflict is not None


# -----------------------
# Create booking
# -----------------------
@bookings_bp.route("", methods=["POST"])
@jwt_required()
def create_booking():
    data = request.get_json(silent=True) or {}

    space_id = data.get("space_id")
    start_time_raw = data.get("start_time")
    end_time_raw = data.get("end_time")
    duration = data.get("duration")
    total_cost = data.get("total_cost")

    # Basic required fields
    if space_id is None or start_time_raw is None or end_time_raw is None or duration is None or total_cost is None:
        return jsonify({"error": "Missing required fields: space_id, start_time, end_time, duration, total_cost"}), 400

    # Validate types
    try:
        space_id = int(space_id)
        duration = int(duration)
        total_cost = int(total_cost)
        start_time = parse_iso_datetime(start_time_raw)
        end_time = parse_iso_datetime(end_time_raw)
    except Exception as e:
        return jsonify({"error": f"Invalid input: {str(e)}"}), 400

    if duration <= 0:
        return jsonify({"error": "duration must be > 0"}), 400

    if total_cost < 0:
        return jsonify({"error": "total_cost must be >= 0"}), 400

    if end_time <= start_time:
        return jsonify({"error": "end_time must be after start_time"}), 400

    space = Space.query.get(space_id)
    if not space:
        return jsonify({"error": "Space not found"}), 404

    # Prevent double-booking (enable by default)
    if overlaps(space_id, start_time, end_time):
        return jsonify({"error": "This space is already booked for the selected time range"}), 409

    booking = Booking(
        user_id=int(get_jwt_identity()),
        space_id=space_id,
        start_time=start_time,
        end_time=end_time,
        duration=duration,
        total_cost=total_cost,
        status="confirmed",
    )

    db.session.add(booking)
    db.session.commit()

    return jsonify({
        "message": "Booking created successfully",
        "booking": booking.to_dict()
    }), 201


# -----------------------
# Get all bookings (current user)
# -----------------------
@bookings_bp.route("", methods=["GET"])
@jwt_required()
def get_my_bookings():
    user_id = int(get_jwt_identity())

    bookings = (
        Booking.query
        .filter_by(user_id=user_id)
        .order_by(Booking.start_time.desc())
        .all()
    )

    return jsonify([b.to_dict() for b in bookings]), 200


# -----------------------
# Get single booking (current user)
# -----------------------
@bookings_bp.route("/<int:booking_id>", methods=["GET"])
@jwt_required()
def get_booking(booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    if booking.user_id != int(get_jwt_identity()):
        return jsonify({"error": "Unauthorized"}), 403

    return jsonify(booking.to_dict()), 200


# -----------------------
# Cancel booking (soft cancel)
# -----------------------
@bookings_bp.route("/<int:booking_id>/cancel", methods=["POST"])
@jwt_required()
def cancel_booking(booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    if booking.user_id != int(get_jwt_identity()):
        return jsonify({"error": "Unauthorized"}), 403

    if booking.status == "cancelled":
        return jsonify({"message": "Booking already cancelled", "booking": booking.to_dict()}), 200

    booking.status = "cancelled"
    db.session.commit()

    return jsonify({"message": "Booking cancelled", "booking": booking.to_dict()}), 200


# -----------------------
# Delete booking (hard delete) - optional
# -----------------------
@bookings_bp.route("/<int:booking_id>", methods=["DELETE"])
@jwt_required()
def delete_booking(booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    if booking.user_id != int(get_jwt_identity()):
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(booking)
    db.session.commit()

    return jsonify({"message": "Booking deleted"}), 200
