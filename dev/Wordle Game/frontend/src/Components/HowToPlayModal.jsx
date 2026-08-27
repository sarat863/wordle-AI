import React from 'react';
import { X, HelpCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

function HowToPlayModal({ isOpen, onClose }) {
  const { highContrast } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-10 light:bg-white light:border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between light:border-slate-100">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-lg text-white light:text-slate-900">
              How to Play Wordle AI
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 light:hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300 light:text-slate-700">
          <p>
            Guess the secret word in <strong>6 attempts</strong>. Each guess must be a valid word. Hit the <strong>Enter</strong> button to submit.
          </p>

          <p>
            After each guess, the color of the tiles will change to show how close your guess was to the word:
          </p>

          {/* Examples */}
          <div className="space-y-3 py-2">
            {/* Green Example */}
            <div className="space-y-1.5">
              <div className="flex gap-1.5 font-black text-lg">
                <div className={`w-9 h-9 flex items-center justify-center rounded-lg text-white ${highContrast ? 'bg-orange-600' : 'bg-emerald-600'}`}>W</div>
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-white light:bg-slate-100 light:text-slate-900">E</div>
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-white light:bg-slate-100 light:text-slate-900">A</div>
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-white light:bg-slate-100 light:text-slate-900">R</div>
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-white light:bg-slate-100 light:text-slate-900">Y</div>
              </div>
              <p className="text-xs text-slate-400">
                <strong className={highContrast ? 'text-orange-400' : 'text-emerald-400'}>W</strong> is in the word and in the <strong>correct position</strong>.
              </p>
            </div>

            {/* Yellow Example */}
            <div className="space-y-1.5">
              <div className="flex gap-1.5 font-black text-lg">
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-white light:bg-slate-100 light:text-slate-900">P</div>
                <div className={`w-9 h-9 flex items-center justify-center rounded-lg text-white ${highContrast ? 'bg-sky-600' : 'bg-amber-500'}`}>I</div>
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-white light:bg-slate-100 light:text-slate-900">L</div>
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-white light:bg-slate-100 light:text-slate-900">L</div>
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-white light:bg-slate-100 light:text-slate-900">S</div>
              </div>
              <p className="text-xs text-slate-400">
                <strong className={highContrast ? 'text-sky-400' : 'text-amber-400'}>I</strong> is in the word but in the <strong>wrong spot</strong>.
              </p>
            </div>

            {/* Gray Example */}
            <div className="space-y-1.5">
              <div className="flex gap-1.5 font-black text-lg">
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-white light:bg-slate-100 light:text-slate-900">V</div>
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-white light:bg-slate-100 light:text-slate-900">A</div>
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-white light:bg-slate-100 light:text-slate-900">G</div>
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-700 text-slate-400">U</div>
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-white light:bg-slate-100 light:text-slate-900">E</div>
              </div>
              <p className="text-xs text-slate-400">
                <strong className="text-slate-400">U</strong> is not in the word in any spot.
              </p>
            </div>
          </div>

          {/* AI Feature highlight */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/50 to-teal-950/50 border border-emerald-500/30 space-y-1.5 light:from-emerald-50 light:to-teal-50 light:border-emerald-200">
            <div className="font-bold text-xs flex items-center gap-1.5 text-emerald-400 light:text-emerald-700">
              <Sparkles className="w-4 h-4" />
              <span>Smart AI Entropy Solver</span>
            </div>
            <p className="text-xs text-slate-300 light:text-slate-700">
              Stuck on a tricky board? Open the <strong>AI Solver</strong> drawer at any time. It uses Shannon Information Theory to calculate the mathematically best moves to narrow down possibilities!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HowToPlayModal;
