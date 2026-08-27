"""Multi-Grid Wordle Engine (Dordle & Quordle)

Supports simultaneous multi-board gameplay:
- Dordle: 2 parallel secret words, 7 attempts
- Quordle: 4 parallel secret words, 9 attempts
"""

import random
from typing import List, Dict, Any, Optional
from services.wordle_engine import WordleEngine

class MultiGridSession:
    def __init__(self, mode: str, target_words: List[str], max_attempts: Optional[int] = None, custom_words: Optional[List[str]] = None):
        self.mode = mode # 'dordle' or 'quordle'
        self.num_boards = 2 if mode == 'dordle' else 4
        self.max_attempts = max_attempts or (7 if mode == 'dordle' else 9)
        self.target_words = target_words
        self.engine = WordleEngine(target_words)
        
        # Pick secret words for each board
        if custom_words and len(custom_words) == self.num_boards:
            self.secret_words = [w.strip().upper() for w in custom_words]
        else:
            self.secret_words = [random.choice(target_words).upper() for _ in range(self.num_boards)]
            
        self.boards = [{
            'id': i,
            'secretWord': self.secret_words[i],
            'guesses': [],
            'results': [],
            'status': 'in_progress', # 'in_progress', 'won', 'lost'
            'wonAtGuess': None
        } for i in range(self.num_boards)]

        self.current_attempt = 0
        self.game_finished = False
        self.game_won = False

    def submit_guess(self, guess: str) -> Dict[str, Any]:
        if self.game_finished:
            return {'error': 'Multi-grid game is already finished', 'code': 400}

        clean_guess = guess.strip().upper()
        if len(clean_guess) != 5:
            return {'error': 'Guess must be exactly 5 letters', 'code': 400}

        if not self.engine.is_valid_word(clean_guess):
            return {'error': f"'{clean_guess}' is not in dictionary", 'code': 400}

        self.current_attempt += 1
        all_boards_won = True

        for board in self.boards:
            if board['status'] == 'won':
                # Already won, keep state locked
                continue

            result = self.engine.evaluate_guess(clean_guess, board['secretWord'])
            board['guesses'].append(clean_guess)
            board['results'].append(result)

            if all(r == 'correct' for r in result):
                board['status'] = 'won'
                board['wonAtGuess'] = self.current_attempt
            else:
                all_boards_won = False

        # Check overall game condition
        if all(b['status'] == 'won' for b in self.boards):
            self.game_finished = True
            self.game_won = True
        elif self.current_attempt >= self.max_attempts:
            self.game_finished = True
            self.game_won = False
            for board in self.boards:
                if board['status'] == 'in_progress':
                    board['status'] = 'lost'

        return self.to_dict()

    def to_dict(self) -> Dict[str, Any]:
        return {
            'mode': self.mode,
            'numBoards': self.num_boards,
            'currentAttempt': self.current_attempt,
            'maxAttempts': self.max_attempts,
            'gameFinished': self.game_finished,
            'gameWon': self.game_won,
            'boards': [{
                'id': b['id'],
                'guesses': b['guesses'],
                'results': b['results'],
                'status': b['status'],
                'wonAtGuess': b['wonAtGuess'],
                'secretWord': b['secretWord'] if self.game_finished else None
            } for b in self.boards]
        }
