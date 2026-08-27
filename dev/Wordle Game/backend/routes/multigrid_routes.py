"""Multi-Grid (Dordle & Quordle) Game Routes"""

from flask import Blueprint, request, jsonify, current_app
from services.multi_grid_engine import MultiGridSession

multigrid_bp = Blueprint('multigrid', __name__)

# In-memory storage for active multigrid sessions
active_multigrid_sessions = {}

@multigrid_bp.route('/api/multigrid/new', methods=['POST'])
def new_multigrid_game():
    data = request.get_json() or {}
    mode = data.get('mode', 'dordle').lower() # 'dordle' or 'quordle'
    if mode not in ('dordle', 'quordle'):
        return jsonify({'error': 'Mode must be dordle or quordle'}), 400

    game_service = current_app.game_service
    engine = game_service.get_engine(5)
    
    session = MultiGridSession(mode=mode, target_words=engine.target_words)
    session_id = f"mg_{mode}_{len(active_multigrid_sessions) + 1}"
    active_multigrid_sessions[session_id] = session

    res_data = session.to_dict()
    res_data['sessionId'] = session_id
    return jsonify(res_data), 200

@multigrid_bp.route('/api/multigrid/guess', methods=['POST'])
def make_multigrid_guess():
    data = request.get_json() or {}
    session_id = data.get('sessionId')
    guess = data.get('guess', '').strip().upper()

    session = active_multigrid_sessions.get(session_id)
    if not session:
        return jsonify({'error': 'Active multigrid session not found'}), 404

    res = session.submit_guess(guess)
    if 'error' in res:
        return jsonify({'error': res['error']}), res.get('code', 400)

    res['sessionId'] = session_id
    return jsonify(res), 200
