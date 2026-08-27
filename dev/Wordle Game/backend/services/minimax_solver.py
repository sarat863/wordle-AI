"""Minimax Algorithm for Wordle

Implements the Minimax decision strategy:
For any candidate guess g, calculate the worst-case remaining candidate pool size:
WorstCase(g) = max_{p} |W_{g, p}|
The Minimax guess is the one that minimizes this worst case:
g* = argmin_{g} max_{p} |W_{g, p}|
"""

from collections import defaultdict
from typing import List, Dict, Any, Optional
from services.wordle_engine import WordleEngine

class MinimaxSolver:
    def __init__(self, target_words: List[str], valid_words: Optional[List[str]] = None):
        self.target_words = [w.strip().upper() for w in target_words if w.strip()]
        self.valid_words = [w.strip().upper() for w in (valid_words or target_words) if w.strip()]
        self.engine = WordleEngine(self.target_words, self.valid_words)

    def calculate_worst_case(self, guess: str, possible_words: List[str]) -> int:
        """Calculate the maximum number of words remaining in any single pattern bucket."""
        if not possible_words:
            return 0
        
        pattern_buckets = defaultdict(int)
        for secret in possible_words:
            pat = tuple(self.engine.evaluate_guess(guess, secret))
            pattern_buckets[pat] += 1
            
        return max(pattern_buckets.values()) if pattern_buckets else 0

    def get_minimax_recommendations(self, possible_words: List[str], max_results: int = 5) -> List[Dict[str, Any]]:
        """Find guesses that minimize the maximum remaining candidate pool (worst-case)."""
        if not possible_words:
            return []

        total_possible = len(possible_words)
        if total_possible <= 2:
            return [{
                'word': w,
                'worstCaseRemaining': 1,
                'isPossibleAnswer': True,
                'algorithm': 'minimax'
            } for w in possible_words]

        # Evaluate candidate pool
        sample_pool = possible_words
        if total_possible > 150:
            sample_pool = possible_words[:100]

        scored = []
        candidate_set = set(possible_words)
        for word in sample_pool:
            worst = self.calculate_worst_case(word, possible_words)
            is_possible = word in candidate_set
            
            scored.append({
                'word': word,
                'worstCaseRemaining': worst,
                'eliminatedAtLeast': total_possible - worst,
                'isPossibleAnswer': is_possible,
                'algorithm': 'minimax'
            })

        # Sort by lowest worst-case remaining, then by candidate status
        scored.sort(key=lambda x: (x['worstCaseRemaining'], not x['isPossibleAnswer']))
        return scored[:max_results]
