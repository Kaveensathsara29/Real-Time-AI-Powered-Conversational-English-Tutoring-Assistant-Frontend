import React, { useState } from 'react';
import { X, Sliders, Volume2, Key, Globe, ExternalLink, Eye, EyeOff } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  voices,
  selectedVoice,
  onChangeVoice,
  speechRate,
  onChangeSpeechRate,
  apiKey,
  onChangeApiKey,
  provider,
  onChangeProvider
}) {
  const [showKey, setShowKey] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 to-[#0a1020] border border-blue-500/30 p-6 shadow-2xl shadow-blue-500/10 max-h-[90vh] overflow-y-auto scrollbar-thin">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 text-rose-400 text-xs font-mono mb-4 uppercase tracking-wider">
          <Sliders className="w-4 h-4" />
          <span>Application Settings</span>
        </div>

        <div className="flex flex-col gap-5">
          {/* AI Voice Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-blue-400" />
              AI Voice & English Accent
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => onChangeVoice(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            >
              {voices.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.accent})
                </option>
              ))}
            </select>
          </div>

          {/* Speech Rate Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-cyan-400" />
                Speech Speed Rate
              </label>
              <span className="text-xs font-mono text-cyan-400 font-bold">
                {speechRate}x
              </span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.3"
              step="0.05"
              value={speechRate}
              onChange={(e) => onChangeSpeechRate(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.7x (Slow / Learners)</span>
              <span>1.0x (Natural)</span>
              <span>1.3x (Fast / Native)</span>
            </div>
          </div>

          {/* AI Engine Model / API Key (GEMINI ONLY) */}
          <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-rose-400" />
                AI Intelligence Engine
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onChangeProvider('builtin')}
                className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                  provider === 'builtin'
                    ? 'bg-blue-950/60 border-blue-500 text-blue-300 shadow-md shadow-blue-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400'
                }`}
              >
                Built-in Tutor
              </button>
            </div>

            {provider === 'gemini' && (
              <div className="mt-2 space-y-2 animate-fadeIn">
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => onChangeApiKey(e.target.value)}
                    placeholder="Enter your Google Gemini API key (AIza...)"
                    className="w-full bg-slate-950/80 border border-rose-500/40 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Exclusively uses Google Gemini (OpenAI keys not supported).</span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                  >
                    Get Free Key <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Done Button */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-blue-500/20 transition-all"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
