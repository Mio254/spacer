from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import db, AgreementAcceptance, Booking
from datetime import datetime

agreements_bp = Blueprint('agreements', __name__)

@agreements_bp.route('/accept', methods=['POST'])
@jwt_required()
def accept_agreement():
    data = request.get_json()
    booking_id = data.get('booking_id')

    if not booking_id:
        return jsonify({"error": "booking_id required"}), 400

    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    if booking.user_id != get_jwt_identity():
        return jsonify({"error": "Unauthorized"}), 403

    # Check if already accepted
    existing = AgreementAcceptance.query.filter_by(user_id=get_jwt_identity(), booking_id=booking_id).first()
    if existing:
        return jsonify({"error": "Agreement already accepted"}), 400

    acceptance = AgreementAcceptance(
        user_id=get_jwt_identity(),
        booking_id=booking_id,
        ip_address=request.remote_addr
    )
    db.session.add(acceptance)
    db.session.commit()

    return jsonify({"message": "Agreement accepted", "accepted_at": acceptance.accepted_at.isoformat()}), 201
