from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt

from app.extensions import db
from app.models import Space

spaces_bp = Blueprint("spaces", __name__, url_prefix="/api")


def _require_admin():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "admin access required"}), 403
    return None


@spaces_bp.get("/spaces")
def get_spaces():
    spaces = Space.query.filter_by(is_active=True).all()
    return jsonify([space.to_dict() for space in spaces]), 200


@spaces_bp.get("/spaces/<int:space_id>")
def get_space(space_id):
    space = Space.query.get_or_404(space_id)
    if not space.is_active:
        return jsonify({"error": "space not found"}), 404
    return jsonify(space.to_dict()), 200


@spaces_bp.post("/admin/spaces")
@jwt_required()
def create_space():
    denied = _require_admin()
    if denied:
        return denied

    data = request.get_json(silent=True) or {}

    required_fields = ["name", "description", "price_per_hour", "capacity"]
    for field in required_fields:
        if field not in data or data.get(field) in (None, ""):
            return jsonify({"error": f"{field} is required"}), 400

    # Create base space
    space = Space(
        name=str(data["name"]).strip(),
        description=str(data["description"]).strip(),
        price_per_hour=float(data["price_per_hour"]),
        image_url=str(data.get("image_url", "") or "").strip(),
        capacity=int(data["capacity"]),
        is_active=bool(data.get("is_active", True)),
    )

    
    optional_map = {
        "location": data.get("location"),
        "max_capacity": data.get("max_capacity"),
        "operating_hours": data.get("operating_hours"),
    }

    for attr, value in optional_map.items():
        if value is None or value == "":
            continue
        if hasattr(space, attr):
            
            if attr in ("capacity", "max_capacity"):
                setattr(space, attr, int(value))
            else:
                setattr(space, attr, str(value).strip())

    db.session.add(space)
    db.session.commit()

    return jsonify(space.to_dict()), 201


@spaces_bp.put("/admin/spaces/<int:space_id>")
@jwt_required()
def update_space(space_id):
    denied = _require_admin()
    if denied:
        return denied

    space = Space.query.get_or_404(space_id)
    data = request.get_json(silent=True) or {}

    if "name" in data:
        space.name = str(data["name"]).strip()
    if "description" in data:
        space.description = str(data["description"]).strip()
    if "price_per_hour" in data:
        space.price_per_hour = float(data["price_per_hour"])
    if "image_url" in data:
        space.image_url = str(data["image_url"] or "").strip()
    if "capacity" in data:
        space.capacity = int(data["capacity"])
    if "is_active" in data:
        space.is_active = bool(data["is_active"])

    
    if "location" in data and hasattr(space, "location"):
        space.location = str(data["location"] or "").strip()
    if "max_capacity" in data and hasattr(space, "max_capacity"):
        space.max_capacity = int(data["max_capacity"])
    if "operating_hours" in data and hasattr(space, "operating_hours"):
        space.operating_hours = str(data["operating_hours"] or "").strip()

    db.session.commit()
    return jsonify(space.to_dict()), 200


@spaces_bp.delete("/admin/spaces/<int:space_id>")
@jwt_required()
def delete_space(space_id):
    denied = _require_admin()
    if denied:
        return denied

    space = Space.query.get_or_404(space_id)
    space.is_active = False
    db.session.commit()

    return jsonify({"message": "space deleted"}), 200