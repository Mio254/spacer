from app.extensions import db

class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    space_id = db.Column(db.Integer, nullable=False)
    start_date = db.Column(db.String, nullable=False)
    end_date = db.Column(db.String, nullable=False)
    duration = db.Column(db.Integer, nullable=False)
    total_cost = db.Column(db.Integer, nullable=False)
