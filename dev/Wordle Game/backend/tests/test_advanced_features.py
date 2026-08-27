import pytest
from services.minimax_solver import MinimaxSolver
from services.game_analyzer import GameAnalyzer
from services.multi_grid_engine import MultiGridSession
from services.ai_battle_service import AIBattleService
from services.achievement_service import AchievementService
from services.ai_solver import WordleSolver

@pytest.fixture
def solver():
    words = ["CRANE", "SLATE", "TRACE", "APPLE", "GRAPE", "SHARP", "SMART"]
    return WordleSolver(words)

def test_minimax_solver(solver):
    minimax = MinimaxSolver(solver.target_words)
    worst = minimax.calculate_worst_case("CRANE", solver.target_words)
    assert isinstance(worst, int)
    assert worst >= 1

    recs = minimax.get_minimax_recommendations(solver.target_words, max_results=3)
    assert len(recs) <= 3
    assert all('word' in r and 'worstCaseRemaining' in r for r in recs)

def test_game_analyzer(solver):
    analyzer = GameAnalyzer(solver)
    history = [
        {'guess': 'TRACE', 'result': ['absent', 'present', 'correct', 'absent', 'absent']},
        {'guess': 'CRANE', 'result': ['correct', 'correct', 'correct', 'correct', 'correct']}
    ]
    review = analyzer.analyze_game(history, 'CRANE')
    assert 'accuracyScore' in review
    assert review['accuracyScore'] >= 50.0
    assert 'candidateCurve' in review
    assert len(review['moves']) == 2
    assert review['moves'][1]['quality'] in ('Brilliant', 'Great', 'Good')

def test_multi_grid_dordle(solver):
    session = MultiGridSession(mode='dordle', target_words=solver.target_words, custom_words=['CRANE', 'SLATE'])
    assert session.num_boards == 2
    assert session.max_attempts == 7

    # Submit guess
    res = session.submit_guess('CRANE')
    assert res['boards'][0]['status'] == 'won'
    assert res['boards'][1]['status'] == 'in_progress'
    assert res['gameFinished'] is False

    # Second guess completes second board
    res2 = session.submit_guess('SLATE')
    assert res2['boards'][1]['status'] == 'won'
    assert res2['gameFinished'] is True
    assert res2['gameWon'] is True

def test_ai_battle_simulation(solver):
    battle = AIBattleService(solver)
    tournament = battle.simulate_tournament(secret_word='CRANE', max_attempts=6)
    assert 'standings' in tournament
    assert len(tournament['standings']) == 4
    assert any(b['won'] for b in tournament['standings'])

def test_achievement_service():
    level_info = AchievementService.calculate_level(200)
    assert level_info['level'] >= 2
    assert 'title' in level_info

    unlocked = AchievementService.evaluate_achievements({'gamesWon': 1, 'currentStreak': 3}, {'won': True, 'guessesCount': 2})
    assert any(a['id'] == 'FIRST_WIN' for a in unlocked)
    assert any(a['id'] == 'SNIPER' for a in unlocked)

def test_advanced_api_endpoints(client):
    # Test Review endpoint
    rev_res = client.post('/api/analyzer/review', json={
        'secretWord': 'CRANE',
        'history': [{'guess': 'CRANE', 'result': ['correct', 'correct', 'correct', 'correct', 'correct']}]
    })
    assert rev_res.status_code == 200
    assert 'accuracyScore' in rev_res.get_json()

    # Test MultiGrid endpoint
    mg_res = client.post('/api/multigrid/new', json={'mode': 'dordle'})
    assert mg_res.status_code == 200
    assert mg_res.get_json()['numBoards'] == 2

    # Test Battle endpoint
    battle_res = client.post('/api/battle/simulate', json={'secretWord': 'CRANE'})
    assert battle_res.status_code == 200
    assert 'standings' in battle_res.get_json()

    # Test Achievements endpoint
    ach_res = client.get('/api/achievements/user')
    assert ach_res.status_code == 200
    assert 'level' in ach_res.get_json()
