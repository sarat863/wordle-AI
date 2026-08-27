# 🎓 Expert Users & Solver Guide

## 🔬 Mathematical Foundations of the Solver

Wordle can be framed as minimizing the expected number of turns required to identify a hidden word $w^* \in \mathcal{W}$.

### 1. Shannon Entropy Formula
At any state with remaining candidate set $\mathcal{W}$, a guess $g$ partitions $\mathcal{W}$ into equivalence classes $\mathcal{W}_p$ indexed by feedback pattern $p \in \{0, 1, 2\}^L$:

$$P(p) = \frac{|\mathcal{W}_p|}{|\mathcal{W}|}$$

The expected information gain (Entropy) is:
$$E[I(g)] = -\sum_{p} P(p) \log_2 P(p)$$

### 2. Strategy Optimization
- **First Guess**: Statistically, words with high vowel/common consonant distributions across distinct positions (such as `CRANE`, `SLATE`, `TRACE`, `SOARE`) yield between $5.6$ and $5.87$ bits of expected entropy out of the maximum $\approx 11.2$ bits needed.
- **Subsequent Turns**: The AI dynamically prunes candidate space and evaluates candidate words vs exploratory words to balance information gain with immediate win probability ($P(\text{win}) = \frac{1}{|\mathcal{W}|}$).

---

## ⚡ Speed Run Scoring Mechanics

- **1st Guess Solve**: +150 points
- **2nd Guess Solve**: +120 points
- **3rd Guess Solve**: +100 points
- **4th Guess Solve**: +80 points
- **5th Guess Solve**: +60 points
- **6th Guess Solve**: +40 points
- **Hard Mode Multiplier**: +25 bonus points
- **Loss / Give Up**: -10 points
