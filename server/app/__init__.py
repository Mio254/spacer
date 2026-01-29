from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

def create_app():
    load_dotenv()

    app = Flask(__name__)

    # Vite dev server
    CORS(app, resources={r"/*": {"origins": ["http://localhost:5173"]}})

    @app.get("/health")
    def health():
        return jsonify({"ok": True, "service": "spacer-api"}), 200

    return app
