import re
import time
from collections import deque

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from app.extensions import db
from app.models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _norm_email(value: str | None) -> str:
    return (value or "").strip().lower()


def _client_ip() -> str:
    forwarded_for = request.headers.get("X-Forwarded-For", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.remote_addr or "unknown"


_RATE_LIMITS = {
    "register": {"count": 5, "window": 60 * 60},
    "login": {"count": 10, "window": 15 * 60},
}
_RATE_BUCKETS: dict[tuple[str, str, str], deque[float]] = {}


def _rate_limited(action: str, email: str) -> tuple[bool, int]:
    limit = _RATE_LIMITS[action]
    key = (action, _client_ip(), email or "unknown")
    now = time.monotonic()
    cutoff = now - limit["window"]

    bucket = _RATE_BUCKETS.setdefault(key, deque())
    while bucket and bucket[0] < cutoff:
        bucket.popleft()

    if len(bucket) >= limit["count"]:
        retry_after = int(limit["window"] - (now - bucket[0]))
        return True, max(retry_after, 1)

    bucket.append(now)
    return False, 0


def _password_ok(password: str) -> bool:
    if len(password) < 8:
        return False
    if not re.search(r"[A-Za-z]", password):
        return False
    if not re.search(r"\d", password):
        return False
    return True


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}

    email = _norm_email(data.get("email"))
    password = data.get("password") or ""
    full_name = (data.get("full_name") or data.get("name") or "").strip()

    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400

    if not EMAIL_RE.match(email):
        return jsonify({"error": "invalid email"}), 400

    if not _password_ok(password):
        return jsonify(
            {"error": "password must be at least 8 characters and include letters and numbers"}
        ), 400

    limited, retry_after = _rate_limited("register", email)
    if limited:
        return (
            jsonify({"error": "too many attempts, try again later"}),
            429,
            {"Retry-After": str(retry_after)},
        )

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "registration failed"}), 400

    user = User(email=email, full_name=full_name or None, role="client", is_active=True)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})
    return jsonify({"token": token, "user": user.to_dict()}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}

    email = _norm_email(data.get("email"))
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400

    if not EMAIL_RE.match(email):
        return jsonify({"error": "invalid email"}), 400

    limited, retry_after = _rate_limited("login", email)
    if limited:
        return (
            jsonify({"error": "too many attempts, try again later"}),
            429,
            {"Retry-After": str(retry_after)},
        )

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "invalid credentials"}), 401

    if not user.is_active:
        return jsonify({"error": "invalid credentials"}), 401

    token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})
    return jsonify({"token": token, "user": user.to_dict()}), 200


@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = get_jwt_identity()

    try:
        uid = int(user_id)
    except (TypeError, ValueError):
        return jsonify({"error": "invalid token identity"}), 401

    user = db.session.get(User, uid)
    if not user:
        return jsonify({"error": "user not found"}), 404

    return jsonify({"user": user.to_dict()}), 200
