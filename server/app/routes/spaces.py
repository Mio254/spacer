from flask import Blueprint, request, jsonify

from app import db
from app.models import Space

spaces_bp = Blueprint('spaces', __name__)


def validate_space_data(data, is_update=False):
    """
    Shared validation for create/update.
    `is_update=True` allows partial updates.
    """
    errors = []

    if not is_update or 'name' in data:
        if not data.get('name') or len(data['name']) < 2:
            errors.append('Name must be at least 2 characters')

    if not is_update or 'price_per_hour' in data:
        price = data.get('price_per_hour')
        if price is None:
            errors.append('Price is required')
        elif not isinstance(price, (int, float)) or price <= 0:
            errors.append('Price must be a positive number')

    if not is_update or 'capacity' in data:
        capacity = data.get('capacity')
        if capacity is None:
            errors.append('Capacity is required')
        elif not isinstance(capacity, int) or capacity < 1:
            errors.append('Capacity must be at least 1')

    if 'image_url' in data and data['image_url']:
        if not data['image_url'].startswith(('http://', 'https://')):
            errors.append('Image URL must be valid (http/https)')

    return errors


# PUBLIC: Get all active spaces with filtering
@spaces_bp.route('/spaces', methods=['GET'])
def get_spaces():
    """Get all active spaces with optional filtering"""
    # Get query parameters
    location = request.args.get('location', '').strip()
    min_price = request.args.get('min_price')
    max_price = request.args.get('max_price')
    min_capacity = request.args.get('min_capacity')
    max_capacity = request.args.get('max_capacity')
    search = request.args.get('search', '').strip()
    
    # Start with base query
    query = Space.query.filter_by(is_active=True)
    
    # Apply filters if provided
    if location:
        query = query.filter(Space.location.ilike(f'%{location}%'))
    
    if search:
        query = query.filter(
            db.or_(
                Space.name.ilike(f'%{search}%'),
                Space.description.ilike(f'%{search}%'),
                Space.location.ilike(f'%{search}%')
            )
        )
    
    if min_price:
        try:
            query = query.filter(Space.price_per_hour >= float(min_price))
        except ValueError:
            pass
    
    if max_price:
        try:
            query = query.filter(Space.price_per_hour <= float(max_price))
        except ValueError:
            pass
    
    if min_capacity:
        try:
            query = query.filter(Space.capacity >= int(min_capacity))
        except ValueError:
            pass
    
    if max_capacity:
        try:
            query = query.filter(Space.capacity <= int(max_capacity))
        except ValueError:
            pass
    
    # Get results
    spaces = query.order_by(Space.name).all()
    return jsonify([space.to_dict() for space in spaces]), 200


# PUBLIC: Get available filter options
@spaces_bp.route('/spaces/filters', methods=['GET'])
def get_available_filters():
    """Get available filter options (locations, price ranges, capacities)"""
    try:
        # Get all active spaces
        spaces = Space.query.filter_by(is_active=True).all()
        
        # Extract unique locations (skip None/empty)
        locations = sorted(list(set(
            [s.location for s in spaces if s.location and s.location.strip()]
        )))
        
        # Calculate price range
        prices = [s.price_per_hour for s in spaces if s.price_per_hour]
        min_price = min(prices) if prices else 0
        max_price = max(prices) if prices else 10000
        
        # Calculate capacity range
        capacities = [s.capacity for s in spaces if s.capacity]
        min_capacity = min(capacities) if capacities else 0
        max_capacity = max(capacities) if capacities else 200
        
        return jsonify({
            'locations': locations,
            'price_range': {
                'min': float(min_price),
                'max': float(max_price)
            },
            'capacity_range': {
                'min': int(min_capacity),
                'max': int(max_capacity)
            }
        }), 200
        
    except Exception as e:
        print(f"Error getting filters: {e}")
        return jsonify({
            'locations': [],
            'price_range': {'min': 0, 'max': 10000},
            'capacity_range': {'min': 0, 'max': 200}
        }), 200


# PUBLIC: Get single space
@spaces_bp.route('/spaces/<int:space_id>', methods=['GET'])
def get_space(space_id):
    space = Space.query.get_or_404(space_id)

    # Hide inactive spaces from public access
    if not space.is_active:
        return jsonify({'error': 'Space not found'}), 404

    return jsonify(space.to_dict()), 200


# ADMIN: Create space (auth skipped for now)
@spaces_bp.route('/admin/spaces', methods=['GET', 'POST'])
def admin_spaces():
    if request.method == "GET":
        spaces = Space.query.all()
        return jsonify([space.to_dict() for space in spaces]), 200
    
    # POST logic below
    data = request.get_json() or {}

    validation_errors = validate_space_data(data)
    if validation_errors:
        return jsonify({'errors': validation_errors}), 400

    space = Space(
        name=data['name'],
        description=data.get('description', ''),
        price_per_hour=float(data['price_per_hour']),
        image_url=data.get('image_url', ''),
        capacity=int(data['capacity']),
        is_active=data.get('is_active', True),
    )

    db.session.add(space)
    db.session.commit()

    return jsonify(space.to_dict()), 201


# ADMIN: Update space (partial updates allowed)
@spaces_bp.route('/admin/spaces/<int:space_id>', methods=['PUT'])
def update_space(space_id):
    space = Space.query.get_or_404(space_id)
    data = request.get_json() or {}

    validation_errors = validate_space_data(data, is_update=True)
    if validation_errors:
        return jsonify({'errors': validation_errors}), 400

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


# ADMIN: Soft delete space
@spaces_bp.route('/admin/spaces/<int:space_id>', methods=['DELETE'])
def delete_space(space_id):
    space = Space.query.get_or_404(space_id)

    # Soft delete to preserve bookings/history
    space.is_active = False
    db.session.commit()

    return jsonify({'message': 'Space deleted'}), 200
