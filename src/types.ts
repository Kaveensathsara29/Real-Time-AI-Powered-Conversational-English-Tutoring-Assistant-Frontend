export interface Scenario {
  id: string;
  title: string;
  role: string;
  cefr_level: string;
  difficulty: string;
  icon: string;
}

export interface Voice {
  id: string;
  name: string;
  accent: string;
  gender: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  grammar_feedback?: string;
  audio_base64?: string;
  timestamp?: string;
}

export interface VocabTip {
  word: string;
  better_alternatives: string[];
}

export interface FeedbackData {
  grammar_feedback?: string;
  native_alternative?: string;
  cefr_level?: string;
  fluency_score?: number;
  vocab_tips?: VocabTip[];
  pronunciation_focus_word?: string;
}

export interface AIResponsePayload {
  type?: string;
  reply?: string;
  grammar_feedback?: string;
  native_alternative?: string;
  cefr_level?: string;
  fluency_score?: number;
  vocab_tips?: VocabTip[];
  pronunciation_focus_word?: string;
  audio_base64?: string;
}
