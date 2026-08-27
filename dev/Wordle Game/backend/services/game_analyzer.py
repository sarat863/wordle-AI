"""AI Game Review & Accuracy Analyzer (Chess.com Style)

Performs comprehensive turn-by-turn post-game evaluation:
- Classifies each guess: Brilliant (💎), Great (🟢), Good (🔵), Inaccuracy (🟡), Mistake (🟠), Blunder (🔴)
- Measures search space reduction (e.g., 2,315 -> 46 -> 3 -> 1)
- Evaluates relative Shannon entropy efficiency
- Calculates overall Vocabulary Accuracy %
"""

from typing import List, Dict, Any, Tuple, Optional
from services.ai_solver import WordleSolver
from services.wordle_engine import WordleEngine

class GameAnalyzer:
    def __init__(self, solver: WordleSolver):
        self.solver = solver
        self.engine = solver.engine

    def analyze_game(self, history: List[Dict[str, Any]], secret_word: str) -> Dict[str, Any]:
        secret = secret_word.strip().upper()
        candidates = list(self.solver.target_words)
        total_initial = len(candidates)

        analyzed_moves = []
        efficiency_sum = 0.0
        candidate_curve = [total_initial]

        for turn_idx, turn in enumerate(history, start=1):
            guess = turn.get('guess', '').strip().upper()
            result = turn.get('result', [])
            
            candidates_before = len(candidates)
            
            # Compute top recommendation for this state
            recs = self.solver.get_top_recommendations(candidates, max_results=3)
            best_rec = recs[0] if recs else None
            max_entropy = best_rec['entropy'] if best_rec else 1.0
            
            # Compute entropy of the user's guess
            user_entropy = self.solver.calculate_entropy(guess, candidates)
            
            # Filter candidates for next turn
            candidates = self.solver.filter_candidates(candidates, guess, result)
            candidates_after = len(candidates)
            candidate_curve.append(candidates_after)

            eliminated_count = candidates_before - candidates_after
            eliminated_pct = (eliminated_count / candidates_before * 100) if candidates_before > 0 else 100.0

            # Calculate relative efficiency
            rel_eff = (user_entropy / max_entropy) if max_entropy > 0 else 1.0
            rel_eff = min(max(rel_eff, 0.0), 1.0)
            efficiency_sum += rel_eff

            # Move quality classification
            is_winning_guess = (guess == secret)
            quality, badge, comment = self._classify_move(
                guess=guess,
                secret=secret,
                is_winning=is_winning_guess,
                rel_efficiency=rel_eff,
                eliminated_pct=eliminated_pct,
                candidates_before=candidates_before,
                candidates_after=candidates_after,
                best_rec_word=best_rec['word'] if best_rec else None
            )

            analyzed_moves.append({
                'turn': turn_idx,
                'guess': guess,
                'result': result,
                'quality': quality,
                'badge': badge,
                'comment': comment,
                'entropyBits': user_entropy,
                'optimalEntropyBits': max_entropy,
                'efficiencyPct': round(rel_eff * 100, 1),
                'candidatesBefore': candidates_before,
                'candidatesAfter': candidates_after,
                'eliminatedCount': eliminated_count,
                'eliminatedPct': round(eliminated_pct, 1),
                'bestMove': best_rec['word'] if best_rec else guess
            })

        turns_count = max(len(history), 1)
        avg_efficiency = (efficiency_sum / turns_count) * 100
        
        # Calculate overall accuracy
        accuracy_score = round(min(100.0, avg_efficiency * 0.85 + (15.0 if history and history[-1].get('guess') == secret else 0.0)), 1)

        # Performance summary title
        if accuracy_score >= 95:
            performance_tier = 'Grandmaster Accuracy'
        elif accuracy_score >= 85:
            performance_tier = 'Masterful Play'
        elif accuracy_score >= 70:
            performance_tier = 'Solid Vocabulary Strategy'
        else:
            performance_tier = 'Exploratory Play'

        return {
            'accuracyScore': accuracy_score,
            'performanceTier': performance_tier,
            'secretWord': secret,
            'turnsCount': len(history),
            'candidateCurve': candidate_curve,
            'moves': analyzed_moves,
            'summary': {
                'brilliantMoves': sum(1 for m in analyzed_moves if m['quality'] == 'Brilliant'),
                'greatMoves': sum(1 for m in analyzed_moves if m['quality'] == 'Great'),
                'goodMoves': sum(1 for m in analyzed_moves if m['quality'] == 'Good'),
                'inaccuracies': sum(1 for m in analyzed_moves if m['quality'] == 'Inaccuracy'),
                'mistakes': sum(1 for m in analyzed_moves if m['quality'] == 'Mistake'),
                'blunders': sum(1 for m in analyzed_moves if m['quality'] == 'Blunder')
            }
        }

    def _classify_move(self, guess: str, secret: str, is_winning: bool, rel_efficiency: float,
                       eliminated_pct: float, candidates_before: int, candidates_after: int,
                       best_rec_word: Optional[str]) -> Tuple[str, str, str]:
        if is_winning:
            if candidates_before <= 2:
                return 'Great', '🟢', f"Identified the winning solution '{guess}' directly!"
            return 'Brilliant', '💎', f"Solved the puzzle with '{guess}'!"

        if guess == best_rec_word or rel_efficiency >= 0.95:
            return 'Brilliant', '💎', f"Optimal entropy play! Cut candidate space from {candidates_before} to {candidates_after}."

        if rel_efficiency >= 0.85 or eliminated_pct >= 85:
            return 'Great', '🟢', f"Strong guess! Eliminated {eliminated_pct:.0f}% of possibilities."

        if rel_efficiency >= 0.65 or eliminated_pct >= 60:
            return 'Good', '🔵', f"Solid move narrowing down candidate words."

        if rel_efficiency >= 0.40:
            return 'Inaccuracy', '🟡', f"Suboptimal information yield. Best was '{best_rec_word}'."

        if eliminated_pct < 20 and candidates_before > 10:
            return 'Blunder', '🔴', f"Low information gain. '{best_rec_word}' was far more informative."

        return 'Mistake', '🟠', f"Missed key letter constraints. '{best_rec_word}' recommended."
