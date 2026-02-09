from functools import wraps
from flask import request, jsonify

def auth_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"error": "Unauthorized"}), 401
        # Add token verification logic here
        return fn(*args, **kwargs)
    return wrapper
