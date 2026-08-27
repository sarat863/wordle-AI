import React, { useState } from 'react';
import { X, Link2, Copy, Check, Send, Sparkles } from 'lucide-react';
import { gameApi } from '../services/api';
import { LocalWordleEngine } from '../services/localEngine';

function CustomChallengeModal({ isOpen, onClose }) {
  const [word, setWord] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setError('');
    const cleanWord = word.trim().toUpperCase();

    if (![4, 5, 6].includes(cleanWord.length)) {
      setError('Word must be 4, 5, or 6 letters long.');
      return;
    }

    try {
      let token = '';
      try {
        const res = await gameApi.createCustomChallenge(cleanWord);
        token = res.token;
      } catch {
        // Fallback: client-side base64 encode
        token = btoa(cleanWord);
      }

      const url = `${window.location.origin}/game?mode=custom&token=${token}&length=${cleanWord.length}`;
      setGeneratedLink(url);
    } catch (err) {
      setError('Failed to generate challenge link.');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-10 light:bg-white light:border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between light:border-slate-100">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-lg text-white light:text-slate-900">
              Challenge a Friend
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 light:hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-400 light:text-slate-600 leading-relaxed">
            Pick a secret word (4, 5, or 6 letters) and generate an encrypted challenge link. Send it to a friend and see if they can solve it in 6 attempts!
          </p>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-400">Secret Word</label>
            <input
              type="text"
              maxLength={6}
              placeholder="e.g. CRANE, TIGER, BREEZE"
              value={word}
              onChange={(e) => setWord(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 font-extrabold text-lg tracking-widest text-center uppercase text-white focus:outline-none focus:border-emerald-500 light:bg-slate-50 light:border-slate-300 light:text-slate-900"
            />
          </div>

          {error && <div className="text-xs font-semibold text-red-400 text-center">{error}</div>}

          <button
            onClick={handleGenerate}
            disabled={word.length < 4}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-sm shadow-md shadow-emerald-500/20 disabled:opacity-50 transition"
          >
            Generate Challenge Link
          </button>

          {generatedLink && (
            <div className="p-4 rounded-xl bg-slate-800/90 border border-emerald-500/40 space-y-2 light:bg-emerald-50 light:border-emerald-200">
              <div className="text-xs font-bold text-emerald-400">Shareable Link Ready:</div>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={generatedLink}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300 light:bg-white light:border-slate-300 light:text-slate-800 select-all"
                />
                <button
                  onClick={handleCopy}
                  className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomChallengeModal;
