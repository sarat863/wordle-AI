from datetime import datetime
import json
import bcrypt
from extensions import db

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    firstname = db.Column(db.String(50), nullable=True, default='')
    lastname = db.Column(db.String(50), nullable=True, default='')
    score = db.Column(db.Integer, default=0)
    
    # Statistical aggregations
    games_played = db.Column(db.Integer, default=0)
    games_won = db.Column(db.Integer, default=0)
    current_streak = db.Column(db.Integer, default=0)
    max_streak = db.Column(db.Integer, default=0)
    
    # Guess distribution (how many games won on guess 1, 2, 3, 4, 5, 6)
    guess_1 = db.Column(db.Integer, default=0)
    guess_2 = db.Column(db.Integer, default=0)
    guess_3 = db.Column(db.Integer, default=0)
    guess_4 = db.Column(db.Integer, default=0)
    guess_5 = db.Column(db.Integer, default=0)
    guess_6 = db.Column(db.Integer, default=0)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    sessions = db.relationship('GameSession', backref='user', lazy='dynamic', cascade='all, delete-orphan')

    def set_password(self, password: str):
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    def check_password(self, password: str) -> bool:
        if not self.password_hash:
            return False
        # Support legacy plaintext passwords if any existing DB row
        if not self.password_hash.startswith('$2b$') and not self.password_hash.startswith('$2a$'):
            if self.password_hash == password:
                # Upgrade to bcrypt on next login
                self.set_password(password)
                return True
            return False
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def record_game_outcome(self, won: bool, num_guesses: int, score_delta: int = 0):
        self.games_played += 1
        self.score = max(0, self.score + score_delta)
        if won:
            self.games_won += 1
            self.current_streak += 1
            if self.current_streak > self.max_streak:
                self.max_streak = self.current_streak
            if 1 <= num_guesses <= 6:
                attr = f'guess_{num_guesses}'
                setattr(self, attr, getattr(self, attr) + 1)
        else:
            self.current_streak = 0

    def to_dict(self):
        win_rate = round((self.games_won / self.games_played * 100), 1) if self.games_played > 0 else 0
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'firstname': self.firstname,
            'lastname': self.lastname,
            'score': self.score,
            'stats': {
                'gamesPlayed': self.games_played,
                'gamesWon': self.games_won,
                'winRate': win_rate,
                'currentStreak': self.current_streak,
                'maxStreak': self.max_streak,
                'guessDistribution': {
                    '1': self.guess_1,
                    '2': self.guess_2,
                    '3': self.guess_3,
                    '4': self.guess_4,
                    '5': self.guess_5,
                    '6': self.guess_6
                }
            },
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }


class GameSession(db.Model):
    __tablename__ = 'game_sessions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)
    mode = db.Column(db.String(30), default='practice') # daily, practice, speed, custom, length_4, length_6
    word_length = db.Column(db.Integer, default=5)
    secret_word = db.Column(db.String(20), nullable=False)
    max_attempts = db.Column(db.Integer, default=6)
    status = db.Column(db.String(20), default='in_progress') # in_progress, won, lost, abandoned
    hard_mode = db.Column(db.Boolean, default=False)
    score_delta = db.Column(db.Integer, default=0)
    time_taken_seconds = db.Column(db.Float, default=0.0)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    finished_at = db.Column(db.DateTime, nullable=True)

    guesses = db.relationship('GuessHistory', backref='session', lazy='joined', cascade='all, delete-orphan', order_by='GuessHistory.guess_number')

    def to_dict(self, reveal_secret: bool = False):
        return {
            'id': self.id,
            'userId': self.user_id,
            'mode': self.mode,
            'wordLength': self.word_length,
            'maxAttempts': self.max_attempts,
            'status': self.status,
            'hardMode': self.hard_mode,
            'scoreDelta': self.score_delta,
            'timeTakenSeconds': self.time_taken_seconds,
            'secretWord': self.secret_word if (reveal_secret or self.status in ('won', 'lost')) else None,
            'guesses': [g.to_dict() for g in self.guesses],
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'finishedAt': self.finished_at.isoformat() if self.finished_at else None
        }


class GuessHistory(db.Model):
    __tablename__ = 'guess_histories'

    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('game_sessions.id'), nullable=False, index=True)
    guess_number = db.Column(db.Integer, nullable=False)
    guess_word = db.Column(db.String(20), nullable=False)
    result_pattern_json = db.Column(db.Text, nullable=False)

    @property
    def result_pattern(self):
        try:
            return json.loads(self.result_pattern_json)
        except Exception:
            return []

    @result_pattern.setter
    def result_pattern(self, val):
        self.result_pattern_json = json.dumps(val)

    def to_dict(self):
        return {
            'guessNumber': self.guess_number,
            'guessWord': self.guess_word,
            'result': self.result_pattern
        }


class DailyChallenge(db.Model):
    __tablename__ = 'daily_challenges'

    id = db.Column(db.Integer, primary_key=True)
    date_str = db.Column(db.String(10), unique=True, nullable=False, index=True) # YYYY-MM-DD
    word_length = db.Column(db.Integer, default=5)
    secret_word = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
