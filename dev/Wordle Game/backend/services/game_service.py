"""Wordle Game Lifecycle and Session Management Service"""

import os
import random
import base64
from datetime import datetime, date
from typing import Optional, Dict, Any, Tuple
from extensions import db
from models import User, GameSession, GuessHistory, DailyChallenge
from services.wordle_engine import WordleEngine
from services.ai_solver import WordleSolver

class GameService:
    def __init__(self, data_dir: str):
        self.data_dir = data_dir
        self.engines = {}
        self.solvers = {}
        self._load_dictionaries()

    def _load_dictionaries(self):
        # 5-letter (standard)
        target_5 = os.path.join(self.data_dir, 'words_5_target.txt')
        valid_5 = os.path.join(self.data_dir, 'words_5_valid.txt')
        if os.path.exists(target_5):
            self.engines[5] = WordleEngine.from_files(target_5, valid_5 if os.path.exists(valid_5) else None)
            self.solvers[5] = WordleSolver.from_files(target_5, valid_5 if os.path.exists(valid_5) else None)

        # 4-letter
        path_4 = os.path.join(self.data_dir, 'words_4.txt')
        if os.path.exists(path_4):
            self.engines[4] = WordleEngine.from_files(path_4)
            self.solvers[4] = WordleSolver.from_files(path_4)

        # 6-letter
        path_6 = os.path.join(self.data_dir, 'words_6.txt')
        if os.path.exists(path_6):
            self.engines[6] = WordleEngine.from_files(path_6)
            self.solvers[6] = WordleSolver.from_files(path_6)

    def get_engine(self, length: int = 5) -> WordleEngine:
        return self.engines.get(length, self.engines.get(5))

    def get_solver(self, length: int = 5) -> WordleSolver:
        return self.solvers.get(length, self.solvers.get(5))

    def get_daily_word(self, date_str: Optional[str] = None, length: int = 5) -> str:
        if not date_str:
            date_str = date.today().isoformat()
            
        challenge = DailyChallenge.query.filter_by(date_str=date_str, word_length=length).first()
        if challenge:
            return challenge.secret_word

        # Deterministic seed from date string
        seed_val = sum(ord(c) * (i + 1) for i, c in enumerate(date_str))
        rng = random.Random(seed_val + length * 1000)
        engine = self.get_engine(length)
        chosen_word = rng.choice(engine.target_words)

        challenge = DailyChallenge(date_str=date_str, word_length=length, secret_word=chosen_word)
        db.session.add(challenge)
        db.session.commit()
        return chosen_word

    def create_session(self, user_id: Optional[int], mode: str = 'practice', word_length: int = 5,
                       hard_mode: bool = False, custom_word: Optional[str] = None) -> GameSession:
        engine = self.get_engine(word_length)
        if not engine:
            raise ValueError(f"Word length {word_length} is not supported.")

        if mode == 'daily':
            secret = self.get_daily_word(length=word_length)
        elif mode == 'custom' and custom_word:
            clean_word = custom_word.strip().upper()
            if not engine.is_valid_word(clean_word) and len(clean_word) != word_length:
                raise ValueError("Custom word is not valid.")
            secret = clean_word
        else:
            secret = random.choice(engine.target_words)

        session = GameSession(
            user_id=user_id,
            mode=mode,
            word_length=word_length,
            secret_word=secret,
            max_attempts=6,
            status='in_progress',
            hard_mode=hard_mode
        )
        db.session.add(session)
        db.session.commit()
        return session

    def submit_guess(self, session: GameSession, guess: str) -> Dict[str, Any]:
        if session.status != 'in_progress':
            return {'error': f'Game session is already {session.status}', 'code': 400}

        guess = guess.strip().upper()
        if len(guess) != session.word_length:
            return {'error': f'Guess must be exactly {session.word_length} letters', 'code': 400}

        engine = self.get_engine(session.word_length)
        if not engine.is_valid_word(guess):
            return {'error': 'Word not in valid dictionary', 'code': 400}

        # Hard mode check
        past_guesses = [(g.guess_word, g.result_pattern) for g in session.guesses]
        if session.hard_mode and past_guesses:
            valid_hard, err = engine.validate_hard_mode(guess, past_guesses)
            if not valid_hard:
                return {'error': f'Hard Mode rule violated: {err}', 'code': 400}

        # Evaluate guess
        result_pattern = engine.evaluate_guess(guess, session.secret_word)
        guess_number = len(session.guesses) + 1

        history_entry = GuessHistory(
            session_id=session.id,
            guess_number=guess_number,
            guess_word=guess
        )
        history_entry.result_pattern = result_pattern
        db.session.add(history_entry)

        # Check win/loss conditions
        won = all(r == 'correct' for r in result_pattern)
        lost = (guess_number >= session.max_attempts) and not won

        score_delta = 0
        if won:
            session.status = 'won'
            session.finished_at = datetime.utcnow()
            # Calculate dynamic score
            base_scores = {1: 150, 2: 120, 3: 100, 4: 80, 5: 60, 6: 40}
            score_delta = base_scores.get(guess_number, 30)
            if session.hard_mode:
                score_delta += 25
            session.score_delta = score_delta

            if session.user:
                session.user.record_game_outcome(won=True, num_guesses=guess_number, score_delta=score_delta)

        elif lost:
            session.status = 'lost'
            session.finished_at = datetime.utcnow()
            score_delta = -10
            session.score_delta = score_delta
            if session.user:
                session.user.record_game_outcome(won=False, num_guesses=guess_number, score_delta=score_delta)

        db.session.commit()

        return {
            'guessNumber': guess_number,
            'guess': guess,
            'result': result_pattern,
            'status': session.status,
            'gameFinished': won or lost,
            'gameWon': won,
            'secretWord': session.secret_word if (won or lost) else None,
            'scoreDelta': score_delta,
            'totalScore': session.user.score if session.user else None,
            'stats': session.user.to_dict()['stats'] if session.user else None
        }

    @staticmethod
    def encode_custom_word(word: str) -> str:
        """Create URL-safe base64 token for custom multiplayer challenges."""
        clean = word.strip().upper()
        encoded = base64.urlsafe_b64encode(clean.encode('utf-8')).decode('utf-8')
        return encoded

    @staticmethod
    def decode_custom_word(token: str) -> Optional[str]:
        try:
            decoded = base64.urlsafe_b64decode(token.encode('utf-8')).decode('utf-8')
            return decoded.upper()
        except Exception:
            return None
