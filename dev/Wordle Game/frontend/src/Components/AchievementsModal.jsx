import React, { useState, useEffect } from 'react';
import { X, Award, Flame, Star, Shield, Lock, CheckCircle2 } from 'lucide-react';
import { achievementApi } from '../services/api';

function AchievementsModal({ isOpen, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAchievements();
    }
  }, [isOpen]);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const res = await achievementApi.getUserAchievements();
      setData(res);
    } catch (err) {
      console.warn('Could not fetch server achievements:', err.message);
      // Fallback
      setData({
        level: { level: 2, title: 'Apprentice Solver', currentXP: 140, nextLevelXP: 200, progressPct: 70 },
        unlockedCount: 2,
        totalCount: 8,
        achievements: [
          { id: 'FIRST_WIN', title: 'First Victory', description: 'Win your very first Wordle puzzle.', icon: '🏆', xp: 50, isUnlocked: true },
          { id: 'STREAK_3', title: 'On Fire', description: 'Maintain a 3-game winning streak.', icon: '🔥', xp: 100, isUnlocked: true },
          { id: 'STREAK_7', title: 'Unstoppable Flame', description: 'Reach a 7-day winning streak.', icon: '⚡', xp: 250, isUnlocked: false },
          { id: 'SNIPER', title: 'Word Sniper', description: 'Guess the secret word in 1 or 2 attempts.', icon: '🎯', xp: 200, isUnlocked: false },
          { id: 'DORDLE_CHAMP', title: 'Dordle Dualist', description: 'Conquer a 2-board simultaneous Dordle puzzle.', icon: '👥', xp: 175, isUnlocked: false },
          { id: 'QUORDLE_MASTER', title: 'Quordle Grandmaster', description: 'Solve all 4 boards in a Quordle match.', icon: '👑', xp: 350, isUnlocked: false },
          { id: 'PERFECTIONIST', title: 'Lexical Perfectionist', description: 'Achieve over 90% accuracy in AI Game Review.', icon: '💎', xp: 200, isUnlocked: false },
          { id: 'HARD_MODE_HERO', title: 'Hard Mode Veteran', description: 'Win a game with strict Hard Mode enabled.', icon: '🛡️', xp: 150, isUnlocked: false }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const levelInfo = data?.level || { level: 1, title: 'Novice Puzzler', currentXP: 50, nextLevelXP: 100, progressPct: 50 };
  const achievements = data?.achievements || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden z-10 light:bg-white light:border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between light:border-slate-100 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white light:text-slate-900 flex items-center gap-2">
                Level & Achievements
              </h3>
              <p className="text-xs text-slate-400 light:text-slate-500">
                XP Progression & Unlockable Badges
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 light:hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Level Progress Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-slate-850 to-slate-800 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Level {levelInfo.level}
                </div>
                <div className="text-xl font-black text-white light:text-slate-900">
                  {levelInfo.title}
                </div>
              </div>
              <div className="text-right font-mono text-xs text-slate-400">
                <strong className="text-amber-400 font-bold text-sm">{levelInfo.currentXP}</strong> / {levelInfo.nextLevelXP} XP
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-950/80 rounded-full h-3.5 p-0.5 overflow-hidden border border-slate-700">
              <div
                style={{ width: `${levelInfo.progressPct}%` }}
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500 shadow-sm shadow-amber-500/50"
              />
            </div>
            <div className="text-[11px] text-slate-400 flex justify-between">
              <span>{levelInfo.progressPct}% to Level {levelInfo.level + 1}</span>
              <span>+{50} XP per game won</span>
            </div>
          </div>

          {/* Badges Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>Achievements Showcase</span>
              <span>{data?.unlockedCount || 0} / {data?.totalCount || achievements.length} Unlocked</span>
            </div>

            <div className="grid gap-2.5">
              {achievements.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                    badge.isUnlocked
                      ? 'bg-slate-800/90 border-amber-500/40 shadow-sm light:bg-amber-50/50 light:border-amber-200'
                      : 'bg-slate-850/60 border-slate-800 opacity-60 light:bg-slate-50 light:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="text-2xl w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700/60">
                      {badge.icon}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white light:text-slate-900 flex items-center gap-1.5">
                        <span>{badge.title}</span>
                        {badge.isUnlocked && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <div className="text-xs text-slate-400 light:text-slate-600 mt-0.5">
                        {badge.description}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs">
                      +{badge.xp} XP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AchievementsModal;
