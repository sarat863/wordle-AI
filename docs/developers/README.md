# 🛠️ Developer Guide & API Documentation

## 📐 Architecture Overview

Wordle AI is built with a decoupled client-server architecture:
- **Backend**: Python 3.10+, Flask 3, Flask-SQLAlchemy, PyJWT, bcrypt, and pytest.
- **Frontend**: React 18, Vite 5, TailwindCSS 3, Lucide React, and Canvas Confetti.

---

## 🗄️ Database Schema & Data Models

### 1. `User` Model
- `id` (Integer, Primary Key)
- `username` (String(50), Unique, Indexed)
- `email` (String(120), Unique, Indexed)
- `password_hash` (String(255), bcrypt hashed)
- `score` (Integer, Default: 0)
- `games_played`, `games_won`, `current_streak`, `max_streak`
- `guess_1` through `guess_6` (Integer counters for histogram)

### 2. `GameSession` Model
- `id` (Integer, Primary Key)
- `user_id` (ForeignKey to `users.id`, nullable for guest play)
- `mode` (`practice`, `daily`, `speed`, `custom`, `length_4`, `length_6`)
- `word_length` (4, 5, 6)
- `secret_word` (String)
- `status` (`in_progress`, `won`, `lost`)
- `hard_mode` (Boolean)
- `score_delta` (Integer)

### 3. `GuessHistory` Model
- `id` (Integer, Primary Key)
- `session_id` (ForeignKey to `game_sessions.id`)
- `guess_number` (Integer: 1 to 6)
- `guess_word` (String)
- `result_pattern_json` (JSON Array: `['correct', 'present', 'absent', ...]`)

---

## 🧠 Information Theory Solver Engine

The AI Solver implements Shannon Entropy:

$$E[I(g)] = \sum_{p \in \text{Patterns}} P(p) \cdot \log_2\left(\frac{1}{P(p)}\right)$$

- **`filter_candidates(candidates, guess, pattern)`**: Prunes impossible words by simulating the exact color feedback.
- **`calculate_entropy(guess, possible_words)`**: Calculates expected bits of information eliminated by guess $g$.
- **`get_top_recommendations(possible_words, max_results)`**: Ranks candidate words combining entropy scores with target status bonuses.

---

## 🧪 Running Automated Tests

```bash
cd "dev/Wordle Game/backend"
source .venv/bin/activate
pytest tests/ -v
```
