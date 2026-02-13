import re
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt

from app.extensions import db
from app.models import User, Space, Booking


admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")




def _require_admin():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "admin access required"}), 403
    return None


def _norm_email(value):
    return (value or "").strip().lower()


def _password_ok(password: str) -> bool:
    if len(password) < 8:
        return False
    if not re.search(r"[A-Za-z]", password):
        return False
    if not re.search(r"\d", password):
        return False
    return True




@admin_bp.get("/users")
@jwt_required()
def list_users():
    denied = _require_admin()
    if denied:
        return denied

    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify({"users": [u.to_dict() for u in users]}), 200


@admin_bp.post("/users")
@jwt_required()
def create_user():
    denied = _require_admin()
    if denied:
        return denied

    data = request.get_json(silent=True) or {}

    email = _norm_email(data.get("email"))
    password = data.get("password") or ""
    full_name = (data.get("full_name") or data.get("name") or "").strip()
    role = (data.get("role") or "client").strip().lower()

    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400

    if not EMAIL_RE.match(email):
        return jsonify({"error": "invalid email"}), 400

    if not _password_ok(password):
        return jsonify({"error": "password must be at least 8 characters and include letters and numbers"}), 400

    if role not in ("admin", "client"):
        return jsonify({"error": "role must be 'admin' or 'client'"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "email already registered"}), 409

    user = User(
        email=email,
        full_name=full_name or None,
        role=role,
        is_active=True,
    )
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    return jsonify({"user": user.to_dict()}), 201


@admin_bp.patch("/users/<int:user_id>")
@jwt_required()
def update_user(user_id: int):
    denied = _require_admin()
    if denied:
        return denied

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "user not found"}), 404

    data = request.get_json(silent=True) or {}

    if "role" in data:
        role = (data.get("role") or "").strip().lower()
        if role not in ("admin", "client"):
            return jsonify({"error": "role must be 'admin' or 'client'"}), 400
        user.role = role

    if "is_active" in data:
        if not isinstance(data["is_active"], bool):
            return jsonify({"error": "is_active must be boolean"}), 400
        user.is_active = data["is_active"]

    if "full_name" in data or "name" in data:
        full_name = (data.get("full_name") or data.get("name") or "").strip()
        user.full_name = full_name or None

    db.session.commit()
    return jsonify({"user": user.to_dict()}), 200




@admin_bp.get("/spaces")
@jwt_required()
def list_spaces():
    denied = _require_admin()
    if denied:
        return denied

    spaces = Space.query.order_by(Space.created_at.desc()).all()
    return jsonify({"spaces": [s.to_dict() for s in spaces]}), 200


@admin_bp.patch("/spaces/<int:space_id>")
@jwt_required()
def update_space(space_id: int):
    denied = _require_admin()
    if denied:
        return denied

    space = db.session.get(Space, space_id)
    if not space:
        return jsonify({"error": "space not found"}), 404

    data = request.get_json(silent=True) or {}

    if "is_active" in data:
        if not isinstance(data["is_active"], bool):
            return jsonify({"error": "is_active must be boolean"}), 400
        space.is_active = data["is_active"]

    db.session.commit()
    return jsonify({"space": space.to_dict()}), 200




_ALLOWED_BOOKING_STATUSES = {"confirmed", "cancelled", "paid", "unpaid", "pending"}


@admin_bp.get("/bookings")
@jwt_required()
def list_bookings():
    denied = _require_admin()
    if denied:
        return denied

    bookings = (
        Booking.query
        .order_by(Booking.created_at.desc())
        .all()
    )

    return jsonify({"bookings": [b.to_dict() for b in bookings]}), 200


@admin_bp.patch("/bookings/<int:booking_id>")
@jwt_required()
def update_booking(booking_id: int):
    denied = _require_admin()
    if denied:
        return denied

    booking = db.session.get(Booking, booking_id)
    if not booking:
        return jsonify({"error": "booking not found"}), 404

    data = request.get_json(silent=True) or {}

    if "status" in data:
        status = (data.get("status") or "").strip().lower()
        if status not in _ALLOWED_BOOKING_STATUSES:
            return jsonify({"error": f"status must be one of: {sorted(_ALLOWED_BOOKING_STATUSES)}"}), 400
        booking.status = status

    db.session.commit()
    return jsonify({"booking": booking.to_dict()}), 200