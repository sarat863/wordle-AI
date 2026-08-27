import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { CheckCircle2, Lock } from 'lucide-react';

function MultiGridBoard({
  boards = [],
  currentAttempt = 0,
  currentInput = '',
  maxAttempts = 7,
  isShaking = false
}) {
  const { highContrast } = useTheme();

  const getTileClasses = (status, isSubmitted, char) => {
    if (!isSubmitted) {
      if (char) {
        return 'border-slate-400 bg-slate-800 text-white tile-pop light:border-slate-500 light:bg-slate-100 light:text-slate-900';
      }
      return 'border-slate-700/60 bg-slate-900/40 text-white light:border-slate-300 light:bg-white light:text-slate-900';
    }

    if (status === 'correct') {
      return highContrast ? 'bg-orange-600 border-orange-600 text-white' : 'bg-emerald-600 border-emerald-600 text-white';
    }
    if (status === 'present') {
      return highContrast ? 'bg-sky-600 border-sky-600 text-white' : 'bg-amber-500 border-amber-500 text-white';
    }
    if (status === 'absent') {
      return 'bg-slate-700 border-slate-700 text-white light:bg-slate-400 light:border-slate-400';
    }

    return 'border-slate-700 bg-slate-900 text-white';
  };

  const rows = Array.from({ length: maxAttempts }, (_, i) => i);
  const isQuordle = boards.length === 4;

  return (
    <div className={`w-full max-w-4xl mx-auto grid gap-3 sm:gap-4 p-2 ${isQuordle ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
      {boards.map((board, bIdx) => {
        const isSolved = board.status === 'won';

        return (
          <div
            key={bIdx}
            className={`p-3 rounded-2xl bg-slate-900/90 border transition-all duration-300 relative ${
              isSolved 
                ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10' 
                : 'border-slate-800 shadow-md light:bg-white light:border-slate-200'
            }`}
          >
            {/* Sub-board Header */}
            <div className="flex items-center justify-between mb-2 text-xs font-bold px-1">
              <span className="text-slate-400">Board {bIdx + 1}</span>
              {isSolved ? (
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Solved in {board.wonAtGuess}</span>
                </span>
              ) : (
                <span className="text-slate-500 font-mono">Attempt {currentAttempt + 1}/{maxAttempts}</span>
              )}
            </div>

            {/* Grid */}
            <div className="grid gap-1 sm:gap-1.5">
              {rows.map((rIdx) => {
                const isCurrent = rIdx === currentAttempt && !isSolved;
                const isSubmitted = rIdx < board.guesses.length;
                const rowResult = board.results[rIdx] || [];
                const rowShake = isCurrent && isShaking;

                return (
                  <div key={rIdx} className={`flex justify-center gap-1 sm:gap-1.5 ${rowShake ? 'row-shake' : ''}`}>
                    {Array.from({ length: 5 }).map((_, cIdx) => {
                      let char = '';
                      if (isCurrent) {
                        char = currentInput[cIdx] || '';
                      } else if (isSubmitted) {
                        char = board.guesses[rIdx]?.[cIdx] || '';
                      }

                      const status = rowResult[cIdx];

                      return (
                        <div
                          key={cIdx}
                          className={`w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center font-extrabold text-xs sm:text-sm md:text-base rounded-lg border-2 uppercase select-none transition-all ${getTileClasses(
                            status,
                            isSubmitted,
                            char
                          )}`}
                        >
                          {char}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MultiGridBoard;
