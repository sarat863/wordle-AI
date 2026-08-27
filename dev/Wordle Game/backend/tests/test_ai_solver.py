import pytest
from services.ai_solver import WordleSolver

@pytest.fixture
def sample_solver():
    sample_targets = ["CRANE", "SLATE", "TRACE", "APPLE", "GRAPE", "SHARP", "SMART"]
    return WordleSolver(sample_targets)

def test_filter_candidates(sample_solver):
    # If guess is "TRACE" and target is "CRANE" -> T: absent, R: present, A: correct, C: present, E: correct
    pattern = sample_solver.engine.evaluate_guess("TRACE", "CRANE")
    candidates = sample_solver.filter_candidates(sample_solver.target_words, "TRACE", pattern)
    assert "CRANE" in candidates
    assert "APPLE" not in candidates

def test_entropy_calculation(sample_solver):
    entropy = sample_solver.calculate_entropy("CRANE", sample_solver.target_words)
    assert isinstance(entropy, float)
    assert entropy >= 0.0

def test_top_recommendations(sample_solver):
    recs = sample_solver.get_top_recommendations(sample_solver.target_words, max_results=3)
    assert len(recs) <= 3
    assert all('word' in r and 'entropy' in r and 'score' in r for r in recs)

def test_hint_generation(sample_solver):
    hint1 = sample_solver.generate_hint("CRANE", [], hint_level=1)
    assert hint1['level'] == 1
    assert hint1['vowelCount'] == 2  # A, E
    assert hint1['uniqueLetters'] == 5
