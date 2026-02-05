import re
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt

from app.extensions import db
from app.models import User

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
    """
    Admin creates a user.
    Body:
      {
        "email": "...",
        "password": "...",
        "full_name": "...",   (optional)
        "role": "admin|client" (optional, default client)
      }
    """
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
        return jsonify(
            {"error": "password must be at least 8 characters and include letters and numbers"}
        ), 400

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
    """
    Admin can update:
      - role: "admin" | "client"
      - is_active: true|false
      - full_name: string|null
    """
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
