from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

from app.extensions import db
from app.models import Booking, Space

bookings_bp = Blueprint("bookings", __name__, url_prefix="/bookings")


# Create a booking

@bookings_bp.route("", methods=["POST"])
@jwt_required()
def create_booking():
    data = request.get_json()

    space_id = data.get("space_id")
    start_time = data.get("start_time")
    end_time = data.get("end_time")

    if not all([space_id, start_time, end_time]):
        return jsonify({"error": "Missing required fields"}), 400

    space = Space.query.get(space_id)
    if not space:
        return jsonify({"error": "Space not found"}), 404

    booking = Booking(
        user_id=int(get_jwt_identity()),
        space_id=space_id,
        start_time=datetime.fromisoformat(start_time),
        end_time=datetime.fromisoformat(end_time),
    )

    db.session.add(booking)
    db.session.commit()

    return jsonify({
        "message": "Booking created successfully",
        "booking_id": booking.id
    }), 201


# Get all bookings (current user)

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

    results = []
    for b in bookings:
        results.append({
            "id": b.id,
            "space_id": b.space_id,
            "start_time": b.start_time.isoformat(),
            "end_time": b.end_time.isoformat(),
            "created_at": b.created_at.isoformat(),
        })

    return jsonify(results), 200


# Get single booking

@bookings_bp.route("/<int:booking_id>", methods=["GET"])
@jwt_required()
def get_booking(booking_id):
    booking = Booking.query.get(booking_id)

    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    if booking.user_id != int(get_jwt_identity()):
        return jsonify({"error": "Unauthorized"}), 403

    return jsonify({
        "id": booking.id,
        "space_id": booking.space_id,
        "start_time": booking.start_time.isoformat(),
        "end_time": booking.end_time.isoformat(),
        "created_at": booking.created_at.isoformat(),
    }), 200


# Delete / cancel booking

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

    return jsonify({"message": "Booking cancelled"}), 200
