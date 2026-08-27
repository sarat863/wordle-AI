"""AI Solver and Intelligent Hint Routes"""

from flask import Blueprint, request, jsonify, current_app
from models import GameSession
from extensions import db

solver_bp = Blueprint('solver', __name__)

def get_game_service():
    return current_app.game_service

@solver_bp.route('/api/solver/recommend', methods=['POST'])
def recommend_guesses():
    game_service = get_game_service()
    data = request.get_json() or {}
    
    word_length = int(data.get('wordLength', 5))
    history = data.get('history', []) # list of {'guess': 'CRANE', 'result': ['absent', 'present', ...]}
    solver = game_service.get_solver(word_length)
    
    if not solver:
        return jsonify({'error': f'Solver for length {word_length} not found'}), 400

    parsed_history = [(item['guess'].upper(), item['result']) for item in history if 'guess' in item and 'result' in item]
    
    remaining_words = solver.filter_by_history(parsed_history)
    recs = solver.get_top_recommendations(remaining_words, max_results=int(data.get('limit', 5)))

    return jsonify({
        'wordLength': word_length,
        'remainingCount': len(remaining_words),
        'remainingSample': remaining_words[:20],
        'recommendations': recs
    }), 200

@solver_bp.route('/api/solver/hints', methods=['POST'])
@solver_bp.route('/hints', methods=['POST'])
def get_hints():
    game_service = get_game_service()
    data = request.get_json() or {}
    
    session_id = data.get('sessionId')
    hint_level = int(data.get('level', 1))
    
    if session_id:
        session = db.session.get(GameSession, session_id)
        if session:
            solver = game_service.get_solver(session.word_length)
            history = [(g.guess_word, g.result_pattern) for g in session.guesses]
            hint = solver.generate_hint(session.secret_word, history, hint_level=hint_level)
            return jsonify(hint), 200

    # Legacy or manual filtering payload compatibility
    correct_letters = data.get('correctLetters', '')
    misplaced_letters = data.get('misplacedLetters', '')
    wrong_letters = data.get('wrongLetters', '')
    
    correct_set = {c.upper() for c in correct_letters if c.isalpha()}
    misplaced_set = {c.upper() for c in misplaced_letters if c.isalpha()}
    wrong_set = {c.upper() for c in wrong_letters if c.isalpha()}
    
    solver = game_service.get_solver(5)
    valid_candidates = []
    
    for word in solver.target_words:
        w_set = set(word)
        if not correct_set.issubset(w_set):
            continue
        if any(c in w_set for c in wrong_set if c not in correct_set):
            continue
        if misplaced_set and not any(c in w_set for c in misplaced_set):
            continue
        valid_candidates.append(word)

    # Return array of words for legacy frontend compatibility or structured object
    if 'correctLetters' in data and not session_id:
        return jsonify(valid_candidates[:50]), 200

    return jsonify({
        'remainingCount': len(valid_candidates),
        'candidates': valid_candidates[:30]
    }), 200

@solver_bp.route('/api/solver/analyze', methods=['POST'])
def analyze_word():
    game_service = get_game_service()
    data = request.get_json() or {}
    guess = data.get('guess', '').strip().upper()
    word_length = len(guess) if len(guess) in (4, 5, 6) else 5
    
    solver = game_service.get_solver(word_length)
    if not solver:
        return jsonify({'error': 'Solver not available'}), 400
        
    entropy = solver.calculate_entropy(guess, solver.target_words)
    return jsonify({
        'guess': guess,
        'entropyBits': entropy,
        'isTargetWord': guess in solver.target_words,
        'isValidWord': solver.engine.is_valid_word(guess)
    }), 200
