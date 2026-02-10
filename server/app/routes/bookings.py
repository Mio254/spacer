from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import and_

from app.extensions import db
from app.models import Booking, Space  # assumes app/models/__init__.py exports these

bookings_bp = Blueprint("bookings", __name__, url_prefix="/api/bookings")


def overlap_exists(space_id: int, start_date: str, end_date: str) -> bool:
    """
    Booking dates are stored as ISO-like strings. For strict correctness, use DateTime columns,
    but this works if your frontend sends consistent ISO strings (datetime-local).
    """
    # overlap condition: existing.start < new.end AND existing.end > new.start
    conflict = (
        Booking.query.filter(
            Booking.space_id == space_id,
            and_(Booking.start_date < end_date, Booking.end_date > start_date),
        )
        .first()
        is not None
    )
    return conflict


@bookings_bp.get("/me")
@jwt_required()
def my_bookings():
    user_id = int(get_jwt_identity())

    # Join spaces for richer UI data
    rows = (
        db.session.query(Booking, Space)
        .join(Space, Space.id == Booking.space_id)
        .filter(Booking.user_id == user_id)
        .order_by(Booking.id.desc())
        .all()
    )

    bookings = []
    for b, s in rows:
        bookings.append(
            {
                "id": b.id,
                "user_id": b.user_id,
                "space_id": b.space_id,
                "space_name": s.name,
                "location": s.location,
                "start_date": b.start_date,
                "end_date": b.end_date,
                "duration": b.duration,
                "total_cost": b.total_cost,
            }
        )

    return jsonify({"bookings": bookings}), 200


@bookings_bp.get("/space/<int:space_id>/availability")
@jwt_required(optional=True)
def check_availability(space_id):
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")

    if not start_date or not end_date:
        return jsonify({"error": "start_date and end_date are required"}), 400

    if start_date >= end_date:
        return jsonify({"error": "end_date must be after start_date"}), 400

    space = Space.query.get(space_id)
    if not space:
        return jsonify({"error": "Space not found"}), 404

    available = not overlap_exists(space_id, start_date, end_date)
    return jsonify({"available": available}), 200


@bookings_bp.post("")
@jwt_required()
def create_booking():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    space_id = data.get("space_id")
    start_date = data.get("start_date")
    end_date = data.get("end_date")
    duration = data.get("duration")

    if not space_id or not start_date or not end_date or not duration:
        return jsonify({"error": "space_id, start_date, end_date, duration are required"}), 400

    if start_date >= end_date:
        return jsonify({"error": "end_date must be after start_date"}), 400

    space = Space.query.get(space_id)
    if not space:
        return jsonify({"error": "Space not found"}), 404

    if overlap_exists(space_id, start_date, end_date):
        return jsonify({"error": "Time slot unavailable"}), 409

    try:
        duration_int = int(duration)
        if duration_int < 1:
            raise ValueError()
    except Exception:
        return jsonify({"error": "duration must be a positive integer"}), 400

    total_cost = int(space.price_per_hour) * duration_int

    booking = Booking(
        user_id=user_id,
        space_id=space_id,
        start_date=start_date,
        end_date=end_date,
        duration=duration_int,
        total_cost=total_cost,
    )
    db.session.add(booking)
    db.session.commit()

    return (
        jsonify(
            {
                "booking": {
                    "id": booking.id,
                    "user_id": booking.user_id,
                    "space_id": booking.space_id,
                    "start_date": booking.start_date,
                    "end_date": booking.end_date,
                    "duration": booking.duration,
                    "total_cost": booking.total_cost,
                }
            }
        ),
        201,
    )
