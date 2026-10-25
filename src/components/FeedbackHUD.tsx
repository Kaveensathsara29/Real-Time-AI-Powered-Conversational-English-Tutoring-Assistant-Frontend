import { AlertCircle, CheckCircle2, Sparkles, Award, TrendingUp, BookOpen, Volume2 } from 'lucide-react';
import { FeedbackData } from '../types';

interface FeedbackHUDProps {
  currentFeedback: FeedbackData | null;
  onPracticePhrase: (phrase: string) => void;
  onOpenPronunciation: (word: string) => void;
}

export default function FeedbackHUD({
  currentFeedback,
  onPracticePhrase,
  onOpenPronunciation
}: FeedbackHUDProps) {
  if (!currentFeedback) {
    return (
      <div className="rounded-2xl p-5 bg-slate-900/40 border border-slate-800/80 backdrop-blur-md flex flex-col items-center justify-center text-center h-full min-h-[260px]">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <h4 className="text-slate-200 font-semibold text-sm mb-1">Live Fluency & Grammar HUD</h4>
        <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
          Speak to your AI tutor. Real-time grammar corrections, CEFR scores, and native alternatives will appear here instantly.
        </p>
      </div>
    );
  }

  const {
    grammar_feedback,
    native_alternative,
    cefr_level = 'B1 (Intermediate)',
    fluency_score = 85,
    vocab_tips = [],
    pronunciation_focus_word
  } = currentFeedback;

  return (
    <div className="flex flex-col gap-3.5 h-full">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 gap-3">
        {/* CEFR Level Badge */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-blue-500/30 backdrop-blur-md relative overflow-hidden group hover:border-blue-500/60 transition-all">
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-blue-500/10 rounded-full blur-lg" />
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-blue-400" />
              CEFR Level
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-blue-500/20 text-blue-300 border border-blue-500/40">
              {cefr_level.split(' ')[0]}
            </span>
          </div>
          <div className="text-sm font-bold text-slate-100 font-mono tracking-tight truncate">
            {cefr_level}
          </div>
        </div>

        {/* Fluency Score */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-rose-500/30 backdrop-blur-md relative overflow-hidden group hover:border-rose-500/60 transition-all">
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-rose-500/10 rounded-full blur-lg" />
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
              Fluency Score
            </span>
            <span className="text-xs font-bold font-mono text-rose-400">
              {fluency_score}%
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-rose-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(10, fluency_score))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grammar Correction Box */}
      {grammar_feedback ? (
        <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/40 text-rose-200 text-xs shadow-lg shadow-rose-950/20 backdrop-blur-md animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-rose-300 block mb-1 font-mono uppercase tracking-wide text-[10px]">
                Grammar Correction
              </span>
              <p className="text-slate-200 leading-relaxed font-sans">
                {grammar_feedback}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Great grammatical accuracy in your last utterance!</span>
        </div>
      )}

      {/* Native Speaker Alternative */}
      {native_alternative && (
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-950/30 to-indigo-950/30 border border-blue-500/40 backdrop-blur-md flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              How A Native Speaker Says It
            </span>
            <button
              onClick={() => onPracticePhrase(native_alternative)}
              className="px-2 py-0.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/40 text-blue-300 text-[10px] font-mono transition-all flex items-center gap-1"
            >
              <Volume2 className="w-3 h-3" />
              Practice
            </button>
          </div>
          <p className="text-slate-100 text-xs italic font-medium leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            "{native_alternative}"
          </p>
        </div>
      )}

      {/* Vocabulary Boosters */}
      {vocab_tips && vocab_tips.length > 0 && (
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
            <BookOpen className="w-3.5 h-3.5 text-rose-400" />
            Vocabulary Upgrades
          </span>
          <div className="flex flex-wrap gap-1.5">
            {vocab_tips.map((tip, i) => (
              <div key={i} className="flex items-center gap-1 text-[11px] bg-slate-800/80 px-2 py-1 rounded-md border border-slate-700/60">
                <span className="text-rose-300 line-through opacity-75">{tip.word}</span>
                <span className="text-slate-400">→</span>
                <span className="text-emerald-400 font-medium">{tip.better_alternatives.slice(0, 2).join(', ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pronunciation Focus Word */}
      {pronunciation_focus_word && (
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">Accent Focus:</span>
            <span className="font-bold text-cyan-300 font-mono">{pronunciation_focus_word}</span>
          </div>
          <button
            onClick={() => onOpenPronunciation(pronunciation_focus_word)}
            className="text-[10px] text-blue-400 hover:text-blue-300 font-mono underline"
          >
            Phonetic Breakdown →
          </button>
        </div>
      )}
    </div>
  );
}
