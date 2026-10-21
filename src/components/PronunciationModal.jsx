import React, { useState } from 'react';
import { X, Volume2, Mic, Sparkles } from 'lucide-react';

export default function PronunciationModal({
  word,
  isOpen,
  onClose,
  onPlayAudio
}) {
  const [userSpoken, setUserSpoken] = useState(null);
  const [isPracticing, setIsPracticing] = useState(false);
  const [matchScore, setMatchScore] = useState(null);

  if (!isOpen || !word) return null;

  // Syllable division heuristics
  const clean = word.toLowerCase().trim();
  const syllables = clean.length > 5 
    ? clean.match(/.{1,3}/g)?.join(' · ') 
    : clean;

  const handleListenSlow = () => {
    onPlayAudio(word, 0.7);
  };

  const handleListenNormal = () => {
    onPlayAudio(word, 1.0);
  };

  const handlePracticeMic = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    setIsPracticing(true);
    setMatchScore(null);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      setUserSpoken(transcript);
      setIsPracticing(false);

      if (transcript.includes(clean) || clean.includes(transcript)) {
        setMatchScore(98);
      } else {
        setMatchScore(65);
      }
    };

    recognition.onerror = () => {
      setIsPracticing(false);
    };

    recognition.onend = () => {
      setIsPracticing(false);
    };

    recognition.start();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-slate-900 to-[#070d1d] border border-blue-500/30 p-6 shadow-2xl shadow-blue-500/10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono mb-3 uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Pronunciation & Accent Clinic</span>
        </div>

        {/* Word Display */}
        <div className="text-center py-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 mb-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-rose-500/10 pointer-events-none" />
          <h2 className="text-3xl font-extrabold text-white tracking-wide mb-1 font-sans capitalize">
            {word}
          </h2>
          <div className="text-sm text-cyan-400 font-mono tracking-widest font-semibold">
            [ {syllables} ]
          </div>
        </div>

        {/* Audio Listen Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={handleListenNormal}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 font-medium text-xs transition-all shadow-lg shadow-blue-500/10"
          >
            <Volume2 className="w-4 h-4 text-blue-400" />
            <span>Normal Speed (1.0x)</span>
          </button>
          <button
            onClick={handleListenSlow}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-medium text-xs transition-all shadow-lg shadow-rose-500/10"
          >
            <Volume2 className="w-4 h-4 text-rose-400" />
            <span>Slow Speech (0.7x)</span>
          </button>
        </div>

        {/* Interactive Speech Practice */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
          <h4 className="text-xs font-semibold text-slate-300 mb-2 font-mono uppercase tracking-wider">
            Test Your Pronunciation
          </h4>

          <button
            onClick={handlePracticeMic}
            disabled={isPracticing}
            className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
              isPracticing
                ? 'bg-cyan-500 text-slate-950 animate-pulse'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20'
            }`}
          >
            <Mic className={`w-4 h-4 ${isPracticing ? 'animate-bounce' : ''}`} />
            <span>{isPracticing ? 'Listening to your accent...' : 'Press & Say This Word'}</span>
          </button>

          {matchScore !== null && (
            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Heard: <strong className="text-slate-200">"{userSpoken}"</strong>
              </span>
              <span className={`font-mono font-bold px-2 py-0.5 rounded-full ${
                matchScore > 80
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {matchScore}% Match
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
