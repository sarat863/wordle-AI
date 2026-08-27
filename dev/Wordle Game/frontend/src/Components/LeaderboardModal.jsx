import React, { useState, useEffect } from 'react';
import { X, Trophy, Medal, Flame, RefreshCw } from 'lucide-react';
import { statsApi } from '../services/api';

function LeaderboardModal({ isOpen, onClose }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await statsApi.getGlobalLeaderboard(25);
      setLeaderboard(res.leaderboard || []);
    } catch (err) {
      console.warn('Could not fetch server leaderboard, using fallback data:', err.message);
      setLeaderboard([
        { rank: 1, username: 'entropy_bot', score: 950, winRate: 88.9, currentStreak: 8, gamesWon: 16 },
        { rank: 2, username: 'wordmaster', score: 850, winRate: 80.0, currentStreak: 5, gamesWon: 12 },
        { rank: 3, username: 'vocabqueen', score: 720, winRate: 83.3, currentStreak: 4, gamesWon: 10 },
        { rank: 4, username: 'puzzleking', score: 600, winRate: 80.0, currentStreak: 3, gamesWon: 8 },
        { rank: 5, username: 'lexicon_pro', score: 480, winRate: 75.0, currentStreak: 2, gamesWon: 6 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getRankBadge = (rank) => {
    if (rank === 1) return <span className="text-xl">🥇</span>;
    if (rank === 2) return <span className="text-xl">🥈</span>;
    if (rank === 3) return <span className="text-xl">🥉</span>;
    return <span className="font-bold text-xs text-slate-400">#{rank}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-10 light:bg-white light:border-slate-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between light:border-slate-100">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-lg text-white light:text-slate-900">
              Global Champions Leaderboard
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLeaderboard}
              disabled={loading}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 light:hover:bg-slate-100 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 light:hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-400 mb-2" />
              <span className="text-xs">Loading champion ranks...</span>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              No players recorded yet. Be the first to win and set a record!
            </div>
          ) : (
            leaderboard.map((player) => (
              <div
                key={player.rank}
                className={`p-3 rounded-xl flex items-center justify-between transition-all ${
                  player.rank <= 3
                    ? 'bg-slate-800/90 border border-amber-500/30 light:bg-amber-50/50 light:border-amber-200'
                    : 'bg-slate-800/50 border border-slate-700/50 light:bg-slate-50 light:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 flex items-center justify-center">
                    {getRankBadge(player.rank)}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white light:text-slate-900">
                      {player.username}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{player.gamesWon} wins</span>
                      <span>•</span>
                      <span>{player.winRate}% win rate</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-black text-base text-amber-400 light:text-amber-600">
                    {player.score.toLocaleString()} pts
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-end gap-1">
                    <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>{player.currentStreak} streak</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default LeaderboardModal;
