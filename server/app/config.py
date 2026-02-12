import os

class Config:

    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///spacer.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    
    ENV = os.getenv("FLASK_ENV", "production")

 
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY") or (
        "dev-jwt-secret" if ENV == "development" else None
    )

    SECRET_KEY = os.getenv("SECRET_KEY") or (
        "dev-secret" if ENV == "development" else None
    )

    
    STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")

    
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_EXPIRES_SECONDS", "86400"))