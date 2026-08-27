import React from 'react';
import { useTheme } from '../context/ThemeContext';

function Board({ 
  guesses, 
  currentGuessIndex, 
  currentInput, 
  results, 
  wordLength = 5, 
  maxAttempts = 6, 
  isShaking = false,
  gameWon = false
}) {
  const { highContrast } = useTheme();

  // Helper for tile background and border styling based on status
  const getTileClasses = (status, rowIndex, colIndex, isSubmitted, isWinningRow) => {
    if (!isSubmitted) {
      const char = (rowIndex === currentGuessIndex) ? (currentInput[colIndex] || '') : (guesses[rowIndex]?.[colIndex] || '');
      if (char) {
        return 'border-slate-400 bg-slate-800/60 text-white light:border-slate-600 light:bg-slate-100 light:text-slate-900 tile-pop scale-105';
      }
      return 'border-slate-700/70 bg-slate-900/40 text-white light:border-slate-300 light:bg-white light:text-slate-900';
    }

    // Submitted tiles
    let base = 'tile-flip text-white font-extrabold shadow-md ';
    if (isWinningRow) {
      base += `win-bounce-${colIndex} `;
    }

    if (status === 'correct') {
      return base + (highContrast 
        ? 'bg-orange-600 border-orange-600' 
        : 'bg-emerald-600 border-emerald-600 light:bg-emerald-500');
    }
    if (status === 'present') {
      return base + (highContrast 
        ? 'bg-sky-600 border-sky-600' 
        : 'bg-amber-500 border-amber-500 light:bg-amber-400');
    }
    if (status === 'absent') {
      return base + 'bg-slate-700 border-slate-700 light:bg-slate-400 light:border-slate-400';
    }

    return base + 'border-slate-700 bg-slate-900 text-white';
  };

  const rows = Array.from({ length: maxAttempts }, (_, i) => i);
  const cols = Array.from({ length: wordLength }, (_, i) => i);

  return (
    <div className="flex flex-col items-center justify-center my-auto py-2">
      <div className="grid gap-1.5 sm:gap-2.5">
        {rows.map((rowIndex) => {
          const isCurrentRow = rowIndex === currentGuessIndex;
          const isSubmitted = rowIndex < currentGuessIndex;
          const rowResult = results[rowIndex] || [];
          const isWinningRow = gameWon && rowIndex === currentGuessIndex - 1;
          const rowShaking = isCurrentRow && isShaking;

          return (
            <div 
              key={rowIndex} 
              className={`flex gap-1.5 sm:gap-2.5 ${rowShaking ? 'row-shake' : ''}`}
            >
              {cols.map((colIndex) => {
                let char = '';
                if (isCurrentRow) {
                  char = currentInput[colIndex] || '';
                } else if (isSubmitted) {
                  char = guesses[rowIndex]?.[colIndex] || '';
                }

                const status = rowResult[colIndex];
                const animDelay = isSubmitted ? `${colIndex * 0.15}s` : '0s';

                return (
                  <div
                    key={colIndex}
                    style={{ animationDelay: animDelay }}
                    className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center font-black text-xl sm:text-2xl md:text-3xl rounded-xl border-2 uppercase select-none transition-all duration-200 ${getTileClasses(
                      status,
                      rowIndex,
                      colIndex,
                      isSubmitted,
                      isWinningRow
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
}

export default Board;
