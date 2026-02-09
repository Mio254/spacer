from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import db, Booking, Space
from datetime import datetime

bookings_bp = Blueprint('bookings', __name__)

@bookings_bp.route('/', methods=['POST'])
@jwt_required()
def create_booking():
    data = request.get_json()
    space_id = data.get('space_id')
    start_time_str = data.get('start_time')
    end_time_str = data.get('end_time')

    if not space_id or not start_time_str or not end_time_str:
        return jsonify({"error": "space_id, start_time, end_time required"}), 400

    space = Space.query.get(space_id)
    if not space:
        return jsonify({"error": "Space not found"}), 404

    try:
        start_time = datetime.fromisoformat(start_time_str)
        end_time = datetime.fromisoformat(end_time_str)
    except ValueError:
        return jsonify({"error": "Invalid datetime format"}), 400

    if start_time >= end_time:
        return jsonify({"error": "start_time must be before end_time"}), 400

    # Calculate amount
    hours = (end_time - start_time).total_seconds() / 3600
    amount = hours * space.price_per_hour

    booking = Booking(
        user_id=int(get_jwt_identity()),
        space_id=space_id,
        start_time=start_time,
        end_time=end_time
    )
    db.session.add(booking)
    db.session.commit()

    return jsonify({
        'id': booking.id,
        'space_id': booking.space_id,
        'start_time': booking.start_time.isoformat(),
        'end_time': booking.end_time.isoformat(),
        'amount': amount
    }), 201

# Assuming other booking endpoints exist, adding payment status update

@bookings_bp.route('/<int:booking_id>/payment-status', methods=['PUT'])
@jwt_required()
def update_payment_status(booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    # Allow admin or the user
    current_user = int(get_jwt_identity())
    # Assuming User model has role, but for simplicity, check if user_id matches or admin
    if booking.user_id != current_user:
        # In real app, check role
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    status = data.get('payment_status')
    if status not in ['unpaid', 'paid', 'refunded']:
        return jsonify({"error": "Invalid status"}), 400 

    booking.payment_status = status
    db.session.commit()

    return jsonify({"message": "Payment status updated"}), 200 


