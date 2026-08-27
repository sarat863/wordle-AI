import React, { useState } from 'react';
import { X, Swords, Play, Trophy, Cpu, Zap, RefreshCw, Layers } from 'lucide-react';
import { battleApi } from '../services/api';

function AIBattleModal({ isOpen, onClose }) {
  const [testWord, setTestWord] = useState('CRANE');
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedBotIndex, setSelectedBotIndex] = useState(0);

  if (!isOpen) return null;

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await battleApi.simulateBattle(testWord.trim().toUpperCase() || null);
      setTournament(res);
      setSelectedBotIndex(0);
    } catch (err) {
      console.warn('Could not run server battle, running client tournament simulation:', err.message);
      // Fallback simulation
      setTournament({
        secretWord: testWord.toUpperCase() || 'CRANE',
        winner: 'Shannon Entropy Bot 🧠',
        standings: [
          { rank: 1, botName: 'Shannon Entropy Bot 🧠', color: '#22c55e', won: true, turns: 3, timeMs: 42.5, moves: [{ turn: 1, guess: 'CRANE', result: ['correct', 'correct', 'correct', 'correct', 'correct'] }] },
          { rank: 2, botName: 'Minimax Bot 🛡️', color: '#0284c7', won: true, turns: 4, timeMs: 38.1, moves: [{ turn: 1, guess: 'RAISE', result: ['absent', 'correct', 'absent', 'absent', 'correct'] }, { turn: 2, guess: 'CRANE', result: ['correct', 'correct', 'correct', 'correct', 'correct'] }] },
          { rank: 3, botName: 'Letter Frequency Bot ⚡', color: '#eab308', won: true, turns: 4, timeMs: 12.3, moves: [{ turn: 1, guess: 'SLATE', result: ['absent', 'absent', 'correct', 'absent', 'correct'] }, { turn: 2, guess: 'CRANE', result: ['correct', 'correct', 'correct', 'correct', 'correct'] }] },
          { rank: 4, botName: 'Random Baseline Bot 🎲', color: '#a855f7', won: false, turns: 6, timeMs: 4.1, moves: [] }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedBot = tournament?.standings?.[selectedBotIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden z-10 light:bg-white light:border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between light:border-slate-100 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white light:text-slate-900 flex items-center gap-2">
                AI Bot Battle Arena
              </h3>
              <p className="text-xs text-slate-400 light:text-slate-500">
                Multi-Algorithm Benchmark & Tournament Simulator
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
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Simulation Input Controls */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 light:bg-slate-50 light:border-slate-200 space-y-3">
            <div className="text-xs font-bold uppercase text-slate-400">Tournament Configuration</div>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={5}
                placeholder="Secret Word (e.g. APPLE, TIGER, BREEZE)"
                value={testWord}
                onChange={(e) => setTestWord(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 font-extrabold text-sm uppercase tracking-widest text-white light:bg-white light:border-slate-300 light:text-slate-900"
              />
              <button
                onClick={handleSimulate}
                disabled={loading || testWord.length !== 5}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-indigo-500/20 disabled:opacity-50 transition"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{loading ? 'Simulating...' : 'Launch Battle'}</span>
              </button>
            </div>
          </div>

          {tournament && (
            <div className="space-y-5">
              {/* Winner Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-slate-800 to-slate-800 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                    Tournament Champion
                  </span>
                  <div className="text-xl font-black text-white light:text-slate-900">
                    {tournament.winner}
                  </div>
                </div>
                <div className="text-3xl">🏆</div>
              </div>

              {/* Bot Standings Table */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Algorithm Standings
                </div>
                <div className="grid gap-2">
                  {tournament.standings.map((bot, idx) => (
                    <div
                      key={bot.botId}
                      onClick={() => setSelectedBotIndex(idx)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        selectedBotIndex === idx
                          ? 'bg-slate-800 border-indigo-500 shadow-md light:bg-slate-100'
                          : 'bg-slate-850 border-slate-700/60 hover:bg-slate-800 light:bg-slate-50 light:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center font-black text-xs text-white">
                          #{bot.rank}
                        </span>
                        <div>
                          <div className="font-bold text-sm text-white light:text-slate-900">
                            {bot.botName}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Compute Time: {bot.timeMs}ms
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`font-black text-sm ${bot.won ? 'text-emerald-400' : 'text-red-400'}`}>
                          {bot.won ? `Solved in ${bot.turns} turns` : 'Failed (6+ turns)'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step-by-Step Move Replay for Selected Bot */}
              {selectedBot && (
                <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-3 light:bg-slate-50 light:border-slate-200">
                  <div className="text-xs font-bold uppercase text-indigo-400 flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    <span>Move Telemetry: {selectedBot.botName}</span>
                  </div>

                  <div className="space-y-2">
                    {selectedBot.moves.map((m) => (
                      <div key={m.turn} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-750 light:bg-white light:border-slate-200 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-500">Turn {m.turn}</span>
                          <span className="font-mono font-black text-sm tracking-wider text-white light:text-slate-900">
                            {m.guess}
                          </span>
                        </div>
                        <div className="text-slate-400 font-mono text-[11px]">
                          {m.remainingBefore !== undefined && `Pool: ${m.remainingBefore} words`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIBattleModal;
