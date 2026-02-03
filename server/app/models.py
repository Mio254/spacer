from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    """
    User model representing a user in the system.

    Attributes:
        id (int): Primary key.
        email (str): Unique email address.
        password_hash (str): Hashed password.
        role (str): User role, default 'client'.
        created_at (datetime): Timestamp of creation.
    """
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='client')  # admin or client
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Space(db.Model):
    """
    Space model representing a rentable space.

    Attributes:
        id (int): Primary key.
        name (str): Name of the space.
        description (str): Description of the space.
        owner_id (int): Foreign key to User.
        price_per_hour (float): Hourly price.
        created_at (datetime): Timestamp of creation.
    """
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    price_per_hour = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Booking(db.Model):
    """
    Booking model representing a booking of a space.

    Attributes:
        id (int): Primary key.
        user_id (int): Foreign key to User.
        space_id (int): Foreign key to Space.
        start_time (datetime): Start time of booking.
        end_time (datetime): End time of booking.
        status (str): Booking status (pending, confirmed, active, completed, cancelled).
        payment_status (str): Payment status (unpaid, paid, refunded).
        created_at (datetime): Timestamp of creation.
    """
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    space_id = db.Column(db.Integer, db.ForeignKey('space.id'), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), nullable=False, default='pending')  # pending, confirmed, active, completed, cancelled
    payment_status = db.Column(db.String(20), nullable=False, default='unpaid')  # unpaid, paid, refunded
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Payment(db.Model):
    """
    Payment model representing a payment for a booking.

    Attributes:
        id (int): Primary key.
        booking_id (int): Foreign key to Booking.
        amount (float): Payment amount.
        currency (str): Currency code, default 'usd'.
        status (str): Payment status (unpaid, paid, refunded).
        stripe_payment_intent_id (str): Stripe payment intent ID.
        created_at (datetime): Timestamp of creation.
    """
    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('booking.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), default='usd')
    status = db.Column(db.String(20), nullable=False, default='unpaid')  # unpaid, paid, refunded
    stripe_payment_intent_id = db.Column(db.String(100), unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Invoice(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('booking.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), default='usd')
    issued_at = db.Column(db.DateTime, default=datetime.utcnow)
    due_at = db.Column(db.DateTime)

class AgreementAcceptance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    booking_id = db.Column(db.Integer, db.ForeignKey('booking.id'), nullable=False)
    accepted_at = db.Column(db.DateTime, default=datetime.utcnow)
    ip_address = db.Column(db.String(45))  # IPv4 or IPv6
