from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import db, Space

spaces_bp = Blueprint('spaces', __name__)

@spaces_bp.route('/', methods=['GET'])
def get_spaces():
    spaces = Space.query.all()
    return jsonify([{
        'id': s.id,
        'name': s.name,
        'description': s.description,
        'owner_id': s.owner_id,
        'price_per_hour': s.price_per_hour,
        'created_at': s.created_at.isoformat()
    } for s in spaces]), 200

@spaces_bp.route('/<int:space_id>', methods=['GET'])
def get_space(space_id):
    space = Space.query.get(space_id)
    if not space:
        return jsonify({"error": "Space not found"}), 404
    return jsonify({
        'id': space.id,
        'name': space.name,
        'description': space.description,
        'owner_id': space.owner_id,
        'price_per_hour': space.price_per_hour,
        'created_at': space.created_at.isoformat()
    }), 200

@spaces_bp.route('/', methods=['POST'])
@jwt_required()
def create_space():
    data = request.get_json()
    name = data.get('name')
    description = data.get('description')
    price_per_hour = data.get('price_per_hour')

    if not name or not price_per_hour:
        return jsonify({"error": "name and price_per_hour required"}), 400

    space = Space(
        name=name,
        description=description,
        owner_id=get_jwt_identity(),
        price_per_hour=price_per_hour
    )
    db.session.add(space)
    db.session.commit()

    return jsonify({
        'id': space.id,
        'name': space.name,
        'description': space.description,
        'owner_id': space.owner_id,
        'price_per_hour': space.price_per_hour,
        'created_at': space.created_at.isoformat()
    }), 201

@spaces_bp.route('/<int:space_id>', methods=['PUT'])
@jwt_required()
def update_space(space_id):
    space = Space.query.get(space_id)
    if not space:
        return jsonify({"error": "Space not found"}), 404

    if space.owner_id != get_jwt_identity():
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    if 'name' in data:
        space.name = data['name']
    if 'description' in data:
        space.description = data['description']
    if 'price_per_hour' in data:
        space.price_per_hour = data['price_per_hour']

    db.session.commit()

    return jsonify({
        'id': space.id,
        'name': space.name,
        'description': space.description,
        'owner_id': space.owner_id,
        'price_per_hour': space.price_per_hour,
        'created_at': space.created_at.isoformat()
    }), 200

@spaces_bp.route('/<int:space_id>', methods=['DELETE'])
@jwt_required()
def delete_space(space_id):
    space = Space.query.get(space_id)
    if not space:
        return jsonify({"error": "Space not found"}), 404

    if space.owner_id != get_jwt_identity():
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(space)
    db.session.commit()

    return jsonify({"message": "Space deleted"}), 200
