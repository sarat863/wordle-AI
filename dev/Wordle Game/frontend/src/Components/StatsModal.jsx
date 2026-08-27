import React from 'react';
import { X, Flame, Trophy, Award, BarChart3, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function StatsModal({ isOpen, onClose }) {
  const { user, isGuest, guestStats } = useAuth();

  if (!isOpen) return null;

  const stats = user?.stats || guestStats;
  const guessDist = stats?.guessDistribution || { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 };
  const maxGuessesCount = Math.max(...Object.values(guessDist), 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-10 light:bg-white light:border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between light:border-slate-100">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-lg text-white light:text-slate-900">
              Statistics & Records
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 light:hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-6">
          {/* Main Stat Grid */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 light:bg-slate-50 light:border-slate-200">
              <div className="text-2xl font-black text-white light:text-slate-900">{stats.gamesPlayed}</div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase mt-0.5">Played</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 light:bg-slate-50 light:border-slate-200">
              <div className="text-2xl font-black text-emerald-400">{stats.winRate}%</div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase mt-0.5">Win %</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 light:bg-slate-50 light:border-slate-200">
              <div className="text-2xl font-black text-amber-400 flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 fill-amber-400" />
                {stats.currentStreak}
              </div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase mt-0.5">Streak</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 light:bg-slate-50 light:border-slate-200">
              <div className="text-2xl font-black text-indigo-400 flex items-center justify-center gap-1">
                <Trophy className="w-4 h-4" />
                {stats.maxStreak}
              </div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase mt-0.5">Max</div>
            </div>
          </div>

          {/* Guess Distribution Histogram */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Guess Distribution
            </h4>
            <div className="space-y-1.5 font-mono text-xs font-bold">
              {[1, 2, 3, 4, 5, 6].map((num) => {
                const count = guessDist[String(num)] || 0;
                const percentage = Math.max((count / maxGuessesCount) * 100, 7);

                return (
                  <div key={num} className="flex items-center gap-2">
                    <span className="w-3 text-slate-400">{num}</span>
                    <div className="flex-1 bg-slate-800/60 rounded-md h-6 flex items-center overflow-hidden light:bg-slate-100">
                      <div
                        style={{ width: `${percentage}%` }}
                        className={`h-full flex items-center justify-end px-2 text-white font-bold transition-all duration-500 rounded-md ${
                          count > 0 ? 'bg-emerald-600 light:bg-emerald-500' : 'bg-slate-700 text-slate-400 light:bg-slate-300'
                        }`}
                      >
                        {count}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {isGuest && (
            <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs light:bg-indigo-50 light:text-indigo-900 light:border-indigo-200 text-center">
              💡 <strong>Playing as Guest:</strong> Create a free account or log in to sync your score and climb the global leaderboards!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StatsModal;
