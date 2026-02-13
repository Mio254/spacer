from datetime import datetime
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import and_

from app.extensions import db
from app.models import Booking, Space, Payment

bookings_bp = Blueprint("bookings", __name__, url_prefix="/bookings")


def _parse_dt(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value)
    except Exception:
        return None


def overlap_exists(space_id: int, start_time: datetime, end_time: datetime) -> bool:
    conflict = (
        Booking.query.filter(
            Booking.space_id == space_id,
            and_(Booking.start_time < end_time, Booking.end_time > start_time),
        )
        .first()
        is not None
    )
    return conflict


def _payment_status_for_booking(booking_id: int) -> str:
    """
    Returns latest payment status for a booking:
    - 'paid' if latest payment is paid
    - 'unpaid' otherwise (including no payment record yet)
    """
    payment = (
        Payment.query.filter_by(booking_id=booking_id)
        .order_by(Payment.created_at.desc())
        .first()
    )
    return payment.status if payment else "unpaid"


@bookings_bp.get("/me")
@jwt_required()
def my_bookings():
    user_id = int(get_jwt_identity())

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
                "start_time": b.start_time.isoformat(),
                "end_time": b.end_time.isoformat(),
                "duration": b.duration,
                "total_cost": b.total_cost,
                "status": b.status,
                "payment_status": _payment_status_for_booking(b.id),
            }
        )

    return jsonify({"bookings": bookings}), 200


@bookings_bp.get("/space/<int:space_id>/availability")
@jwt_required(optional=True)
def check_availability(space_id: int):
    start_raw = request.args.get("start_time") or request.args.get("start_date")
    end_raw = request.args.get("end_time") or request.args.get("end_date")

    start_time = _parse_dt(start_raw)
    end_time = _parse_dt(end_raw)

    if not start_time or not end_time:
        return jsonify({"error": "start_time and end_time are required (ISO format)"}), 400

    if start_time >= end_time:
        return jsonify({"error": "end_time must be after start_time"}), 400

    space = db.session.get(Space, space_id)
    if not space:
        return jsonify({"error": "Space not found"}), 404

    available = not overlap_exists(space_id, start_time, end_time)
    return jsonify({"available": available}), 200


@bookings_bp.post("")
@jwt_required()
def create_booking():
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}

    space_id = data.get("space_id")
    start_raw = data.get("start_time") or data.get("start_date")
    end_raw = data.get("end_time") or request.args.get("end_date")

    start_time = _parse_dt(start_raw)
    end_time = _parse_dt(end_raw)

    if not space_id or not start_time or not end_time:
        return jsonify({"error": "space_id, start_time, end_time are required"}), 400

    if start_time >= end_time:
        return jsonify({"error": "end_time must be after start_time"}), 400

    space = db.session.get(Space, int(space_id))
    if not space:
        return jsonify({"error": "Space not found"}), 404

    if overlap_exists(space.id, start_time, end_time):
        return jsonify({"error": "Time slot unavailable"}), 409

    duration_minutes = int((end_time - start_time).total_seconds() // 60)
    if duration_minutes < 1:
        return jsonify({"error": "booking duration too short"}), 400

    hours = duration_minutes / 60.0
    total_cost = int(round(float(space.price_per_hour) * hours))

    booking = Booking(
        user_id=user_id,
        space_id=space.id,
        start_time=start_time,
        end_time=end_time,
        duration=duration_minutes,
        total_cost=total_cost,
        status="confirmed",
    )
    db.session.add(booking)
    db.session.commit()

    
    return (
        jsonify(
            {
                "booking": {
                    **booking.to_dict(),
                    "payment_status": "unpaid",
                }
            }
        ),
        201,
    )
