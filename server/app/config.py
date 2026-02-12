import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///app.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")

    ENV = os.getenv("FLASK_ENV", "production")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

    if ENV != "development" and not JWT_SECRET_KEY:
        raise RuntimeError("JWT_SECRET_KEY must be set in production")

    
    if ENV == "development" and not JWT_SECRET_KEY:
        JWT_SECRET_KEY = "dev-only-change-me"

    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_EXPIRES_SECONDS", "86400"))
    
