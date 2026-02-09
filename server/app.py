from flask import Flask, jsonify
from flask_cors import CORS

from app.extensions import db, jwt
from app.routes.auth import auth_bp
from app.routes.spaces import spaces_bp
from app.routes.booking_routes import booking_bp

app = Flask(__name__)
CORS(app)  # allow frontend to fetch

app.config["JWT_SECRET_KEY"] = "super-secret-key"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///spacer.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
jwt.init_app(app)

# Register blueprints with **no /api prefix** — matches frontend
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(spaces_bp, url_prefix="/spaces")
app.register_blueprint(booking_bp, url_prefix="/bookings")

# Health check route
@app.route("/health")
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(port=5001, debug=True)
