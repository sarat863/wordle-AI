import React from 'react';
import { Delete, CornerDownLeft } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

function Keyboard({ letterStatuses = {}, onChar, onEnter, onDelete, disabled = false }) {
  const { highContrast } = useTheme();

  const getKeyStyle = (key) => {
    const status = letterStatuses[key];

    if (status === 'correct') {
      return highContrast 
        ? 'bg-orange-600 hover:bg-orange-500 text-white border-orange-700' 
        : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-700 light:bg-emerald-500 light:border-emerald-600';
    }
    if (status === 'present') {
      return highContrast 
        ? 'bg-sky-600 hover:bg-sky-500 text-white border-sky-700' 
        : 'bg-amber-500 hover:bg-amber-400 text-white border-amber-600 light:bg-amber-400 light:border-amber-500';
    }
    if (status === 'absent') {
      return 'bg-slate-800/90 text-slate-500 border-slate-800 light:bg-slate-300 light:text-slate-500 light:border-slate-300';
    }

    // Default neutral key
    return 'bg-slate-700/80 hover:bg-slate-600/90 text-slate-100 border-slate-700 light:bg-slate-200 light:hover:bg-slate-300 light:text-slate-800 light:border-slate-300';
  };

  const handleKeyClick = (key) => {
    if (disabled) return;
    if (key === 'ENTER') {
      onEnter();
    } else if (key === 'BACKSPACE') {
      onDelete();
    } else {
      onChar(key);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-1.5 sm:px-4 py-2 select-none">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1 sm:gap-1.5 my-1 sm:my-1.5">
          {row.map((key) => {
            const isSpecialKey = key === 'ENTER' || key === 'BACKSPACE';
            const keyClass = getKeyStyle(key);

            return (
              <button
                key={key}
                disabled={disabled}
                onClick={() => handleKeyClick(key)}
                className={`flex items-center justify-center font-bold rounded-lg shadow-sm border active:scale-95 transition-all text-xs sm:text-sm md:text-base ${
                  isSpecialKey 
                    ? 'px-2.5 sm:px-3.5 py-3.5 sm:py-4 flex-1 max-w-[68px] sm:max-w-[80px]' 
                    : 'w-8 sm:w-10 md:w-11 py-3.5 sm:py-4 flex-1'
                } ${keyClass} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {key === 'ENTER' ? (
                  <span className="font-extrabold flex items-center gap-0.5 text-[10px] sm:text-xs">
                    ENTER
                  </span>
                ) : key === 'BACKSPACE' ? (
                  <Delete className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  key
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default Keyboard;
