from app.models.booking import Booking
from datetime import date

def check_availability(space_id):
    today = date.today()
    exists = Booking.query.filter_by(space_id=space_id, date=today).first()
    return exists is None
