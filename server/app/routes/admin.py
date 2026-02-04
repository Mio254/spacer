from flask import Blueprint, jsonify
from app.models import User
from app.utils import role_required

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")

@admin_bp.get("/users")
@role_required("admin")
def list_users():
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify([u.to_dict() for u in users]), 200
