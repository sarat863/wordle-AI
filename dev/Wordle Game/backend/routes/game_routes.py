"""Wordle Game Flow and Gameplay Routes"""

from flask import Blueprint, request, jsonify, current_app
from extensions import db
from models import GameSession, User
from routes.auth_routes import optional_token, token_required

game_bp = Blueprint('game', __name__)

def get_game_service():
    return current_app.game_service

@game_bp.route('/api/game/new', methods=['POST', 'GET'])
@game_bp.route('/initialize', methods=['GET'])
@optional_token
def new_game(current_user):
    game_service = get_game_service()
    
    # Extract query params or JSON body
    if request.method == 'POST':
        data = request.get_json() or {}
    else:
        data = request.args.to_dict()

    mode = data.get('mode', 'practice')
    word_length = int(data.get('wordLength', data.get('word_length', 5)))
    hard_mode = str(data.get('hardMode', 'false')).lower() in ('true', '1')
    custom_token = data.get('customToken')
    
    custom_word = None
    if mode == 'custom' and custom_token:
        custom_word = game_service.decode_custom_word(custom_token)
        if custom_word:
            word_length = len(custom_word)

    try:
        session = game_service.create_session(
            user_id=current_user.id if current_user else None,
            mode=mode,
            word_length=word_length,
            hard_mode=hard_mode,
            custom_word=custom_word
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 400

    return jsonify({
        'message': 'Game session initialized',
        'sessionId': session.id,
        'wordLength': session.word_length,
        'maxAttempts': session.max_attempts,
        'mode': session.mode,
        'hardMode': session.hard_mode,
        'status': session.status,
        'guesses': [],
        # For legacy compatibility
        'word': session.secret_word if current_app.config.get('DEBUG') else None,
        'score': current_user.score if current_user else 0
    }), 200

@game_bp.route('/api/game/guess', methods=['POST'])
@game_bp.route('/guess', methods=['POST'])
@optional_token
def make_guess(current_user):
    game_service = get_game_service()
    data = request.get_json() or {}

    session_id = data.get('sessionId')
    guess = data.get('guess', '').strip().upper()

    # If session_id not explicitly provided, find latest active session for user
    if not session_id and current_user:
        session = GameSession.query.filter_by(user_id=current_user.id, status='in_progress').order_by(GameSession.id.desc()).first()
    elif session_id:
        session = db.session.get(GameSession, session_id)
    else:
        # Fallback for anonymous users: create a transient session
        session = GameSession.query.filter_by(user_id=None, status='in_progress').order_by(GameSession.id.desc()).first()

    if not session:
        # If still no session, automatically create one
        session = game_service.create_session(
            user_id=current_user.id if current_user else None,
            mode='practice',
            word_length=len(guess) if len(guess) in (4, 5, 6) else 5
        )

    response = game_service.submit_guess(session, guess)
    if 'error' in response:
        return jsonify({'error': response['error']}), response.get('code', 400)

    return jsonify(response), 200

@game_bp.route('/api/game/give-up', methods=['POST'])
@optional_token
def give_up(current_user):
    data = request.get_json() or {}
    session_id = data.get('sessionId')
    
    if session_id:
        session = GameSession.query.get(session_id)
    elif current_user:
        session = GameSession.query.filter_by(user_id=current_user.id, status='in_progress').order_by(GameSession.id.desc()).first()
    else:
        return jsonify({'error': 'Session ID is required'}), 400

    if not session:
        return jsonify({'error': 'Active session not found'}), 404

    session.status = 'lost'
    if session.user:
        session.user.record_game_outcome(won=False, num_guesses=len(session.guesses), score_delta=-10)
    db.session.commit()

    return jsonify({
        'message': 'Game surrendered',
        'secretWord': session.secret_word,
        'status': 'lost',
        'totalScore': session.user.score if session.user else 0
    }), 200

@game_bp.route('/api/game/custom/create', methods=['POST'])
def create_custom_challenge():
    game_service = get_game_service()
    data = request.get_json() or {}
    word = data.get('word', '').strip().upper()
    
    if not word.isalpha() or len(word) not in (4, 5, 6):
        return jsonify({'error': 'Custom word must be 4, 5, or 6 letters'}), 400
        
    engine = game_service.get_engine(len(word))
    if not engine.is_valid_word(word):
        return jsonify({'error': f"'{word}' is not in the dictionary"}), 400

    token = game_service.encode_custom_word(word)
    return jsonify({
        'token': token,
        'wordLength': len(word),
        'message': 'Challenge created successfully'
    }), 200
