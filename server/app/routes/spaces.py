from flask import Blueprint, request, jsonify
from app import db
from app.models import Space

spaces_bp = Blueprint('spaces', __name__)

# PUBLIC: Get all spaces
@spaces_bp.route('/spaces', methods=['GET'])
def get_spaces():
    spaces = Space.query.filter_by(is_active=True).all()
    return jsonify([space.to_dict() for space in spaces]), 200

# PUBLIC: Get single space
@spaces_bp.route('/spaces/<int:space_id>', methods=['GET'])
def get_space(space_id):
    space = Space.query.get_or_404(space_id)
    if not space.is_active:
        return jsonify({'error': 'Space not found'}), 404
    return jsonify(space.to_dict()), 200

# ADMIN: Create space (no auth for testing)
@spaces_bp.route('/admin/spaces', methods=['POST'])
def create_space():
    data = request.get_json()
    
    required_fields = ['name', 'description', 'price_per_hour', 'capacity']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    space = Space(
        name=data['name'],
        description=data['description'],
        price_per_hour=float(data['price_per_hour']),
        image_url=data.get('image_url', ''),
        capacity=int(data['capacity']),
        is_active=data.get('is_active', True)
    )
    
    db.session.add(space)
    db.session.commit()
    return jsonify(space.to_dict()), 201

# ADMIN: Update space (no auth for testing)
@spaces_bp.route('/admin/spaces/<int:space_id>', methods=['PUT'])
def update_space(space_id):
    space = Space.query.get_or_404(space_id)
    data = request.get_json()
    
    if 'name' in data:
        space.name = data['name']
    if 'description' in data:
        space.description = data['description']
    if 'price_per_hour' in data:
        space.price_per_hour = float(data['price_per_hour'])
    if 'image_url' in data:
        space.image_url = data['image_url']
    if 'capacity' in data:
        space.capacity = int(data['capacity'])
    if 'is_active' in data:
        space.is_active = bool(data['is_active'])
    
    db.session.commit()
    return jsonify(space.to_dict()), 200

# ADMIN: Delete space (soft delete, no auth for testing)
@spaces_bp.route('/admin/spaces/<int:space_id>', methods=['DELETE'])
def delete_space(space_id):
    space = Space.query.get_or_404(space_id)
    space.is_active = False
    db.session.commit()
    return jsonify({'message': 'Space deleted'}), 200
