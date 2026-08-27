import React, { useState, useEffect } from 'react';
import { Sparkles, X, Brain, HelpCircle, Layers, Lightbulb, ArrowRight, RefreshCw, BarChart2 } from 'lucide-react';
import { solverApi } from '../services/api';
import { LocalWordleEngine } from '../services/localEngine';

function HintsDrawer({ 
  isOpen, 
  onClose, 
  history = [], 
  wordLength = 5, 
  sessionId = null, 
  onSelectWord 
}) {
  const [activeTab, setActiveTab] = useState('recommendations'); // 'recommendations' | 'clues' | 'sandbox'
  const [loading, setLoading] = useState(false);
  const [remainingCount, setRemainingCount] = useState(0);
  const [recommendations, setRecommendations] = useState([]);
  const [clues, setClues] = useState(null);
  const [sandboxInput, setSandboxInput] = useState('');
  const [sandboxAnalysis, setSandboxAnalysis] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchRecommendations();
      if (sessionId) {
        fetchClues();
      }
    }
  }, [isOpen, history.length, sessionId]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      // Format history
      const formattedHistory = history.map(h => ({
        guess: h.guess,
        result: h.result
      }));

      const res = await solverApi.getRecommendations(formattedHistory, wordLength, 6);
      setRemainingCount(res.remainingCount || 0);
      setRecommendations(res.recommendations || []);
    } catch (err) {
      console.warn('Backend solver offline, using local information gain engine:', err.message);
      const localRes = LocalWordleEngine.getTopRecommendations(history, wordLength, 6);
      setRemainingCount(localRes.remainingCount);
      setRecommendations(localRes.recommendations);
    } finally {
      setLoading(false);
    }
  };

  const fetchClues = async () => {
    if (!sessionId) return;
    try {
      const clue1 = await solverApi.getHints(sessionId, 1);
      const clue2 = await solverApi.getHints(sessionId, 2);
      setClues({ structural: clue1, letter: clue2 });
    } catch (err) {
      console.warn('Could not fetch server clues:', err.message);
    }
  };

  const analyzeSandboxWord = async () => {
    if (!sandboxInput || sandboxInput.length !== wordLength) return;
    try {
      const res = await solverApi.analyzeWord(sandboxInput.toUpperCase());
      setSandboxAnalysis(res);
    } catch (err) {
      const ent = LocalWordleEngine.calculateEntropy(sandboxInput.toUpperCase(), LocalWordleEngine.getWordList(wordLength));
      setSandboxAnalysis({
        guess: sandboxInput.toUpperCase(),
        entropyBits: ent,
        isValidWord: true
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col light:bg-white light:border-slate-200">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between light:border-slate-100 bg-slate-900/90 light:bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-lg text-white light:text-slate-900 flex items-center gap-2">
                  AI Solver & Hints
                </h2>
                <p className="text-xs text-slate-400 light:text-slate-500">
                  Shannon Entropy & Information Theory Engine
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 light:hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 px-4 pt-2 gap-2 light:border-slate-200">
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'recommendations'
                  ? 'border-emerald-500 text-emerald-400 light:text-emerald-600'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Optimal Moves
            </button>
            <button
              onClick={() => setActiveTab('clues')}
              className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'clues'
                  ? 'border-emerald-500 text-emerald-400 light:text-emerald-600'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              Smart Clues
            </button>
            <button
              onClick={() => setActiveTab('sandbox')}
              className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'sandbox'
                  ? 'border-emerald-500 text-emerald-400 light:text-emerald-600'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Word Analyzer
            </button>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {activeTab === 'recommendations' && (
              <div className="space-y-4">
                {/* Information Stat Card */}
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 light:bg-slate-100 light:border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Remaining Candidates
                      </div>
                      <div className="text-2xl font-black text-white light:text-slate-900 mt-0.5">
                        {loading ? 'Calculating...' : remainingCount.toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={fetchRecommendations}
                      disabled={loading}
                      title="Recalculate Entropy"
                      className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 light:bg-white light:text-slate-700 shadow-sm transition"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 light:text-slate-600 leading-relaxed">
                    Words below are ranked by <strong className="text-emerald-400 font-semibold">Expected Entropy (bits)</strong>. Higher entropy eliminates more possibilities on average.
                  </p>
                </div>

                {/* Recommendations List */}
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Top Recommended Guesses
                  </div>

                  {loading ? (
                    <div className="py-8 text-center text-slate-400 flex flex-col items-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                      <span className="text-xs">Computing Shannon Entropy matrices...</span>
                    </div>
                  ) : recommendations.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-sm">
                      No matching words found. Check for contradictory constraints!
                    </div>
                  ) : (
                    recommendations.map((rec, index) => (
                      <div
                        key={rec.word}
                        onClick={() => onSelectWord && onSelectWord(rec.word)}
                        className="p-3 rounded-xl bg-slate-800/90 hover:bg-slate-750 border border-slate-700/80 hover:border-emerald-500/50 cursor-pointer flex items-center justify-between transition-all group light:bg-slate-50 light:border-slate-200 light:hover:border-emerald-500"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-300 group-hover:bg-emerald-500 group-hover:text-white transition">
                            {index + 1}
                          </span>
                          <div>
                            <div className="font-extrabold text-base tracking-wider text-white light:text-slate-900 group-hover:text-emerald-400 transition">
                              {rec.word}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {rec.entropy !== undefined && `Entropy: ${rec.entropy} bits`}
                              {rec.winProbability > 0 && ` • Win Chance: ${(rec.winProbability * 100).toFixed(0)}%`}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                          <span>Use</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'clues' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs leading-relaxed light:bg-emerald-50 light:text-emerald-800 light:border-emerald-200">
                  <strong>💡 Progressive Clue System:</strong> Get strategic hints without spoiling the entire puzzle at once.
                </div>

                {clues?.structural ? (
                  <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 light:bg-slate-100 light:border-slate-200 space-y-2">
                    <div className="text-xs font-bold uppercase text-emerald-400">Level 1: Structural Insight</div>
                    <div className="text-sm font-semibold text-white light:text-slate-900">
                      {clues.structural.message}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 light:bg-slate-100 light:border-slate-200 space-y-2">
                    <div className="text-xs font-bold uppercase text-emerald-400">Structural Insight</div>
                    <div className="text-sm text-slate-300 light:text-slate-700">
                      Standard English 5-letter words typically begin with common consonants (C, S, T, B) and contain 1 to 2 vowels.
                    </div>
                  </div>
                )}

                {clues?.letter && (
                  <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 light:bg-slate-100 light:border-slate-200 space-y-2">
                    <div className="text-xs font-bold uppercase text-amber-400">Level 2: Character Clue</div>
                    <div className="text-sm font-semibold text-white light:text-slate-900">
                      {clues.letter.message}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sandbox' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 light:bg-slate-100 light:border-slate-200 space-y-3">
                  <div className="text-xs font-bold uppercase text-slate-400">Custom Word Entropy Calculator</div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={wordLength}
                      placeholder={`Enter any ${wordLength}-letter word`}
                      value={sandboxInput}
                      onChange={(e) => setSandboxInput(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 font-bold uppercase tracking-wider text-white text-sm light:bg-white light:border-slate-300 light:text-slate-900"
                    />
                    <button
                      onClick={analyzeSandboxWord}
                      disabled={sandboxInput.length !== wordLength}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs disabled:opacity-50 transition"
                    >
                      Analyze
                    </button>
                  </div>
                </div>

                {sandboxAnalysis && (
                  <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 light:bg-slate-100 light:border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xl text-white light:text-slate-900 tracking-wider">
                        {sandboxAnalysis.guess}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30">
                        {sandboxAnalysis.entropyBits} bits
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 space-y-1">
                      <div>Dictionary Status: {sandboxAnalysis.isValidWord ? '✅ Valid Guess' : '❌ Invalid Word'}</div>
                      <div>Expected Information: Gives approximately {sandboxAnalysis.entropyBits} bits of entropy toward identifying the secret word.</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/60 light:bg-slate-50 light:border-slate-200 text-center text-[11px] text-slate-500">
            Powered by 3Blue1Brown Shannon Information Theory Algorithm
          </div>
        </div>
      </div>
    </div>
  );
}

export default HintsDrawer;
