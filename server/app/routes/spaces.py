from flask import Blueprint, jsonify
from app.models.space import Space

spaces_bp = Blueprint("spaces", __name__)

@spaces_bp.route("/", methods=["GET"])
def get_spaces():
    spaces = Space.query.all()
    return jsonify([s.to_dict() for s in spaces])
