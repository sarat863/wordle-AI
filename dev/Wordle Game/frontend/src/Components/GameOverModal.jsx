import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RefreshCw, Share2, Flame, Check, X, Award, ExternalLink, Brain, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';

function GameOverModal({ 
  isOpen, 
  onClose, 
  gameWon, 
  secretWord, 
  guessesCount, 
  scoreDelta, 
  onPlayAgain, 
  results = [],
  onOpenReview,
  onOpenDictionary
}) {
  const { user, guestStats } = useAuth();
  const { playVictory, playDefeat } = useSound();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (gameWon) {
        playVictory();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#eab308', '#0284c7', '#ec4899', '#f97316']
        });
      } else {
        playDefeat();
      }
    }
  }, [isOpen, gameWon]);

  if (!isOpen) return null;

  const currentStreak = user?.stats?.currentStreak ?? guestStats.currentStreak;

  const generateShareText = () => {
    const emojis = {
      correct: '🟩',
      present: '🟨',
      absent: '⬛'
    };

    let text = `Wordle AI ${gameWon ? guessesCount : 'X'}/6\n\n`;
    for (const row of results) {
      text += row.map(status => emojis[status] || '⬛').join('') + '\n';
    }
    text += `\nPlay at: ${window.location.origin}`;
    return text;
  };

  const handleShare = () => {
    const text = generateShareText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden z-10 light:bg-white light:border-slate-200 text-center p-6 space-y-5">
        
        {/* Victory / Defeat Badge */}
        <div className="flex justify-center">
          {gameWon ? (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
              <Trophy className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
              <X className="w-8 h-8 text-red-400" />
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <h3 className="text-2xl font-black text-white light:text-slate-900">
            {gameWon ? 'Splendid Victory!' : 'Game Over'}
          </h3>
          <p className="text-xs text-slate-400 light:text-slate-600 mt-1">
            {gameWon 
              ? `Solved in ${guessesCount} ${guessesCount === 1 ? 'guess' : 'guesses'}!` 
              : 'Better luck next round! The secret word was:'}
          </p>
        </div>

        {/* Secret Word Box */}
        <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 light:bg-slate-50 light:border-slate-200 space-y-1.5">
          <div className="font-mono text-3xl font-black tracking-widest text-emerald-400 light:text-emerald-600 uppercase">
            {secretWord}
          </div>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => onOpenDictionary && onOpenDictionary(secretWord)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-400 hover:text-teal-300 transition"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Dictionary Lookup</span>
            </button>
          </div>
        </div>

        {/* Score & Streak */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 light:bg-slate-50 light:border-slate-200">
            <div className={`text-xl font-extrabold ${scoreDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {scoreDelta >= 0 ? `+${scoreDelta}` : scoreDelta}
            </div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase">Score Earned</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 light:bg-slate-50 light:border-slate-200">
            <div className="text-xl font-extrabold text-amber-400 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 fill-amber-400" />
              {currentStreak}
            </div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase">Win Streak</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {/* AI Game Review Button */}
          <button
            onClick={() => {
              onClose();
              if (onOpenReview) onOpenReview();
            }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 transition"
          >
            <Brain className="w-4 h-4" />
            <span>View AI Move-by-Move Review 💎</span>
          </button>

          <button
            onClick={onPlayAgain}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Play Next Round</span>
          </button>

          <button
            onClick={handleShare}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 light:bg-slate-100 light:text-slate-800 light:border-slate-300 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Share Results'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}

export default GameOverModal;
