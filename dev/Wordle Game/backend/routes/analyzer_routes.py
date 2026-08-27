"""AI Move-by-Move Game Review and Accuracy Analysis API"""

from flask import Blueprint, request, jsonify, current_app
from services.game_analyzer import GameAnalyzer
from models import GameSession
from extensions import db

analyzer_bp = Blueprint('analyzer', __name__)

@analyzer_bp.route('/api/analyzer/review', methods=['POST'])
def review_game():
    data = request.get_json() or {}
    session_id = data.get('sessionId')
    history = data.get('history', [])
    secret_word = data.get('secretWord', '')

    game_service = current_app.game_service
    solver = game_service.get_solver(5)

    if session_id:
        session = db.session.get(GameSession, session_id)
        if session:
            secret_word = session.secret_word
            history = [{'guess': g.guess_word, 'result': g.result_pattern} for g in session.guesses]
            solver = game_service.get_solver(session.word_length)

    if not secret_word or not history:
        return jsonify({'error': 'Game history and secret word are required for analysis'}), 400

    analyzer = GameAnalyzer(solver)
    review = analyzer.analyze_game(history, secret_word)

    return jsonify(review), 200
