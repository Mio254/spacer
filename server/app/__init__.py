from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from .config import Config
from .models import db
from .routes.auth import auth_bp
from .routes.bookings import bookings_bp
from .routes.spaces import spaces_bp
from .routes.payments import payments_bp
from .routes.invoices import invoices_bp
from .routes.agreements import agreements_bp

def create_app():
    load_dotenv()

    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    jwt = JWTManager(app)

    # Vite dev server
    CORS(app, resources={r"/*": {"origins": ["http://localhost:5173"]}})

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(bookings_bp, url_prefix='/bookings')
    app.register_blueprint(spaces_bp, url_prefix='/spaces')
    app.register_blueprint(payments_bp, url_prefix='/payments')
    app.register_blueprint(invoices_bp, url_prefix='/invoices')
    app.register_blueprint(agreements_bp, url_prefix='/agreements')

    @app.get("/health")
    def health():
        return jsonify({"ok": True, "service": "spacer-api"}), 200

    @app.route('/favicon.ico')
    def favicon():
        return '', 204

    @app.route('/')
    def index():
        return jsonify({"message": "Welcome to Spacer API"}), 200

    return app
