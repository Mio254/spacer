from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

from app.config import Config
from app.extensions import db, migrate, jwt

cors = CORS()


def create_app():
    load_dotenv()

    app = Flask(__name__)
    app.url_map.strict_slashes = False

    # Load config
    app.config.from_object(Config)

    
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL",
        app.config.get("SQLALCHEMY_DATABASE_URI")
    )

    
    env = (app.config.get("ENV") or "").lower()
    is_dev = env in ("development", "dev")

    if not is_dev:
        if not app.config.get("JWT_SECRET_KEY"):
            raise RuntimeError("JWT_SECRET_KEY must be set in production")
        if not app.config.get("SECRET_KEY"):
            raise RuntimeError("SECRET_KEY must be set in production")

  
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    
    from app import models  # noqa: F401

   
    cors.init_app(
        app,
        resources={
            r"/api/*": {
                "origins": [
                    "http://localhost:5173",
                    "http://127.0.0.1:5173",
                    "http://localhost:5174",
                    "http://127.0.0.1:5174",
                    "https://spacer-6fe2c.web.app",
                    "https://spacer-6fe2c.firebaseapp.com",
                ]
            }
        },
        supports_credentials=False,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    )

    
    from app.routes.auth import auth_bp
    from app.routes.admin import admin_bp
    from app.routes.spaces import spaces_bp
    from app.routes.bookings import bookings_bp
    from app.routes.invoices import invoices_bp
    from app.routes.payments import payments_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(spaces_bp)
    app.register_blueprint(bookings_bp)
    app.register_blueprint(invoices_bp)
    app.register_blueprint(payments_bp)

    @app.get("/health")
    def health():
        return jsonify({"ok": True, "service": "spacer-api"}), 200

    return app