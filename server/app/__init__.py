import os
from flask import Flask, jsonify
from dotenv import load_dotenv
from flask_cors import CORS

from app.extensions import db, migrate, jwt

cors = CORS()

def create_app():
    load_dotenv()

    app = Flask(__name__)

    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///spacer.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret")

    # optional; we will not require it for demo
    app.config["STRIPE_SECRET_KEY"] = os.getenv("STRIPE_SECRET_KEY", "")

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Ensure models imported for migrations
    from app import models  # noqa: F401

    with app.app_context():
        db.create_all()

    cors.init_app(
        app,
        resources={r"/api/*": {"origins": [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5174",
        ]}},
        supports_credentials=True,
    )

    
    from app.routes.auth import auth_bp
    from app.routes.spaces import spaces_bp
    from app.routes.bookings import bookings_bp
    from app.routes.invoices import invoices_bp
    from app.routes.payments import payments_bp

    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(spaces_bp, url_prefix='/api')
    app.register_blueprint(bookings_bp, url_prefix='/api')
    app.register_blueprint(invoices_bp, url_prefix='/api')
    app.register_blueprint(payments_bp, url_prefix='/api')

    @app.get("/health")
    def health():
        return jsonify({"ok": True, "service": "spacer-api"}), 200

    return app
