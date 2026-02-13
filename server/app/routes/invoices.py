from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import Invoice, Booking, Space

invoices_bp = Blueprint("invoices", __name__, url_prefix="/api/invoices")


@invoices_bp.get("/<int:invoice_id>")
@jwt_required()
def get_invoice(invoice_id: int):
    user_id = int(get_jwt_identity())

    invoice = db.session.get(Invoice, invoice_id)
    if not invoice:
        return jsonify({"error": "Invoice not found"}), 404

    if invoice.user_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    booking = db.session.get(Booking, invoice.booking_id)
    space = db.session.get(Space, booking.space_id) if booking else None

    amount_kes = (invoice.amount_minor or 0) / 100.0

    return jsonify({
        "invoice": {
            "id": invoice.id,
            "booking_id": invoice.booking_id,
            "user_id": invoice.user_id,
            "amount_minor": invoice.amount_minor,
            "amount": amount_kes,
            "currency": invoice.currency,
            "status": invoice.status,
            "issued_at": invoice.issued_at.isoformat() if invoice.issued_at else None,
            "due_at": invoice.due_at.isoformat() if invoice.due_at else None,
            "space_id": booking.space_id if booking else None,
            "space_name": space.name if space else None,
            "location": space.location if space else None,
            "start_time": booking.start_time.isoformat() if booking and booking.start_time else None,
            "end_time": booking.end_time.isoformat() if booking and booking.end_time else None,
        }
    }), 200
