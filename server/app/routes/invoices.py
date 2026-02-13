from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import Invoice, Booking, Space

invoices_bp = Blueprint('invoices', __name__)

@invoices_bp.route('/<int:invoice_id>', methods=['GET'])
@jwt_required()
def get_invoice(invoice_id):
    invoice = Invoice.query.get(invoice_id)
    if not invoice:
        return jsonify({"error": "Invoice not found"}), 404

    if invoice.user_id != int(get_jwt_identity()):
        return jsonify({"error": "Unauthorized"}), 403

    booking = Booking.query.get(invoice.booking_id)
    space = Space.query.get(booking.space_id)

    invoice_data = {
        'id': invoice.id,
        'booking_id': invoice.booking_id,
        'space_name': space.name,
        'amount': invoice.amount,
        'currency': invoice.currency,
        'issued_at': invoice.issued_at.isoformat(),
        'due_at': invoice.due_at.isoformat() if invoice.due_at else None,
        'start_time': booking.start_time.isoformat(),
        'end_time': booking.end_time.isoformat(),
        'payment_status': booking.payment_status
    }

    return jsonify(invoice_data), 200
