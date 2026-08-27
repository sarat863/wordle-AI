"""Achievement, XP, and Player Leveling Service"""

import math
from typing import List, Dict, Any, Optional

ACHIEVEMENTS_REGISTRY = [
  {
    'id': 'FIRST_WIN',
    'title': 'First Victory',
    'description': 'Win your very first Wordle puzzle.',
    'icon': '🏆',
    'xp': 50
  },
  {
    'id': 'STREAK_3',
    'title': 'On Fire',
    'description': 'Maintain a 3-game winning streak.',
    'icon': '🔥',
    'xp': 100
  },
  {
    'id': 'STREAK_7',
    'title': 'Unstoppable Flame',
    'description': 'Reach a 7-day winning streak.',
    'icon': '⚡',
    'xp': 250
  },
  {
    'id': 'SNIPER',
    'title': 'Word Sniper',
    'description': 'Guess the secret word in 1 or 2 attempts.',
    'icon': '🎯',
    'xp': 200
  },
  {
    'id': 'DORDLE_CHAMP',
    'title': 'Dordle Dualist',
    'description': 'Conquer a 2-board simultaneous Dordle puzzle.',
    'icon': '👥',
    'xp': 175
  },
  {
    'id': 'QUORDLE_MASTER',
    'title': 'Quordle Grandmaster',
    'description': 'Solve all 4 boards in a Quordle match.',
    'icon': '👑',
    'xp': 350
  },
  {
    'id': 'PERFECTIONIST',
    'title': 'Lexical Perfectionist',
    'description': 'Achieve over 90% accuracy in the AI Game Review.',
    'icon': '💎',
    'xp': 200
  },
  {
    'id': 'HARD_MODE_HERO',
    'title': 'Hard Mode Veteran',
    'description': 'Win a game with strict Hard Mode enabled.',
    'icon': '🛡️',
    'xp': 150
  }
]

class AchievementService:
    @staticmethod
    def calculate_level(xp: int) -> Dict[str, Any]:
        """Calculate player level, title, and progress toward next level based on XP."""
        level = int(math.floor(math.sqrt(max(0, xp) / 50.0))) + 1
        current_level_base_xp = (level - 1) ** 2 * 50
        next_level_xp = level ** 2 * 50
        xp_in_level = max(0, xp - current_level_base_xp)
        xp_needed = max(1, next_level_xp - current_level_base_xp)
        progress_pct = round(min(100.0, (xp_in_level / xp_needed) * 100), 1)

        titles = {
            1: 'Novice Puzzler',
            2: 'Apprentice Solver',
            3: 'Word Crafter',
            4: 'Vocabulary Knight',
            5: 'Lexicon Master',
            6: 'Entropy Grandmaster',
            7: 'Legendary Word Master'
        }
        title = titles.get(min(level, 7), 'Legendary Word Master')

        return {
            'level': level,
            'title': title,
            'currentXP': xp,
            'currentLevelBaseXP': current_level_base_xp,
            'nextLevelXP': next_level_xp,
            'progressPct': progress_pct
        }

    @staticmethod
    def evaluate_achievements(stats: Dict[str, Any], last_game: Optional[Dict[str, Any]] = None, current_unlocked: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        unlocked = set(current_unlocked or [])
        newly_awarded = []

        won = last_game.get('won', False) if last_game else False
        num_guesses = last_game.get('guessesCount', 6) if last_game else 6
        mode = last_game.get('mode', 'practice') if last_game else 'practice'
        hard_mode = last_game.get('hardMode', False) if last_game else False

        # Check conditions
        if (stats.get('gamesWon', 0) >= 1 or won) and 'FIRST_WIN' not in unlocked:
            newly_awarded.append('FIRST_WIN')

        if stats.get('currentStreak', 0) >= 3 and 'STREAK_3' not in unlocked:
            newly_awarded.append('STREAK_3')

        if stats.get('currentStreak', 0) >= 7 and 'STREAK_7' not in unlocked:
            newly_awarded.append('STREAK_7')

        if won and num_guesses in (1, 2) and 'SNIPER' not in unlocked:
            newly_awarded.append('SNIPER')

        if won and mode == 'dordle' and 'DORDLE_CHAMP' not in unlocked:
            newly_awarded.append('DORDLE_CHAMP')

        if won and mode == 'quordle' and 'QUORDLE_MASTER' not in unlocked:
            newly_awarded.append('QUORDLE_MASTER')

        if won and hard_mode and 'HARD_MODE_HERO' not in unlocked:
            newly_awarded.append('HARD_MODE_HERO')

        return [a for a in ACHIEVEMENTS_REGISTRY if a['id'] in newly_awarded]

    @staticmethod
    def get_all_achievements(unlocked_ids: List[str]) -> List[Dict[str, Any]]:
        unlocked_set = set(unlocked_ids)
        return [{
            **a,
            'isUnlocked': a['id'] in unlocked_set
        } for a in ACHIEVEMENTS_REGISTRY]
