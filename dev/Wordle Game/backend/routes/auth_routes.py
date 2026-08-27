"""Authentication & User Profile Routes"""

from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timedelta
import jwt
from functools import wraps
from extensions import db
from models import User

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Authorization token is missing'}), 401
        
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return jsonify({'error': 'Invalid token format. Expected Bearer <token>'}), 401
            
        token = parts[1]
        try:
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.filter_by(username=payload['username']).first()
            if not current_user:
                return jsonify({'error': 'User not found'}), 404
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except Exception as e:
            return jsonify({'error': f'Invalid token: {str(e)}'}), 401

        return f(current_user, *args, **kwargs)
    return decorated

def optional_token(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        current_user = None
        if auth_header and len(auth_header.split()) == 2:
            try:
                token = auth_header.split()[1]
                payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
                current_user = User.query.filter_by(username=payload['username']).first()
            except Exception:
                current_user = None
        return f(current_user, *args, **kwargs)
    return decorated

@auth_bp.route('/register', methods=['POST'])
@auth_bp.route('/signup', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()
    firstname = data.get('firstname', '').strip()
    lastname = data.get('lastname', '').strip()

    if not username or not email or not password:
        return jsonify({'error': 'Username, email, and password are required'}), 400

    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username is already taken'}), 409

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email is already registered'}), 409

    user = User(
        username=username,
        email=email,
        firstname=firstname,
        lastname=lastname
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = jwt.encode({
        'username': user.username,
        'user_id': user.id,
        'exp': datetime.utcnow() + current_app.config.get('JWT_EXPIRATION_DELTA', timedelta(days=7))
    }, current_app.config['SECRET_KEY'], algorithm='HS256')

    return jsonify({
        'message': 'Account created successfully',
        'token': token,
        'user': user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    user = User.query.filter((User.username == username) | (User.email == username.lower())).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid username or password'}), 401

    token = jwt.encode({
        'username': user.username,
        'user_id': user.id,
        'exp': datetime.utcnow() + current_app.config.get('JWT_EXPIRATION_DELTA', timedelta(days=7))
    }, current_app.config['SECRET_KEY'], algorithm='HS256')

    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    return jsonify({'user': current_user.to_dict()}), 200

@auth_bp.route('/score', methods=['GET'])
@token_required
def get_score(current_user):
    return jsonify({
        'score': current_user.score,
        'stats': current_user.to_dict()['stats']
    }), 200
