import React, { useState, useEffect } from 'react';
import { X, BookOpen, Volume2, Search, ExternalLink } from 'lucide-react';
import axios from 'axios';

function DictionaryModal({ isOpen, onClose, initialWord = '' }) {
  const [searchTerm, setSearchTerm] = useState(initialWord || 'CRANE');
  const [definitionData, setDefinitionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const wordToSearch = initialWord || searchTerm || 'CRANE';
      setSearchTerm(wordToSearch);
      lookupWord(wordToSearch);
    }
  }, [isOpen, initialWord]);

  const lookupWord = async (word) => {
    if (!word) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
      if (res.data && res.data[0]) {
        setDefinitionData(res.data[0]);
      }
    } catch (err) {
      setError(`No detailed dictionary definition found for '${word}'.`);
      setDefinitionData(null);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden z-10 light:bg-white light:border-slate-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between light:border-slate-100 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white light:text-slate-900 flex items-center gap-2">
                Vocabulary Dictionary
              </h3>
              <p className="text-xs text-slate-400 light:text-slate-500">
                Phonetics, Meanings & Etymology Inspector
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
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Search Box */}
          <div className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
              placeholder="Search word..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 font-extrabold text-sm uppercase text-white light:bg-slate-100 light:border-slate-300 light:text-slate-900 focus:outline-none focus:border-teal-500"
            />
            <button
              onClick={() => lookupWord(searchTerm)}
              disabled={loading || !searchTerm}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <Search className="w-4 h-4" />
              <span>Lookup</span>
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Looking up definitions and phonetics...
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 text-center text-xs text-slate-400">
              {error}
            </div>
          ) : definitionData ? (
            <div className="space-y-4">
              {/* Word Header */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
                <div className="text-2xl font-black uppercase tracking-wider text-teal-400">
                  {definitionData.word}
                </div>
                {definitionData.phonetic && (
                  <div className="font-mono text-xs text-slate-400">
                    {definitionData.phonetic}
                  </div>
                )}
              </div>

              {/* Meanings */}
              <div className="space-y-3">
                {definitionData.meanings?.map((m, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-2 light:bg-slate-50 light:border-slate-200">
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-400 font-bold text-[10px] uppercase">
                      {m.partOfSpeech}
                    </span>

                    <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-300 light:text-slate-700">
                      {m.definitions?.slice(0, 3).map((def, dIdx) => (
                        <li key={dIdx} className="leading-relaxed">
                          <span>{def.definition}</span>
                          {def.example && (
                            <p className="text-[11px] text-slate-400 italic mt-0.5 ml-4">
                              "{def.example}"
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default DictionaryModal;
