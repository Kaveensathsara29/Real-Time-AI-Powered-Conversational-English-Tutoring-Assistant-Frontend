import React, { useState } from 'react';
import { Mic, Volume2, Square, RotateCcw, Send, Radio, Keyboard, Trash2, Sparkles } from 'lucide-react';

export default function VoiceControls({
  isListening,
  isSpeaking,
  isThinking,
  autoListen,
  onToggleListen,
  onToggleAutoListen,
  onStopSpeaking,
  onReplayLast,
  onSendMessage,
  onClearChat,
  disabled,
  showTextInput: controlledShowTextInput,
  onToggleTextInput: controlledOnToggleTextInput
}) {
  const [localShowTextInput, setLocalShowTextInput] = useState(false);
  const showTextInput = controlledShowTextInput !== undefined ? controlledShowTextInput : localShowTextInput;
  const toggleTextInput = controlledOnToggleTextInput || (() => setLocalShowTextInput(!localShowTextInput));
  const [textDraft, setTextDraft] = useState('');

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!textDraft.trim()) return;
    onSendMessage(textDraft.trim());
    setTextDraft('');
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Optional text message drawer */}
      {showTextInput && (
        <form onSubmit={handleTextSubmit} className="w-full flex items-center gap-2 max-w-xl animate-fadeIn">
          <div className="relative flex-1">
            <input
              type="text"
              value={textDraft}
              onChange={(e) => setTextDraft(e.target.value)}
              placeholder="Type your English sentence or practice prompt here..."
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={!textDraft.trim() || disabled}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      )}

      {/* Primary Voice Action Bar */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
        {/* Toggle Hands-free vs Manual */}
        <button
          onClick={onToggleAutoListen}
          title="Toggle Auto Hands-Free Conversation Mode"
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
            autoListen
              ? 'bg-blue-950/60 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(0,210,255,0.2)]'
              : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className={`w-3.5 h-3.5 ${autoListen ? 'text-cyan-400 animate-pulse' : ''}`} />
          <span>{autoListen ? 'Hands-Free (Auto)' : 'Manual Tap'}</span>
        </button>

        {/* Central Master Microphone Button */}
        <div className="relative flex items-center justify-center">
          {/* Animated glow aura rings */}
          {isListening && (
            <div className="absolute -inset-3 rounded-full bg-cyan-500/30 blur-md animate-ping pointer-events-none" />
          )}
          {isSpeaking && (
            <div className="absolute -inset-3 rounded-full bg-rose-500/30 blur-md animate-ping pointer-events-none" />
          )}

          <button
            onClick={onToggleListen}
            disabled={disabled}
            className={`relative z-10 w-20 h-20 rounded-full flex flex-col items-center justify-center font-semibold text-white shadow-2xl transition-all duration-300 transform active:scale-95 ${
              isListening
                ? 'bg-gradient-to-tr from-blue-600 via-cyan-500 to-teal-400 shadow-[0_0_35px_rgba(0,210,255,0.7)] ring-4 ring-cyan-400/40'
                : isSpeaking
                ? 'bg-gradient-to-tr from-rose-700 via-red-600 to-pink-500 shadow-[0_0_35px_rgba(239,68,68,0.7)] ring-4 ring-rose-500/40'
                : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-rose-600 hover:from-blue-500 hover:to-rose-500 shadow-[0_0_25px_rgba(59,130,246,0.35)] ring-2 ring-slate-700'
            }`}
          >
            {isListening ? (
              <>
                <Mic className="w-8 h-8 text-white animate-bounce" />
                <span className="text-[10px] uppercase font-mono tracking-tighter mt-0.5">Listening</span>
              </>
            ) : isSpeaking ? (
              <>
                <Volume2 className="w-8 h-8 text-white animate-pulse" />
                <span className="text-[10px] uppercase font-mono tracking-tighter mt-0.5">AI Talking</span>
              </>
            ) : isThinking ? (
              <>
                <Sparkles className="w-8 h-8 text-rose-300 animate-pulse" />
                <span className="text-[10px] uppercase font-mono tracking-tighter mt-0.5">Thinking...</span>
              </>
            ) : (
              <>
                <Mic className="w-8 h-8 text-white" />
                <span className="text-[10px] uppercase font-mono tracking-tighter mt-0.5">Tap to Speak</span>
              </>
            )}
          </button>
        </div>

        {/* Secondary controls: Stop AI voice & Replay */}
        <div className="flex items-center gap-2">
          {isSpeaking ? (
            <button
              onClick={onStopSpeaking}
              title="Stop AI voice speaking"
              className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 transition-all flex items-center gap-1.5 text-xs font-mono shadow-lg shadow-rose-500/10"
            >
              <Square className="w-4 h-4 fill-rose-400" />
              <span>Interrupt</span>
            </button>
          ) : (
            <button
              onClick={onReplayLast}
              title="Replay tutor's last sentence"
              className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all flex items-center gap-1.5 text-xs font-mono"
            >
              <RotateCcw className="w-4 h-4 text-blue-400" />
              <span>Replay</span>
            </button>
          )}

          {/* Toggle manual keyboard input */}
          <button
            onClick={toggleTextInput}
            title="Toggle keyboard text input"
            className={`p-3 rounded-xl border transition-all ${
              showTextInput
                ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Clear chat history */}
          <button
            onClick={onClearChat}
            title="Clear conversation transcript"
            className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-900/40 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
