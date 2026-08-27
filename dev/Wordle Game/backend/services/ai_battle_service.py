"""AI Bot vs Bot Tournament & Benchmark Simulator

Runs head-to-head simulations of competing Wordle AI algorithms
on the same secret word, collecting step-by-step moves and telemetry.
"""

import time
import random
from typing import List, Dict, Any, Optional
from services.ai_solver import WordleSolver
from services.minimax_solver import MinimaxSolver
from services.wordle_engine import WordleEngine

class AIBattleService:
    def __init__(self, solver: WordleSolver):
        self.solver = solver
        self.minimax_solver = MinimaxSolver(solver.target_words, solver.valid_words)
        self.engine = solver.engine

    def simulate_tournament(self, secret_word: Optional[str] = None, max_attempts: int = 6) -> Dict[str, Any]:
        secret = (secret_word or random.choice(self.solver.target_words)).strip().upper()
        
        bots = [
            {'id': 'shannon_entropy', 'name': 'Shannon Entropy Bot 🧠', 'color': '#22c55e'},
            {'id': 'minimax', 'name': 'Minimax Bot 🛡️', 'color': '#0284c7'},
            {'id': 'heuristic', 'name': 'Letter Frequency Bot ⚡', 'color': '#eab308'},
            {'id': 'random', 'name': 'Random Baseline Bot 🎲', 'color': '#a855f7'}
        ]

        results = []
        for bot in bots:
            start_t = time.time()
            bot_run = self._run_bot(bot['id'], secret, max_attempts)
            elapsed_ms = round((time.time() - start_t) * 1000, 2)
            
            results.append({
                'botId': bot['id'],
                'botName': bot['name'],
                'color': bot['color'],
                'won': bot_run['won'],
                'turns': bot_run['turns'],
                'moves': bot_run['moves'],
                'timeMs': elapsed_ms
            })

        # Rank bots by: won (True first), then turns (ascending), then time (ascending)
        results.sort(key=lambda b: (not b['won'], b['turns'], b['timeMs']))
        for rank, b in enumerate(results, start=1):
            b['rank'] = rank

        return {
            'secretWord': secret,
            'maxAttempts': max_attempts,
            'botsCount': len(bots),
            'winner': results[0]['botName'] if results and results[0]['won'] else 'No Winner',
            'standings': results
        }

    def _run_bot(self, bot_type: str, secret: str, max_attempts: int) -> Dict[str, Any]:
        candidates = list(self.solver.target_words)
        moves = []
        won = False

        # Predefined optimal first guesses
        first_guesses = {
            'shannon_entropy': 'CRANE',
            'minimax': 'RAISE',
            'heuristic': 'SLATE',
            'random': None
        }

        for attempt in range(1, max_attempts + 1):
            if attempt == 1 and first_guesses.get(bot_type):
                guess = first_guesses[bot_type]
            else:
                if bot_type == 'shannon_entropy':
                    recs = self.solver.get_top_recommendations(candidates, max_results=1)
                    guess = recs[0]['word'] if recs else random.choice(candidates)
                elif bot_type == 'minimax':
                    recs = self.minimax_solver.get_minimax_recommendations(candidates, max_results=1)
                    guess = recs[0]['word'] if recs else random.choice(candidates)
                elif bot_type == 'heuristic':
                    freq_table = self.solver._compute_positional_frequencies(candidates)
                    scored = sorted(candidates, key=lambda w: self.solver._score_word_heuristic(w, freq_table), reverse=True)
                    guess = scored[0] if scored else random.choice(candidates)
                else: # random
                    guess = random.choice(candidates)

            result = self.engine.evaluate_guess(guess, secret)
            moves.append({
                'turn': attempt,
                'guess': guess,
                'result': result,
                'remainingBefore': len(candidates)
            })

            if guess == secret:
                won = True
                break

            candidates = self.solver.filter_candidates(candidates, guess, result)
            if not candidates:
                break

        return {
            'won': won,
            'turns': len(moves),
            'moves': moves
        }
