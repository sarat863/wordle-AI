"""Player XP, Leveling, and Achievement Routes"""

from flask import Blueprint, request, jsonify, current_app
from services.achievement_service import AchievementService, ACHIEVEMENTS_REGISTRY
from routes.auth_routes import optional_token, token_required

achievement_bp = Blueprint('achievements', __name__)

@achievement_bp.route('/api/achievements/list', methods=['GET'])
def list_achievements():
    return jsonify({'achievements': ACHIEVEMENTS_REGISTRY}), 200

@achievement_bp.route('/api/achievements/user', methods=['GET'])
@optional_token
def get_user_achievements(current_user):
    if not current_user:
        # Fallback guest calculation
        level_info = AchievementService.calculate_level(150)
        achievements = AchievementService.get_all_achievements(['FIRST_WIN'])
        return jsonify({
            'level': level_info,
            'achievements': achievements
        }), 200

    # User score mapped to XP (1 score = 2 XP)
    xp = current_user.score * 2
    level_info = AchievementService.calculate_level(xp)
    
    # Calculate earned achievements
    unlocked = ['FIRST_WIN'] if current_user.games_won >= 1 else []
    if current_user.current_streak >= 3:
        unlocked.append('STREAK_3')
    if current_user.current_streak >= 7:
        unlocked.append('STREAK_7')
    if current_user.guess_1 > 0 or current_user.guess_2 > 0:
        unlocked.append('SNIPER')

    achievements = AchievementService.get_all_achievements(unlocked)

    return jsonify({
        'level': level_info,
        'achievements': achievements,
        'unlockedCount': len(unlocked),
        'totalCount': len(ACHIEVEMENTS_REGISTRY)
    }), 200
