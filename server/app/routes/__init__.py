from .auth import auth_bp
from .admin import admin_bp
from .spaces import spaces_bp  
from .bookings import bookings_bp
from .invoices import invoices_bp
from .payments import payments_bp

__all__ = [
    "auth_bp",
    "admin_bp",
    "spaces_bp",
    "bookings_bp",
    "invoices_bp",
    "payments_bp",
]
