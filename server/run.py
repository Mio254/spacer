from flask import Flask, request, jsonify, make_response
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy
import jwt
from functools import wraps
import datetime

app = Flask(__name__)
bcrypt = Bcrypt(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///spacer.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'supersecret'

db = SQLAlchemy(app)

# =========================
# Models
# =========================
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    full_name = db.Column(db.String(120), nullable=False)

class Space(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120))
    description = db.Column(db.String(300))
    location = db.Column(db.String(120))

# =========================
# Force CORS for all responses
# =========================
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

@app.route('/api/<path:path>', methods=['OPTIONS'])
def cors_preflight(path):
    response = make_response('', 200)
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

# =========================
# JWT Auth decorator
# =========================
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        if not token:
            return jsonify({'error': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['id'])
        except:
            return jsonify({'error': 'Token is invalid!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

# =========================
# Auth routes (safe JSON parsing)
# =========================
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json(force=True)
    except:
        return jsonify({'error': 'Invalid JSON'}), 400
    if not data or not all(k in data for k in ('email','password','full_name')):
        return jsonify({'error':'Missing fields'}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error':'User exists'}), 400
    hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user = User(email=data['email'], password=hashed_pw, full_name=data['full_name'])
    db.session.add(user)
    db.session.commit()
    token = jwt.encode({'id': user.id, 'exp': datetime.datetime.utcnow()+datetime.timedelta(hours=1)}, app.config['SECRET_KEY'], algorithm='HS256')
    return jsonify({'token': token, 'user': {'id': user.id, 'email': user.email, 'full_name': user.full_name}})

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json(force=True)
    except:
        return jsonify({'error': 'Invalid JSON'}), 400
    if not data or not all(k in data for k in ('email','password')):
        return jsonify({'error':'Missing fields'}), 400
    user = User.query.filter_by(email=data['email']).first()
    if not user or not bcrypt.check_password_hash(user.password, data['password']):
        return jsonify({'error':'Invalid credentials'}), 400
    token = jwt.encode({'id': user.id, 'exp': datetime.datetime.utcnow()+datetime.timedelta(hours=1)}, app.config['SECRET_KEY'], algorithm='HS256')
    return jsonify({'token': token, 'user': {'id': user.id, 'email': user.email, 'full_name': user.full_name}})

@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_me(current_user):
    return jsonify({'user': {'id': current_user.id, 'email': current_user.email, 'full_name': current_user.full_name}})

# =========================
# Spaces routes
# =========================
@app.route('/api/spaces', methods=['GET'])
def get_spaces():
    spaces = Space.query.all()
    return jsonify({'spaces':[{'id':s.id,'name':s.name,'description':s.description,'location':s.location} for s in spaces]})

@app.route('/api/spaces/<int:space_id>', methods=['GET'])
def get_space(space_id):
    s = Space.query.get(space_id)
    if not s:
        return jsonify({'error':'Space not found'}), 404
    return jsonify({'space':{'id':s.id,'name':s.name,'description':s.description,'location':s.location}})

# =========================
# Run app
# =========================
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        if not Space.query.first():
            db.session.add(Space(name="Main Hall", description="Spacious hall for events", location="1st Floor"))
            db.session.add(Space(name="Conference Room", description="Small meeting room", location="2nd Floor"))
            db.session.add(Space(name="Outdoor Patio", description="Open space for relaxation", location="Ground Floor"))
            db.session.commit()
    app.run(debug=True, port=5001)
