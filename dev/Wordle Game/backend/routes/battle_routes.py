"""AI Bot vs Bot Tournament & Simulation Arena Routes"""

from flask import Blueprint, request, jsonify, current_app
from services.ai_battle_service import AIBattleService

battle_bp = Blueprint('battle', __name__)

@battle_bp.route('/api/battle/simulate', methods=['POST'])
def simulate_battle():
    data = request.get_json() or {}
    secret_word = data.get('secretWord')
    
    game_service = current_app.game_service
    solver = game_service.get_solver(5)
    
    battle_service = AIBattleService(solver)
    tournament_result = battle_service.simulate_tournament(secret_word=secret_word)
    
    return jsonify(tournament_result), 200
