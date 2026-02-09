from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from ..models import db, User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user.
    Expects JSON with email, password.
    Returns success message or error.
    """
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "User already exists"}), 400

    hashed = generate_password_hash(password)
    user = User(email=email, password_hash=hashed)
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User created"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login user and return JWT token.
    Expects JSON with email, password.
    Returns access token or error.
    """
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify({"access_token": access_token}), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Logout endpoint (client-side token removal).
    Requires JWT token.
    Returns success message.
    """
    # For JWT, logout is handled client-side by discarding the token
    # Server-side, we can just return success
    return jsonify({"message": "Logged out successfully"}), 200
