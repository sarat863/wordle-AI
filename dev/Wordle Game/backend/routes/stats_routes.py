"""User Statistics and Global Leaderboard Routes"""

from flask import Blueprint, jsonify, request
from models import User, GameSession
from extensions import db
from routes.auth_routes import token_required

stats_bp = Blueprint('stats', __name__)

@stats_bp.route('/api/stats/user', methods=['GET'])
@token_required
def get_user_stats(current_user):
    recent_sessions = GameSession.query.filter_by(user_id=current_user.id).order_by(GameSession.id.desc()).limit(10).all()
    
    return jsonify({
        'user': current_user.to_dict(),
        'recentGames': [s.to_dict(reveal_secret=True) for s in recent_sessions]
    }), 200

@stats_bp.route('/api/leaderboard/global', methods=['GET'])
def get_global_leaderboard():
    limit = min(int(request.args.get('limit', 20)), 50)
    top_users = User.query.order_by(User.score.desc(), User.games_won.desc()).limit(limit).all()
    
    leaderboard = []
    for rank, user in enumerate(top_users, start=1):
        win_rate = round((user.games_won / user.games_played * 100), 1) if user.games_played > 0 else 0
        leaderboard.append({
            'rank': rank,
            'username': user.username,
            'score': user.score,
            'gamesWon': user.games_won,
            'gamesPlayed': user.games_played,
            'winRate': win_rate,
            'currentStreak': user.current_streak,
            'maxStreak': user.max_streak
        })
        
    return jsonify({'leaderboard': leaderboard}), 200

@stats_bp.route('/api/stats/global-summary', methods=['GET'])
def get_global_summary():
    total_users = User.query.count()
    total_games = GameSession.query.count()
    total_won = GameSession.query.filter_by(status='won').count()
    win_rate = round((total_won / total_games * 100), 1) if total_games > 0 else 0
    
    return jsonify({
        'totalUsers': total_users,
        'totalGamesPlayed': total_games,
        'totalGamesWon': total_won,
        'globalWinRate': win_rate
    }), 200
