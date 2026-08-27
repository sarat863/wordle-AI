<div align="center">

# 🌟 Wordle AI: Multi-Paradigm Puzzle Platform & Intelligent Solver Engine

**Engineered by [Sai Sarat Chandra](https://github.com/sarat863)**

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB.svg?logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.0%2B-000000.svg?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB.svg?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.2-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Pytest](https://img.shields.io/badge/Pytest-20%20Passed-22C55E.svg?logo=pytest&logoColor=white)](https://pytest.org)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED.svg?logo=docker&logoColor=white)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

*An enterprise-grade, full-stack Wordle ecosystem featuring mathematical solver algorithms (**Shannon Information Theory & Minimax**), Multi-Grid solving (**Dordle & Quordle**), a Chess.com-style **AI Move-by-Move Accuracy Reviewer**, a live **Bot vs Bot Tournament Arena**, and an **XP/Achievement Leveling System**.*

---

[🚀 Quick Start](#-quick-start-guide) • [🧠 Mathematical AI Solver](#-mathematical-formulation-of-the-ai-solver) • [🎮 Features](#-key-features) • [🏛️ Architecture](#-system-architecture) • [📡 API Reference](#-restful-api-reference) • [🧪 Testing](#-automated-testing-suite) • [👨‍💻 Author](#-author--contact)

---

</div>

## 📸 Key Features

| Feature | Description |
| :--- | :--- |
| 🧠 **Shannon Entropy AI Solver** | Real-time calculation of expected information gain ($E[I] = \sum P(p) \log_2 \frac{1}{P(p)}$) to rank mathematically optimal guesses. |
| 🛡️ **Minimax Solver Algorithm** | Calculates worst-case remaining candidate pool ($\min_g \max_p \|\mathcal{W}_{g,p}\|$) to guarantee minimal risk. |
| 💎 **AI Game Review (Chess.com Style)** | Post-game move quality classification: **Brilliant (💎)**, **Great (🟢)**, **Good (🔵)**, **Inaccuracy (🟡)**, **Mistake (🟠)**, **Blunder (🔴)** with overall accuracy %. |
| 👥 **Multi-Grid Wordle (Dordle & Quordle)** | Play 2 simultaneous boards (Dordle, 7 attempts) or 4 simultaneous boards (Quordle, 9 attempts) with linked typing and independent status. |
| ⚔️ **Bot vs Bot Tournament Arena** | Live head-to-head simulation benchmarking Shannon Entropy vs. Minimax vs. Letter Frequency vs. Random baseline algorithms. |
| 🎖️ **XP & Achievement Leveling** | Level progression ($\text{Level} = \lfloor \sqrt{\text{XP}/50} \rfloor + 1$), player titles (*Novice Puzzler* to *Grandmaster*), and unlockable badges. |
| 📅 **Daily & Speed Run Modes** | Date-seeded universal daily puzzle and high-stakes 3-minute timed countdown sprints. |
| 🔤 **Variable Word Lengths** | Dynamic switching across 4-letter mini, 5-letter classic, and 6-letter master boards. |
| 🔗 **Multiplayer Friend Challenges** | Encrypted URL tokens to create and share custom secret word challenges with friends. |
| 📖 **Vocabulary Dictionary Inspector** | In-game phonetics, parts of speech, definitions, and usage examples via Merriam-Webster & Free Dictionary API integration. |
| 🔊 **Web Audio Synthesizer** | Native Web Audio API sound generator for keypresses, musical tile reveal chords, error buzzers, and celebratory fanfares. |
| 🎨 **Accessibility & Themes** | Midnight Dark, Studio Light, and High-Contrast Colorblind Mode (Orange / Sky Blue). |

---

## 🏛️ System Architecture

```mermaid
graph TD
    subgraph ClientLayer [Frontend: React 18 + Vite + TailwindCSS]
        UI[Interactive Board & Responsive QWERTY Keyboard]
        MultiGridUI[Multi-Grid Layout: Dordle & Quordle]
        SolverDrawer[AI Solver & Hints Drawer]
        ReviewModal[Move-by-Move AI Game Review]
        BattleArena[Bot vs Bot Tournament Arena]
        AudioEngine[Web Audio API Sound Engine]
        OfflineEngine[Local Client-Side Fallback Engine]
    end

    subgraph GatewayLayer [Backend API: Flask Application Factory]
        API[RESTful API Gateway + CORS + Bearer Token Auth]
        AuthRouter[routes/auth_routes.py]
        GameRouter[routes/game_routes.py]
        MultiGridRouter[routes/multigrid_routes.py]
        SolverRouter[routes/solver_routes.py]
        AnalyzerRouter[routes/analyzer_routes.py]
        BattleRouter[routes/battle_routes.py]
        AchievementRouter[routes/achievement_routes.py]
        StatsRouter[routes/stats_routes.py]
    end

    subgraph ServiceLayer [Engine Services]
        WordleEngine[Strict Wordle Evaluator & Duplicate Letter Logic]
        EntropySolver[Shannon Entropy Information Theory Solver]
        MinimaxSolver[Minimax Worst-Case Pruning Solver]
        MultiGridService[Dordle & Quordle Engine]
        AnalyzerService[Game Review & Move Quality Classifier]
        BattleService[AI Tournament Simulation Runner]
        AchievementService[XP, Level & Badges Progression]
    end

    subgraph DataLayer [Data Persistence & Dictionaries]
        DB[(SQLAlchemy ORM: SQLite / PostgreSQL)]
        WordDicts[Target Words & Valid Dictionaries: 4, 5, 6 Letters]
    end

    UI -->|REST API + JWT| API
    UI -.->|Network Fallback| OfflineEngine
    API --> AuthRouter & GameRouter & MultiGridRouter & SolverRouter & AnalyzerRouter & BattleRouter & AchievementRouter & StatsRouter
    GameRouter --> WordleEngine
    MultiGridRouter --> MultiGridService
    SolverRouter --> EntropySolver & MinimaxSolver
    AnalyzerRouter --> AnalyzerService
    BattleRouter --> BattleService
    AchievementRouter --> AchievementService
    AuthRouter & StatsRouter --> DB
    ServiceLayer --> DB
    ServiceLayer --> WordDicts
```

---

## 🧠 Mathematical Formulation of the AI Solver

The AI Solver is formulated on principles of **Information Theory (Shannon Entropy)** and **Minimax Decision Theory**.

### 1. Shannon Information Entropy ($E[I]$)

Given:
- A candidate guess $g$
- The set of remaining possible target words $\mathcal{W}$
- The set of Wordle feedback patterns $\mathcal{P} = \{0, 1, 2\}^L$ (where $0 = \text{absent}$, $1 = \text{present}$, $2 = \text{correct}$)

The probability $P(p)$ of receiving pattern $p$ when guessing $g$ is:
$$P(p) = \frac{|\{w \in \mathcal{W} : \text{evaluate}(g, w) = p\}|}{|\mathcal{W}|}$$

The **Expected Information Gain (Entropy in bits)** is computed as:
$$E[I(g)] = \sum_{p \in \mathcal{P}} P(p) \cdot \log_2\left(\frac{1}{P(p)}\right)$$

The optimal guess maximizes expected information:
$$g^*_{\text{entropy}} = \arg\max_{g \in \mathcal{V}} E[I(g)]$$

---

### 2. Minimax Worst-Case Pruning

The Minimax strategy minimizes the maximum possible remaining candidate pool size:
$$\text{WorstCase}(g) = \max_{p \in \mathcal{P}} |\{w \in \mathcal{W} : \text{evaluate}(g, w) = p\}|$$
$$g^*_{\text{minimax}} = \arg\min_{g \in \mathcal{V}} \text{WorstCase}(g)$$

---

## 📡 RESTful API Reference

| Endpoint | Method | Description | Auth |
| :--- | :---: | :--- | :---: |
| `/api/auth/register` | `POST` | Register user with bcrypt password hashing | No |
| `/api/auth/login` | `POST` | Authenticate user and issue JWT Bearer token | No |
| `/api/auth/profile` | `GET` | Get profile, score, and lifetime gameplay statistics | Yes |
| `/api/game/new` | `POST` | Initialize a game session (Daily, Practice, 4/5/6-letter) | Optional |
| `/api/game/guess` | `POST` | Submit guess with strict duplicate letter color evaluation | Optional |
| `/api/game/give-up` | `POST` | Forfeit active game and reveal secret word | Optional |
| `/api/game/custom/create` | `POST` | Generate encrypted token for friend challenge | No |
| `/api/multigrid/new` | `POST` | Start Dordle (2 boards) or Quordle (4 boards) match | Optional |
| `/api/multigrid/guess` | `POST` | Submit simultaneous guess across all active sub-boards | Optional |
| `/api/analyzer/review` | `POST` | Generate move-by-move accuracy review & candidate curve | Optional |
| `/api/battle/simulate` | `POST` | Run 4-bot head-to-head algorithm tournament simulation | No |
| `/api/achievements/user` | `GET` | Retrieve player XP, Level, and unlocked achievement badges | Optional |
| `/api/solver/recommend` | `POST` | Compute top moves ranked by Shannon Entropy | No |
| `/api/solver/hints` | `POST` | Retrieve tiered structural & character hints | No |
| `/api/solver/analyze` | `POST` | Analyze entropy bits for any custom test word | No |
| `/api/leaderboard/global`| `GET` | Retrieve global leaderboard ranked by score & streaks | No |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+**
- **Node.js 18+ & npm**

### Option A: Local Development Setup

#### 1. Backend Server Setup
```bash
# Navigate to backend directory
cd "dev/Wordle Game/backend"

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
python app.py
```
*Backend API will run at `http://127.0.0.1:5001` with automatic SQLite schema initialization.*

#### 2. Frontend Web App Setup
```bash
# In a new terminal, navigate to frontend directory
cd "dev/Wordle Game/frontend"

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
*Open `http://localhost:5173` in your browser.*

---

### Option B: Docker One-Click Deployment

Deploy both the backend and frontend in containerized environments:

```bash
docker compose up --build
```
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:5001`

---

## 🧪 Automated Testing Suite

### Backend Pytest Suite (20 Tests Passed)
```bash
cd "dev/Wordle Game/backend"
source .venv/bin/activate
pytest tests/ -v
```

```text
============================= test session starts ==============================
collected 20 items

tests/test_advanced_features.py::test_minimax_solver PASSED              [  5%]
tests/test_advanced_features.py::test_game_analyzer PASSED               [ 10%]
tests/test_advanced_features.py::test_multi_grid_dordle PASSED           [ 15%]
tests/test_advanced_features.py::test_ai_battle_simulation PASSED        [ 20%]
tests/test_advanced_features.py::test_achievement_service PASSED         [ 25%]
tests/test_advanced_features.py::test_advanced_api_endpoints PASSED      [ 30%]
tests/test_ai_solver.py::test_filter_candidates PASSED                   [ 35%]
tests/test_ai_solver.py::test_entropy_calculation PASSED                 [ 40%]
tests/test_ai_solver.py::test_top_recommendations PASSED                 [ 45%]
tests/test_ai_solver.py::test_hint_generation PASSED                     [ 50%]
tests/test_api_endpoints.py::test_health_check PASSED                    [ 55%]
tests/test_api_endpoints.py::test_auth_registration_and_login PASSED     [ 60%]
tests/test_api_endpoints.py::test_game_flow_and_guess PASSED             [ 65%]
tests/test_api_endpoints.py::test_leaderboard_endpoint PASSED            [ 70%]
tests/test_api_endpoints.py::test_solver_recommend_endpoint PASSED       [ 75%]
tests/test_wordle_engine.py::test_exact_match PASSED                     [ 80%]
tests/test_wordle_engine.py::test_all_absent PASSED                      [ 85%]
tests/test_wordle_engine.py::test_duplicate_letter_handling_target_single PASSED [ 90%]
tests/test_wordle_engine.py::test_duplicate_letter_handling_green_priority PASSED [ 95%]
tests/test_wordle_engine.py::test_hard_mode_validation PASSED            [100%]

============================== 20 passed in 4.91s ==============================
```

### Frontend Production Build
```bash
cd "dev/Wordle Game/frontend"
npm run build
```

---

## 👨‍💻 Author & Contact

**Sai Sarat Chandra**  
Software Engineer  
📍 Denton, TX  
📧 [saisaratchandravytla@gmail.com](mailto:saisaratchandravytla@gmail.com)  
🐙 [GitHub: @sarat863](https://github.com/sarat863)  
🔗 [Repository: wordle-AI](https://github.com/sarat863/wordle-AI)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
