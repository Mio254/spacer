from app.extensions import db

class Space(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    price_per_hour = db.Column(db.Integer)
