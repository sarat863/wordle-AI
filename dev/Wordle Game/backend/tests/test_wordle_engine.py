import pytest
from services.wordle_engine import WordleEngine

def test_exact_match():
    result = WordleEngine.evaluate_guess("CRANE", "CRANE")
    assert result == ['correct', 'correct', 'correct', 'correct', 'correct']

def test_all_absent():
    result = WordleEngine.evaluate_guess("PLUMB", "FIGHT")
    assert result == ['absent', 'absent', 'absent', 'absent', 'absent']

def test_duplicate_letter_handling_target_single():
    # Target has 1 'P', guess has 2 'P's
    # First P is yellow, second P is gray
    result = WordleEngine.evaluate_guess("SPEED", "ERUPT")
    # Secret = ERUPT (E, R, U, P, T)
    # Guess = SPEED (S: absent, P: present, E: present (first E matches one of target E's), E: absent (target has only 1 E), D: absent)
    assert result[0] == 'absent'   # S
    assert result[1] == 'present'  # P in ERUPT
    assert result[2] == 'present'  # First E
    assert result[3] == 'absent'   # Second E (only 1 E in target)
    assert result[4] == 'absent'   # D

def test_duplicate_letter_handling_green_priority():
    # Secret = APPLE (A:1, P:2, L:1, E:1)
    # Guess = PUPPY (P, U, P, P, Y)
    # Index 2: P matches P (correct)
    # Remaining P in target: 1
    # Index 0: P is present (matches remaining P)
    # Index 3: P is absent (target only has 2 P's total)
    result = WordleEngine.evaluate_guess("PUPPY", "APPLE")
    assert result == ['present', 'absent', 'correct', 'absent', 'absent']

def test_hard_mode_validation():
    # 1st guess: CRANE against SMART -> C: absent, R: present, A: correct, N: absent, E: absent
    history = [("CRANE", ['absent', 'present', 'correct', 'absent', 'absent'])]
    
    # Valid next guess in hard mode: must have 'A' at pos 3 and must contain 'R'
    valid, err = WordleEngine.validate_hard_mode("SPARK", history)
    assert valid is True
    assert err is None
    
    # Invalid: missing 'A' at pos 3
    valid, err = WordleEngine.validate_hard_mode("SHIRT", history)
    assert valid is False
    assert "Position 3 must be 'A'" in err
    
    # Invalid: missing 'R'
    valid, err = WordleEngine.validate_hard_mode("STAMP", history)
    assert valid is False
    assert "Guess must contain 'R'" in err
