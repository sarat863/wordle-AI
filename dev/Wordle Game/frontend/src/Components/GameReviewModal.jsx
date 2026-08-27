import React, { useState, useEffect } from 'react';
import { X, Sparkles, Award, TrendingDown, ArrowRight, Brain, CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';
import { analyzerApi } from '../services/api';

function GameReviewModal({ 
  isOpen, 
  onClose, 
  history = [], 
  secretWord = '', 
  sessionId = null 
}) {
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTurn, setSelectedTurn] = useState(1);

  useEffect(() => {
    if (isOpen && (secretWord || sessionId)) {
      fetchAnalysis();
    }
  }, [isOpen, secretWord, sessionId]);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const formattedHistory = history.map(h => ({
        guess: h.guess,
        result: h.result
      }));

      const res = await analyzerApi.reviewGame(formattedHistory, secretWord, sessionId);
      setReview(res);
      if (res.moves && res.moves.length > 0) {
        setSelectedTurn(1);
      }
    } catch (err) {
      console.warn('Could not generate game review from server:', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getQualityBadgeColor = (quality) => {
    switch (quality) {
      case 'Brilliant': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
      case 'Great': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'Good': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'Inaccuracy': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'Mistake': return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'Blunder': return 'bg-red-500/20 text-red-400 border-red-500/40';
      default: return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden z-10 light:bg-white light:border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between light:border-slate-100 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white light:text-slate-900 flex items-center gap-2">
                AI Move-by-Move Game Review
              </h3>
              <p className="text-xs text-slate-400 light:text-slate-500">
                Information Theory Accuracy & Move Quality Analysis
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {loading ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <Sparkles className="w-8 h-8 animate-spin mx-auto text-cyan-400" />
              <div className="text-sm font-semibold">Running Deep Information-Theory Simulation...</div>
            </div>
          ) : !review ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Complete a game first to unlock detailed AI Game Review!
            </div>
          ) : (
            <>
              {/* Overall Accuracy Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-tr from-slate-800 via-slate-850 to-slate-800 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 light:from-slate-100 light:to-slate-50 light:border-slate-200">
                <div className="text-center sm:text-left space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    Vocabulary Performance
                  </span>
                  <div className="text-2xl font-black text-white light:text-slate-900">
                    {review.performanceTier}
                  </div>
                  <div className="text-xs text-slate-400">
                    Secret Word was <strong className="text-emerald-400">{review.secretWord}</strong> in {review.turnsCount} turns
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-center p-3 rounded-xl bg-slate-900/90 border border-slate-700 light:bg-white light:border-slate-300">
                    <div className="text-3xl font-black text-cyan-400">{review.accuracyScore}%</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Accuracy</div>
                  </div>
                </div>
              </div>

              {/* Move Quality Summary Pills */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs font-bold">
                <div className="p-2 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-300">
                  <div className="text-base font-black">💎 {review.summary.brilliantMoves}</div>
                  <div className="text-[10px] text-cyan-400 uppercase">Brilliant</div>
                </div>
                <div className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300">
                  <div className="text-base font-black">🟢 {review.summary.greatMoves}</div>
                  <div className="text-[10px] text-emerald-400 uppercase">Great</div>
                </div>
                <div className="p-2 rounded-xl bg-blue-950/30 border border-blue-500/30 text-blue-300">
                  <div className="text-base font-black">🔵 {review.summary.goodMoves}</div>
                  <div className="text-[10px] text-blue-400 uppercase">Good</div>
                </div>
                <div className="p-2 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300">
                  <div className="text-base font-black">🟡 {review.summary.inaccuracies}</div>
                  <div className="text-[10px] text-amber-400 uppercase">Inaccuracy</div>
                </div>
                <div className="p-2 rounded-xl bg-orange-950/30 border border-orange-500/30 text-orange-300">
                  <div className="text-base font-black">🟠 {review.summary.mistakes}</div>
                  <div className="text-[10px] text-orange-400 uppercase">Mistake</div>
                </div>
                <div className="p-2 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300">
                  <div className="text-base font-black">🔴 {review.summary.blunders}</div>
                  <div className="text-[10px] text-red-400 uppercase">Blunder</div>
                </div>
              </div>

              {/* Turn-by-Turn Move Evaluation List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Move-by-Move Analysis
                </h4>

                {review.moves.map((move) => (
                  <div
                    key={move.turn}
                    className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 light:bg-slate-50 light:border-slate-200 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-300">
                          #{move.turn}
                        </span>
                        <span className="font-mono text-xl font-black tracking-wider text-white light:text-slate-900">
                          {move.guess}
                        </span>
                      </div>

                      <div className={`px-3 py-1 rounded-full border text-xs font-extrabold flex items-center gap-1.5 ${getQualityBadgeColor(move.quality)}`}>
                        <span>{move.badge}</span>
                        <span>{move.quality}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 light:text-slate-700 leading-relaxed">
                      {move.comment}
                    </p>

                    <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-slate-400">
                      <div>
                        Candidates: <strong className="text-slate-200 light:text-slate-800">{move.candidatesBefore} → {move.candidatesAfter}</strong>
                      </div>
                      <div>
                        Eliminated: <strong className="text-emerald-400">{move.eliminatedPct}%</strong>
                      </div>
                      <div>
                        Optimal: <strong className="text-cyan-400">{move.bestMove}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default GameReviewModal;
