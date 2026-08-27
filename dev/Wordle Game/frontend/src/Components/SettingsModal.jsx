import React from 'react';
import { X, Settings, Volume2, Moon, Sun, Eye, ShieldAlert, Cpu } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSound } from '../context/SoundContext';

function SettingsModal({ 
  isOpen, 
  onClose, 
  hardMode, 
  setHardMode, 
  wordLength, 
  setWordLength, 
  onResetGame 
}) {
  const { theme, toggleTheme, highContrast, toggleHighContrast } = useTheme();
  const { soundEnabled, toggleSound } = useSound();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-10 light:bg-white light:border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between light:border-slate-100">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-lg text-white light:text-slate-900">
              Game Settings
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 light:hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Setting Items */}
        <div className="p-5 space-y-5">
          {/* Hard Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="pr-4">
              <div className="font-bold text-sm text-white light:text-slate-900 flex items-center gap-1.5">
                <span>Hard Mode</span>
                <ShieldAlert className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xs text-slate-400 light:text-slate-500">
                Any revealed hints must be used in subsequent guesses (+25 bonus pts).
              </div>
            </div>
            <button
              onClick={() => setHardMode(!hardMode)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                hardMode ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md transition-transform" />
            </button>
          </div>

          {/* High Contrast Colorblind Mode */}
          <div className="flex items-center justify-between">
            <div className="pr-4">
              <div className="font-bold text-sm text-white light:text-slate-900 flex items-center gap-1.5">
                <span>High Contrast Mode</span>
                <Eye className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-xs text-slate-400 light:text-slate-500">
                For improved color vision accessibility (Orange & Sky Blue tiles).
              </div>
            </div>
            <button
              onClick={toggleHighContrast}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                highContrast ? 'bg-sky-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md transition-transform" />
            </button>
          </div>

          {/* Sound Effects */}
          <div className="flex items-center justify-between">
            <div className="pr-4">
              <div className="font-bold text-sm text-white light:text-slate-900 flex items-center gap-1.5">
                <span>Sound Effects</span>
                <Volume2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xs text-slate-400 light:text-slate-500">
                Play synthesized click chimes, tile reveals, and fanfares.
              </div>
            </div>
            <button
              onClick={toggleSound}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                soundEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md transition-transform" />
            </button>
          </div>

          {/* Theme Selector */}
          <div className="flex items-center justify-between">
            <div className="pr-4">
              <div className="font-bold text-sm text-white light:text-slate-900">
                Visual Theme
              </div>
              <div className="text-xs text-slate-400 light:text-slate-500">
                Switch between Midnight Dark and Studio Light modes.
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 light:bg-slate-100 light:text-slate-800 flex items-center gap-1.5"
            >
              {theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
            </button>
          </div>

          {/* Word Length Selector */}
          <div className="pt-2 border-t border-slate-800 light:border-slate-100 space-y-2">
            <div className="font-bold text-sm text-white light:text-slate-900">
              Word Length
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[4, 5, 6].map((len) => (
                <button
                  key={len}
                  onClick={() => {
                    setWordLength(len);
                    onResetGame(len);
                  }}
                  className={`py-2 rounded-xl text-xs font-extrabold border transition ${
                    wordLength === len
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 light:bg-slate-100 light:text-slate-700 light:border-slate-300'
                  }`}
                >
                  {len} Letters
                </button>
              ))}
            </div>
          </div>

          {/* System Footer Info */}
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-[11px] text-slate-400 flex items-center justify-between light:bg-slate-50">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Wordle AI v2.0 Platform</span>
            </div>
            <span>Build 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
