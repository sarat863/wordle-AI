import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from './Navbar';
import Board from './Board';
import MultiGridBoard from './MultiGridBoard';
import Keyboard from './Keyboard';
import HintsDrawer from './HintsDrawer';
import StatsModal from './StatsModal';
import LeaderboardModal from './LeaderboardModal';
import CustomChallengeModal from './CustomChallengeModal';
import HowToPlayModal from './HowToPlayModal';
import SettingsModal from './SettingsModal';
import GameOverModal from './GameOverModal';
import GameReviewModal from './GameReviewModal';
import AIBattleModal from './AIBattleModal';
import AchievementsModal from './AchievementsModal';
import DictionaryModal from './DictionaryModal';

import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { gameApi, multiGridApi } from '../services/api';
import { LocalWordleEngine } from '../services/localEngine';
import { AlertCircle, Timer, Sparkles, RefreshCw } from 'lucide-react';

function Game() {
  const [searchParams] = useSearchParams();
  const { user, isGuest, guestStats, recordGuestGame, setUser } = useAuth();
  const { playKeypress, playTileFlip, playError, playVictory, playDefeat } = useSound();

  // Mode and settings
  const [gameMode, setGameMode] = useState('practice');
  const [wordLength, setWordLength] = useState(5);
  const [hardMode, setHardMode] = useState(false);
  const [maxAttempts, setMaxAttempts] = useState(6);

  // Active game session state (single board)
  const [sessionId, setSessionId] = useState(null);
  const [secretWord, setSecretWord] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [results, setResults] = useState([]);
  const [letterStatuses, setLetterStatuses] = useState({});
  const [gameFinished, setGameFinished] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [scoreDelta, setScoreDelta] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  // MultiGrid state (Dordle & Quordle)
  const isMultiGrid = gameMode === 'dordle' || gameMode === 'quordle';
  const [multiGridSessionId, setMultiGridSessionId] = useState(null);
  const [multiGridBoards, setMultiGridBoards] = useState([]);
  const [multiGridCurrentAttempt, setMultiGridCurrentAttempt] = useState(0);

  // Speed run timer state
  const [timerSeconds, setTimerSeconds] = useState(180);
  const timerRef = useRef(null);

  // Modals state
  const [hintsOpen, setHintsOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [gameOverOpen, setGameOverOpen] = useState(false);
  const [gameReviewOpen, setGameReviewOpen] = useState(false);
  const [battleOpen, setBattleOpen] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [dictionaryOpen, setDictionaryOpen] = useState(false);
  const [dictLookupWord, setDictLookupWord] = useState('');

  const showToast = (msg, duration = 2000) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), duration);
  };

  // Initialize or reset game session
  const initializeGame = useCallback(async (mode = gameMode, length = wordLength) => {
    setGuesses([]);
    setCurrentInput('');
    setResults([]);
    setLetterStatuses({});
    setGameFinished(false);
    setGameWon(false);
    setScoreDelta(0);
    setGameOverOpen(false);
    setGameReviewOpen(false);
    setTimerSeconds(mode === 'speed' ? 180 : 0);

    // MultiGrid modes (Dordle & Quordle)
    if (mode === 'dordle' || mode === 'quordle') {
      try {
        const res = await multiGridApi.startSession(mode);
        setMultiGridSessionId(res.sessionId);
        setMultiGridBoards(res.boards);
        setMultiGridCurrentAttempt(0);
        setMaxAttempts(res.maxAttempts);
      } catch (err) {
        // Fallback local multigrid
        const num = mode === 'dordle' ? 2 : 4;
        const words = Array.from({ length: num }, () => LocalWordleEngine.getRandomWord(5));
        setMultiGridSessionId('local_mg');
        setMultiGridBoards(words.map((w, idx) => ({
          id: idx,
          secretWord: w,
          guesses: [],
          results: [],
          status: 'in_progress',
          wonAtGuess: null
        })));
        setMultiGridCurrentAttempt(0);
        setMaxAttempts(mode === 'dordle' ? 7 : 9);
      }
      return;
    }

    // Single Grid modes
    const customToken = searchParams.get('token');
    const paramLength = parseInt(searchParams.get('length') || '5', 10);
    const actualLength = customToken ? paramLength : length;

    try {
      const res = await gameApi.startSession({
        mode,
        wordLength: actualLength,
        hardMode,
        customToken: customToken || undefined
      });

      setSessionId(res.sessionId);
      setMaxAttempts(res.maxAttempts || 6);
      if (res.word) {
        setSecretWord(res.word);
      }
    } catch (err) {
      let localSecret = '';
      if (mode === 'daily') {
        localSecret = LocalWordleEngine.getDailyWord(actualLength);
      } else if (customToken) {
        try {
          localSecret = atob(customToken).toUpperCase();
        } catch {
          localSecret = LocalWordleEngine.getRandomWord(actualLength);
        }
      } else {
        localSecret = LocalWordleEngine.getRandomWord(actualLength);
      }

      setSecretWord(localSecret);
      setSessionId(null);
      setMaxAttempts(6);
    }
  }, [gameMode, wordLength, hardMode, searchParams]);

  useEffect(() => {
    if (gameMode === 'length_4') {
      setWordLength(4);
      initializeGame('length_4', 4);
    } else if (gameMode === 'length_6') {
      setWordLength(6);
      initializeGame('length_6', 6);
    } else {
      initializeGame(gameMode, wordLength);
    }
  }, [gameMode]);

  // Speed run countdown timer
  useEffect(() => {
    if (gameMode === 'speed' && !gameFinished) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleGameOver(false, secretWord, -10);
            showToast("Time's up! Speed run ended.", 3000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameMode, gameFinished, secretWord]);

  const updateLetterStatuses = (guessWord, evalResult) => {
    setLetterStatuses(prev => {
      const updated = { ...prev };
      const priority = { correct: 3, present: 2, absent: 1 };

      guessWord.split('').forEach((char, idx) => {
        const newStatus = evalResult[idx];
        const currentStatus = updated[char];

        if (!currentStatus || priority[newStatus] > (priority[currentStatus] || 0)) {
          updated[char] = newStatus;
        }
      });
      return updated;
    });
  };

  const handleGameOver = (won, answer, delta) => {
    setGameFinished(true);
    setGameWon(won);
    setSecretWord(answer);
    setScoreDelta(delta);
    
    if (user) {
      setUser(prev => ({
        ...prev,
        score: Math.max(0, prev.score + delta),
        stats: {
          ...prev.stats,
          gamesPlayed: prev.stats.gamesPlayed + 1,
          gamesWon: won ? prev.stats.gamesWon + 1 : prev.stats.gamesWon,
          currentStreak: won ? prev.stats.currentStreak + 1 : 0,
          maxStreak: won ? Math.max(prev.stats.maxStreak, prev.stats.currentStreak + 1) : prev.stats.maxStreak
        }
      }));
    } else {
      recordGuestGame(won, guesses.length + 1, delta);
    }

    setTimeout(() => {
      setGameOverOpen(true);
    }, 1200);
  };

  // Submit guess for both Single Grid and Multi-Grid
  const handleSubmitGuess = async () => {
    if (gameFinished) return;

    const expectedLen = isMultiGrid ? 5 : wordLength;
    if (currentInput.length !== expectedLen) {
      playError();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      showToast(`Word must be ${expectedLen} letters long`);
      return;
    }

    const guess = currentInput.toUpperCase();

    // MultiGrid Submit (Dordle & Quordle)
    if (isMultiGrid) {
      try {
        let updatedBoards = [];
        let allWon = true;
        let finished = false;
        const newAttempt = multiGridCurrentAttempt + 1;

        if (multiGridSessionId && multiGridSessionId !== 'local_mg') {
          const res = await multiGridApi.submitGuess(multiGridSessionId, guess);
          updatedBoards = res.boards;
          finished = res.gameFinished;
          allWon = res.gameWon;
        } else {
          // Local MultiGrid Evaluation
          updatedBoards = multiGridBoards.map(b => {
            if (b.status === 'won') return b;
            const resPat = LocalWordleEngine.evaluateGuess(guess, b.secretWord);
            const isBoardWon = resPat.every(r => r === 'correct');
            return {
              ...b,
              guesses: [...b.guesses, guess],
              results: [...b.results, resPat],
              status: isBoardWon ? 'won' : 'in_progress',
              wonAtGuess: isBoardWon ? newAttempt : null
            };
          });
          allWon = updatedBoards.every(b => b.status === 'won');
          finished = allWon || newAttempt >= maxAttempts;
        }

        setMultiGridBoards(updatedBoards);
        setMultiGridCurrentAttempt(newAttempt);
        setCurrentInput('');

        // Aggregate key statuses across active boards
        updatedBoards.forEach(b => {
          const lastRes = b.results[b.results.length - 1];
          if (lastRes) updateLetterStatuses(guess, lastRes);
        });

        playTileFlip(0);

        if (finished) {
          handleGameOver(allWon, updatedBoards.map(b => b.secretWord).join(', '), allWon ? (gameMode === 'quordle' ? 250 : 150) : -10);
        }
      } catch (err) {
        playError();
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        showToast(err.response?.data?.error || 'Invalid word');
      }
      return;
    }

    // Single Grid Submit
    try {
      if (sessionId) {
        const response = await gameApi.submitGuess(sessionId, guess);
        const newResults = [...results, response.result];
        const newGuesses = [...guesses, guess];

        setResults(newResults);
        setGuesses(newGuesses);
        setCurrentInput('');
        updateLetterStatuses(guess, response.result);

        guess.split('').forEach((_, i) => {
          setTimeout(() => playTileFlip(i), i * 150);
        });

        if (response.gameFinished) {
          handleGameOver(response.gameWon, response.secretWord, response.scoreDelta);
        }
      } else {
        const engineResult = LocalWordleEngine.evaluateGuess(guess, secretWord);
        const newResults = [...results, engineResult];
        const newGuesses = [...guesses, guess];

        setResults(newResults);
        setGuesses(newGuesses);
        setCurrentInput('');
        updateLetterStatuses(guess, engineResult);

        guess.split('').forEach((_, i) => {
          setTimeout(() => playTileFlip(i), i * 150);
        });

        const won = engineResult.every(r => r === 'correct');
        const lost = newGuesses.length >= maxAttempts && !won;

        if (won || lost) {
          const delta = won ? (120 - (newGuesses.length - 1) * 20 + (hardMode ? 25 : 0)) : -10;
          handleGameOver(won, secretWord, delta);
        }
      }
    } catch (err) {
      playError();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      const errMsg = err.response?.data?.error || 'Invalid word submission';
      showToast(errMsg);
    }
  };

  const handleChar = (char) => {
    if (gameFinished) return;
    const maxLen = isMultiGrid ? 5 : wordLength;
    if (currentInput.length < maxLen) {
      playKeypress();
      setCurrentInput(prev => prev + char.toUpperCase());
    }
  };

  const handleDelete = () => {
    if (gameFinished) return;
    if (currentInput.length > 0) {
      playKeypress();
      setCurrentInput(prev => prev.slice(0, -1));
    }
  };

  // Keyboard event listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (hintsOpen || statsOpen || leaderboardOpen || howToPlayOpen || settingsOpen || gameOverOpen || gameReviewOpen || battleOpen || achievementsOpen || dictionaryOpen) {
        if (e.key === 'Escape') {
          setHintsOpen(false);
          setStatsOpen(false);
          setLeaderboardOpen(false);
          setHowToPlayOpen(false);
          setSettingsOpen(false);
          setGameOverOpen(false);
          setGameReviewOpen(false);
          setBattleOpen(false);
          setAchievementsOpen(false);
          setDictionaryOpen(false);
        }
        return;
      }

      if (e.key === 'Enter') {
        handleSubmitGuess();
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleDelete();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleChar(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentInput, gameFinished, wordLength, isMultiGrid, hintsOpen, statsOpen, leaderboardOpen, howToPlayOpen, settingsOpen, gameOverOpen, gameReviewOpen, battleOpen, achievementsOpen, dictionaryOpen]);

  const currentScore = user?.score ?? guestStats.score;

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500/30 dark:bg-slate-950 light:bg-slate-50 light:text-slate-900 transition-colors">
      
      {/* Navigation Bar */}
      <Navbar
        gameMode={gameMode}
        setGameMode={setGameMode}
        onOpenHints={() => setHintsOpen(true)}
        onOpenStats={() => setStatsOpen(true)}
        onOpenLeaderboard={() => setLeaderboardOpen(true)}
        onOpenHowToPlay={() => setHowToPlayOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenAchievements={() => setAchievementsOpen(true)}
        onOpenBattle={() => setBattleOpen(true)}
        onOpenDictionary={() => {
          setDictLookupWord(secretWord || 'CRANE');
          setDictionaryOpen(true);
        }}
        score={currentScore}
      />

      {/* Speed Run Timer Pill */}
      {gameMode === 'speed' && (
        <div className="flex justify-center mt-2">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-amber-500/40 text-amber-400 font-mono text-sm font-bold shadow-lg">
            <Timer className="w-4 h-4 animate-pulse" />
            <span>Time Left: {formatTimer(timerSeconds)}</span>
          </div>
        </div>
      )}

      {/* Toast Banner Alert */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-in fade-in zoom-in duration-150">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-white font-bold text-xs sm:text-sm light:bg-slate-800">
            <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Board Area */}
      <main className="flex-1 flex flex-col items-center justify-between max-w-4xl mx-auto w-full px-2 py-2">
        {isMultiGrid ? (
          <MultiGridBoard
            boards={multiGridBoards}
            currentAttempt={multiGridCurrentAttempt}
            currentInput={currentInput}
            maxAttempts={maxAttempts}
            isShaking={isShaking}
          />
        ) : (
          <Board
            guesses={guesses}
            currentGuessIndex={guesses.length}
            currentInput={currentInput}
            results={results}
            wordLength={wordLength}
            maxAttempts={maxAttempts}
            isShaking={isShaking}
            gameWon={gameWon}
          />
        )}

        {/* Virtual On-Screen Keyboard */}
        <Keyboard
          letterStatuses={letterStatuses}
          onChar={handleChar}
          onEnter={handleSubmitGuess}
          onDelete={handleDelete}
          disabled={gameFinished}
        />
      </main>

      {/* Modals & Drawers */}
      <HintsDrawer
        isOpen={hintsOpen}
        onClose={() => setHintsOpen(false)}
        history={guesses.map((g, i) => ({ guess: g, result: results[i] }))}
        wordLength={isMultiGrid ? 5 : wordLength}
        sessionId={sessionId}
        onSelectWord={(word) => {
          if (!gameFinished) {
            setCurrentInput(word);
            setHintsOpen(false);
          }
        }}
      />

      <StatsModal isOpen={statsOpen} onClose={() => setStatsOpen(false)} />
      <LeaderboardModal isOpen={leaderboardOpen} onClose={() => setLeaderboardOpen(false)} />
      <CustomChallengeModal isOpen={gameMode === 'custom'} onClose={() => setGameMode('practice')} />
      <HowToPlayModal isOpen={howToPlayOpen} onClose={() => setHowToPlayOpen(false)} />
      <AchievementsModal isOpen={achievementsOpen} onClose={() => setAchievementsOpen(false)} />
      <AIBattleModal isOpen={battleOpen} onClose={() => setBattleOpen(false)} />
      <DictionaryModal 
        isOpen={dictionaryOpen} 
        onClose={() => setDictionaryOpen(false)} 
        initialWord={dictLookupWord}
      />
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        hardMode={hardMode}
        setHardMode={setHardMode}
        wordLength={wordLength}
        setWordLength={setWordLength}
        onResetGame={(len) => initializeGame(gameMode, len)}
      />
      <GameOverModal
        isOpen={gameOverOpen}
        onClose={() => setGameOverOpen(false)}
        gameWon={gameWon}
        secretWord={secretWord}
        guessesCount={guesses.length}
        scoreDelta={scoreDelta}
        results={results}
        onPlayAgain={() => initializeGame(gameMode, wordLength)}
        onOpenReview={() => setGameReviewOpen(true)}
        onOpenDictionary={(word) => {
          setDictLookupWord(word);
          setDictionaryOpen(true);
        }}
      />
      <GameReviewModal
        isOpen={gameReviewOpen}
        onClose={() => setGameReviewOpen(false)}
        history={guesses.map((g, i) => ({ guess: g, result: results[i] }))}
        secretWord={secretWord}
        sessionId={sessionId}
      />

    </div>
  );
}

export default Game;
