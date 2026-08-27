"""Wordle Core Game Engine

Provides strict Wordle game mechanics, word validation, duplicate letter tracking,
and Hard Mode enforcement according to official Wordle specifications.
"""

from collections import Counter
from typing import List, Tuple, Dict, Optional, Set
import os

class WordleEngine:
    def __init__(self, target_words: List[str], valid_words: Optional[List[str]] = None):
        self.target_words = [w.strip().upper() for w in target_words if w.strip()]
        if valid_words:
            self.valid_words = set(w.strip().upper() for w in valid_words if w.strip())
        else:
            self.valid_words = set(self.target_words)
        
        # Ensure all target words are in valid words
        self.valid_words.update(self.target_words)

    @classmethod
    def from_files(cls, target_path: str, valid_path: Optional[str] = None):
        with open(target_path, 'r', encoding='utf-8', errors='ignore') as f:
            target_words = [line.strip().upper() for line in f if line.strip()]
        
        valid_words = None
        if valid_path and os.path.exists(valid_path):
            with open(valid_path, 'r', encoding='utf-8', errors='ignore') as f:
                valid_words = [line.strip().upper() for line in f if line.strip()]
        
        return cls(target_words, valid_words)

    def is_valid_word(self, word: str) -> bool:
        """Check if a word is in the dictionary of valid guesses."""
        return word.strip().upper() in self.valid_words

    @staticmethod
    def evaluate_guess(guess: str, target: str) -> List[str]:
        """Evaluate a guess against the target word following official Wordle rules.
        
        Returns a list of strings: 'correct' (green), 'present' (yellow), or 'absent' (gray).
        Correctly handles duplicate letter counts.
        """
        guess = guess.strip().upper()
        target = target.strip().upper()
        
        if len(guess) != len(target):
            raise ValueError(f"Guess length ({len(guess)}) must match target length ({len(target)})")
        
        length = len(target)
        result = ['absent'] * length
        target_letter_counts = Counter()

        # First pass: identify exact matches ('correct')
        for i in range(length):
            if guess[i] == target[i]:
                result[i] = 'correct'
            else:
                target_letter_counts[target[i]] += 1

        # Second pass: identify partial matches ('present') with remaining counts
        for i in range(length):
            if result[i] != 'correct':
                letter = guess[i]
                if target_letter_counts.get(letter, 0) > 0:
                    result[i] = 'present'
                    target_letter_counts[letter] -= 1
                else:
                    result[i] = 'absent'

        return result

    @staticmethod
    def validate_hard_mode(new_guess: str, previous_guesses: List[Tuple[str, List[str]]]) -> Tuple[bool, Optional[str]]:
        """Validate if new_guess satisfies all revealed constraints from previous guesses.
        
        previous_guesses is a list of tuples: (guess_word, result_pattern)
        Returns: (is_valid, error_message)
        """
        new_guess = new_guess.strip().upper()
        
        for prev_word, pattern in previous_guesses:
            prev_word = prev_word.strip().upper()
            
            # Check 1: All 'correct' (green) letters must be in the exact same position
            for i, status in enumerate(pattern):
                if status == 'correct':
                    if new_guess[i] != prev_word[i]:
                        return False, f"Position {i+1} must be '{prev_word[i]}'"

            # Check 2: All 'present' (yellow) letters must appear in the new guess
            yellow_letters = [prev_word[i] for i, status in enumerate(pattern) if status in ('present', 'correct')]
            new_guess_counts = Counter(new_guess)
            required_counts = Counter(yellow_letters)
            
            for char, count in required_counts.items():
                if new_guess_counts[char] < count:
                    return False, f"Guess must contain '{char}'"

        return True, None
