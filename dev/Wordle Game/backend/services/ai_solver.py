"""Advanced Wordle AI Solver Engine

Implements Information Theory (Shannon Entropy / Expected Information Gain),
Positional Letter Frequency Heuristics, Pattern Pruning, and Interactive Hint Generation.
"""

import math
from collections import Counter, defaultdict
from typing import List, Tuple, Dict, Any, Optional
from services.wordle_engine import WordleEngine

class WordleSolver:
    def __init__(self, target_words: List[str], valid_words: Optional[List[str]] = None):
        self.target_words = [w.strip().upper() for w in target_words if w.strip()]
        self.valid_words = [w.strip().upper() for w in (valid_words or target_words) if w.strip()]
        self.engine = WordleEngine(self.target_words, self.valid_words)
        
        # Precompute initial letter frequency table
        self._initial_freq = self._compute_positional_frequencies(self.target_words)

    @classmethod
    def from_files(cls, target_path: str, valid_path: Optional[str] = None):
        with open(target_path, 'r', encoding='utf-8', errors='ignore') as f:
            targets = [l.strip().upper() for l in f if l.strip()]
        valids = None
        if valid_path:
            with open(valid_path, 'r', encoding='utf-8', errors='ignore') as f:
                valids = [l.strip().upper() for l in f if l.strip()]
        return cls(targets, valids)

    def filter_candidates(self, candidates: List[str], guess: str, pattern: List[str]) -> List[str]:
        """Filter a list of candidate words to those that produce the exact same pattern against guess."""
        guess = guess.strip().upper()
        matching = []
        for word in candidates:
            if self.engine.evaluate_guess(guess, word) == pattern:
                matching.append(word)
        return matching

    def filter_by_history(self, history: List[Tuple[str, List[str]]], candidates: Optional[List[str]] = None) -> List[str]:
        """Filter the target list by all past (guess, pattern) turns."""
        pool = candidates if candidates is not None else list(self.target_words)
        for guess, pattern in history:
            pool = self.filter_candidates(pool, guess, pattern)
        return pool

    def calculate_entropy(self, guess: str, possible_words: List[str]) -> float:
        """Calculate Shannon Entropy (expected information in bits) for a given guess against possible words.
        
        Formula: E[I] = sum_{p} P(p) * log2(1 / P(p))
        """
        if not possible_words:
            return 0.0
        
        total = len(possible_words)
        pattern_counts = defaultdict(int)
        
        for secret in possible_words:
            pat = tuple(self.engine.evaluate_guess(guess, secret))
            pattern_counts[pat] += 1
            
        entropy = 0.0
        for count in pattern_counts.values():
            p = count / total
            if p > 0:
                entropy -= p * math.log2(p)
                
        return round(entropy, 3)

    def get_top_recommendations(self, possible_words: List[str], max_results: int = 5) -> List[Dict[str, Any]]:
        """Rank candidate words using Information Gain (Entropy) & Positional Heuristics.
        
        Returns top ranked guesses with score, entropy bits, and probability of direct victory.
        """
        if not possible_words:
            return []
        
        total_possible = len(possible_words)
        
        # If very few candidates remain, recommend directly from the candidates
        if total_possible <= 2:
            return [{
                'word': w,
                'entropy': 1.0 if total_possible == 2 else 0.0,
                'winProbability': round(1.0 / total_possible, 3),
                'score': 100.0,
                'isPossibleAnswer': True
            } for w in possible_words]

        # Select evaluation pool (if pool is large, evaluate candidates + top frequency words)
        candidate_set = set(possible_words)
        sample_pool = possible_words
        if total_possible > 250:
            # Rank candidates by heuristic score first to speed up entropy calculation
            freq_table = self._compute_positional_frequencies(possible_words)
            sample_pool = sorted(possible_words, key=lambda w: self._score_word_heuristic(w, freq_table), reverse=True)[:100]
            
        scored = []
        for word in sample_pool:
            ent = self.calculate_entropy(word, possible_words)
            is_possible = word in candidate_set
            win_prob = (1.0 / total_possible) if is_possible else 0.0
            
            # Combined score: information gain + bonus for being a possible solution
            combined_score = ent + (0.5 if is_possible else 0.0)
            
            scored.append({
                'word': word,
                'entropy': ent,
                'winProbability': round(win_prob, 3),
                'score': round(combined_score, 2),
                'isPossibleAnswer': is_possible
            })

        scored.sort(key=lambda x: (x['score'], x['entropy']), reverse=True)
        return scored[:max_results]

    def generate_hint(self, secret_word: str, history: List[Tuple[str, List[str]]], hint_level: int = 1) -> Dict[str, Any]:
        """Generate intelligent, graded gameplay hints without spoiling the answer directly.
        
        Level 1: Structural insight (vowel count, consonant distribution, unique letter count).
        Level 2: Character presence and positional hints.
        Level 3: Top AI recommendations (entropy-ranked guesses).
        """
        secret = secret_word.strip().upper()
        remaining_candidates = self.filter_by_history(history)
        
        if hint_level == 1:
            vowels = [c for c in secret if c in 'AEIOU']
            unique_count = len(set(secret))
            return {
                'level': 1,
                'type': 'structural',
                'vowelCount': len(vowels),
                'uniqueLetters': unique_count,
                'hasDuplicateLetters': unique_count < len(secret),
                'message': f"The word contains {len(vowels)} vowel(s) and {unique_count} unique letter(s)."
            }
        elif hint_level == 2:
            # Pick a letter that user hasn't correctly placed yet
            known_greens = set()
            for _, pat in history:
                for idx, status in enumerate(pat):
                    if status == 'correct':
                        known_greens.add(idx)
                        
            unrevealed_positions = [i for i in range(len(secret)) if i not in known_greens]
            if unrevealed_positions:
                target_pos = unrevealed_positions[0]
                char = secret[target_pos]
                return {
                    'level': 2,
                    'type': 'letter_presence',
                    'revealedPosition': target_pos + 1,
                    'letter': char,
                    'message': f"Letter at position {target_pos + 1} is '{char}'."
                }
            else:
                return {
                    'level': 2,
                    'type': 'general',
                    'message': f"The word starts with '{secret[0]}' and ends with '{secret[-1]}'."
                }
        else:
            recs = self.get_top_recommendations(remaining_candidates, max_results=3)
            return {
                'level': 3,
                'type': 'ai_recommendations',
                'remainingCount': len(remaining_candidates),
                'topRecommendations': recs,
                'message': f"There are {len(remaining_candidates)} possible words remaining. The AI recommends: {', '.join([r['word'] for r in recs])}."
            }

    def _compute_positional_frequencies(self, words: List[str]) -> Dict[int, Counter]:
        freq = defaultdict(Counter)
        for w in words:
            for idx, ch in enumerate(w):
                freq[idx][ch] += 1
        return freq

    def _score_word_heuristic(self, word: str, freq_table: Dict[int, Counter]) -> float:
        unique_chars = set(word)
        score = 0.0
        for idx, ch in enumerate(word):
            score += freq_table[idx].get(ch, 0)
        # Bonus for unique letters
        score *= (len(unique_chars) / len(word))
        return score
