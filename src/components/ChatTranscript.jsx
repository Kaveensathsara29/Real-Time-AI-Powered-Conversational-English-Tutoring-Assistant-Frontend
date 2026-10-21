import React, { useEffect, useRef } from 'react';
import { Volume2, User, Bot, AlertCircle } from 'lucide-react';

export default function ChatTranscript({
  messages,
  onPlayMessage,
  onWordClick
}) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[350px] p-6 text-center text-slate-400">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-rose-500/20 border border-slate-700/60 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
          <Bot className="w-7 h-7 text-cyan-400" />
        </div>
        <h3 className="text-slate-200 font-semibold text-base mb-1">Live Audio Conversation</h3>
        <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-4">
          Tap the microphone or choose a starter phrase above. Your AI English speaking coach will listen, converse in real time, and coach your pronunciation.
        </p>
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Blue: Your Voice
          <span className="mx-1 text-slate-700">•</span>
          <span className="w-2 h-2 rounded-full bg-rose-500"></span> Red: AI Coach
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5 p-4 overflow-y-auto max-h-[420px] scrollbar-thin">
      {messages.map((msg, index) => {
        const isUser = msg.role === 'user';

        return (
          <div
            key={index}
            className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fadeIn`}
          >
            {/* Avatar Badge */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                isUser
                  ? 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-blue-500/20 ring-1 ring-cyan-400/40'
                  : 'bg-gradient-to-br from-rose-600 to-red-500 text-white shadow-rose-500/20 ring-1 ring-rose-400/40'
              }`}
            >
              {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble Content */}
            <div
              className={`max-w-[82%] sm:max-w-[75%] rounded-2xl p-3.5 backdrop-blur-md transition-all ${
                isUser
                  ? 'bg-gradient-to-br from-blue-950/40 to-slate-900/80 border border-blue-500/30 text-slate-100 rounded-tr-sm shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                  : 'bg-gradient-to-br from-rose-950/30 to-slate-900/80 border border-rose-500/30 text-slate-100 rounded-tl-sm shadow-[0_0_20px_rgba(239,68,68,0.1)]'
              }`}
            >
              {/* Header inside bubble */}
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <span
                  className={`text-[10px] font-mono uppercase tracking-wider font-semibold ${
                    isUser ? 'text-cyan-400' : 'text-rose-400'
                  }`}
                >
                  {isUser ? 'You' : 'AI English Coach'}
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {msg.timestamp || 'Just now'}
                  </span>

                  {/* Audio Replay Button for AI message */}
                  {!isUser && (
                    <button
                      onClick={() => onPlayMessage(msg.content, msg.audio_base64)}
                      title="Listen to natural speech pronunciation"
                      className="p-1 rounded hover:bg-rose-500/20 text-rose-300 transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Message text with clickable words for pronunciation */}
              <p className="text-sm leading-relaxed break-words font-sans text-slate-200">
                {msg.content.split(' ').map((word, wIdx) => {
                  const cleanWord = word.replace(/[^a-zA-Z]/g, '');
                  return (
                    <span
                      key={wIdx}
                      onClick={() => cleanWord && onWordClick(cleanWord)}
                      className="hover:text-cyan-300 hover:underline cursor-pointer transition-colors mr-1 inline-block"
                      title="Click word to practice pronunciation"
                    >
                      {word}
                    </span>
                  );
                })}
              </p>

              {/* Attached grammar feedback note if any */}
              {msg.grammar_feedback && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-start gap-2 text-xs text-rose-200 shadow-inner">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                  <div>
                    <span className="font-semibold text-rose-300 font-mono text-[10px] uppercase tracking-wider block mb-0.5">
                      Grammar & Fluency Correction:
                    </span>
                    <span className="leading-relaxed text-slate-200 text-xs">{msg.grammar_feedback}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
