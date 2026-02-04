from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from dotenv import load_dotenv
from app.config import Config
from app.extensions import db, migrate, jwt
from app.routes.auth import auth_bp
from app.routes.admin import admin_bp
import os

# package marker

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    load_dotenv()

    app = Flask(__name__)
    
    # Database config
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
        'DATABASE_URL', 'sqlite:///spacer.db'
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    
    # CORS
    CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://localhost:5174"]}})


    # ✅ IMPORT MODELS HERE (before return)
    from . import models

    @app.get("/health")
    def health():
        return jsonify({"ok": True, "service": "spacer-api"}), 200

    # ✅ REGISTER BLUEPRINTS (CRITICAL - ADDED)
    from app.routes.spaces import spaces_bp
    app.register_blueprint(spaces_bp, url_prefix='/api')

    return app

def create_app():
    load_dotenv()

    app = Flask(__name__)
    app.config.from_object(Config)

    # Extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # CORS for Vite
    CORS(app, resources={r"/*": {"origins": ["http://localhost:5173"]}})

    # Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)

    @app.get("/health")
    def health():
        return jsonify({"ok": True, "service": "spacer-api"}), 200

    return app