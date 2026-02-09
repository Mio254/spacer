from flask import request, jsonify
from app.extensions import db
from app.models.booking import Booking
from app.services.availability_service import check_availability

def check_availability_controller(space_id):
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")

    available = check_availability(space_id, start_date, end_date)
    return jsonify({"available": available})

def create_booking_controller():
    data = request.get_json()

    booking = Booking(
        user_id=1,  # replace with JWT user later
        space_id=data["space_id"],
        start_date=data["start_date"],
        end_date=data["end_date"],
        duration=data["duration"],
        total_cost=100
    )

    db.session.add(booking)
    db.session.commit()

    return jsonify({"message": "Booking created"}), 201
