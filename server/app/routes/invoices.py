from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import Invoice, Booking, Space

invoices_bp = Blueprint("invoices", __name__, url_prefix="/api/invoices")


@invoices_bp.get("/<int:invoice_id>")
@jwt_required()
def get_invoice(invoice_id: int):
    invoice = db.session.get(Invoice, invoice_id)
    if not invoice:
        return jsonify({"error": "Invoice not found"}), 404

    if invoice.user_id != int(get_jwt_identity()):
        return jsonify({"error": "Unauthorized"}), 403

    booking = db.session.get(Booking, invoice.booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    space = db.session.get(Space, booking.space_id)
    if not space:
        return jsonify({"error": "Space not found"}), 404

    invoice_data = {
        "id": invoice.id,
        "booking_id": invoice.booking_id,
        "space_name": space.name,
        "amount": invoice.amount,
        "currency": invoice.currency,
        "issued_at": invoice.issued_at.isoformat() if invoice.issued_at else None,
        "due_at": invoice.due_at.isoformat() if invoice.due_at else None,
        "start_time": booking.start_time.isoformat(),
        "end_time": booking.end_time.isoformat(),
    }

    return jsonify(invoice_data), 200
