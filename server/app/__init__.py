import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from app.config import Config
from app.extensions import db, migrate, jwt

from app.routes.auth import auth_bp
from app.routes.admin import admin_bp
from app.routes.spaces import spaces_bp


def create_app():
    load_dotenv()

    app = Flask(__name__)
    app.config.from_object(Config)

    # Optional: allow env var to override Config
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL",
        app.config.get("SQLALCHEMY_DATABASE_URI", "sqlite:///spacer.db")
    )

    # Extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Ensure models are imported so migrations see them
    from app import models  # noqa: F401

    # CORS (Vite)
    CORS(
        app,
        resources={r"/*": {"origins": ["http://localhost:5173", "http://localhost:5174"]}},
    )

    # Blueprints
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api")
    app.register_blueprint(spaces_bp, url_prefix="/api")

    @app.get("/health")
    def health():
        return jsonify({"ok": True, "service": "spacer-api"}), 200

    return app
