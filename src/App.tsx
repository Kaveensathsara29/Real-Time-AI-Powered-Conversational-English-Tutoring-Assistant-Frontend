import { useState, useEffect, useRef } from 'react';
import { Sparkles, Settings, Flame, MessageSquare, Headphones, Award, AlertTriangle } from 'lucide-react';
import AudioVisualizer from './components/AudioVisualizer';
import VoiceControls from './components/VoiceControls';
import FeedbackHUD from './components/FeedbackHUD';
import ScenarioSelector from './components/ScenarioSelector';
import ChatTranscript from './components/ChatTranscript';
import PronunciationModal from './components/PronunciationModal';
import SettingsModal from './components/SettingsModal';
import { Scenario, Voice, ChatMessage, FeedbackData, AIResponsePayload } from './types';

const DEFAULT_SCENARIOS: Scenario[] = [
  {
    id: 'casual',
    title: 'Casual Coffee Chat',
    role: 'Friendly Native Friend (Alex)',
    cefr_level: 'A2 - B1',
    difficulty: 'Easy',
    icon: 'Coffee',
  },
  {
    id: 'job_interview',
    title: 'Tech Job Interview',
    role: 'Senior Hiring Manager (Eleanor)',
    cefr_level: 'B2 - C1',
    difficulty: 'Advanced',
    icon: 'Briefcase',
  },
  {
    id: 'ielts_speaking',
    title: 'IELTS Speaking Examiner',
    role: 'Certified IELTS Examiner (Dr. Arthur)',
    cefr_level: 'B1 - C2',
    difficulty: 'Challenging',
    icon: 'GraduationCap',
  },
  {
    id: 'restaurant',
    title: 'Gourmet Restaurant',
    role: 'Head Waiter (Marco)',
    cefr_level: 'A1 - B1',
    difficulty: 'Beginner',
    icon: 'Utensils',
  },
  {
    id: 'debate',
    title: 'Philosophy & Debate Club',
    role: 'Oxford Moderator (Julian)',
    cefr_level: 'B2 - C2',
    difficulty: 'Master',
    icon: 'Flame',
  },
  {
    id: 'travel_airport',
    title: 'Airport Customs',
    role: 'Immigration Officer (Officer Davis)',
    cefr_level: 'A2 - B2',
    difficulty: 'Practical',
    icon: 'Plane',
  }
];

const DEFAULT_VOICES: Voice[] = [
  { id: 'en-US-JennyNeural', name: 'Jenny', accent: 'American', gender: 'Female' },
  { id: 'en-US-GuyNeural', name: 'Guy', accent: 'American', gender: 'Male' },
  { id: 'en-GB-SoniaNeural', name: 'Sonia', accent: 'British', gender: 'Female' },
  { id: 'en-GB-RyanNeural', name: 'Ryan', accent: 'British', gender: 'Male' },
  { id: 'en-AU-NatashaNeural', name: 'Natasha', accent: 'Australian', gender: 'Female' },
  { id: 'en-CA-ClaraNeural', name: 'Clara', accent: 'Canadian', gender: 'Female' }
];

export default function App() {
  // State variables
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>(DEFAULT_SCENARIOS);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('casual');
  const [voices, setVoices] = useState<Voice[]>(DEFAULT_VOICES);
  const [selectedVoice, setSelectedVoice] = useState<string>('en-US-JennyNeural');
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [provider, setProvider] = useState<string>(() => {
    return localStorage.getItem('ai_provider') || 'builtin';
  });
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });

  const handleUpdateApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
    if (key.trim()) {
      setProvider('gemini');
      localStorage.setItem('ai_provider', 'gemini');
    }
  };

  const handleUpdateProvider = (newProvider: string) => {
    setProvider(newProvider);
    localStorage.setItem('ai_provider', newProvider);
  };
  
  // Voice states
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [autoListen, setAutoListen] = useState<boolean>(false);
  const [currentFeedback, setCurrentFeedback] = useState<FeedbackData | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  // Modals & UI helpers
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [pronunciationWord, setPronunciationWord] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [showTextInput, setShowTextInput] = useState<boolean>(false);

  // Audio Context & WebSocket refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Mutable callback refs to ensure WebSocket and SpeechRecognition handlers always call latest state
  const handleReceiveAIResponseRef = useRef<(data: AIResponsePayload) => void>(() => {});
  const handleUserSpeechFinalRef = useRef<(text: string) => void>(() => {});

  // Fetch scenarios and voices from backend on load
  useEffect(() => {
    fetch('/api/scenarios')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setScenarios(data);
      })
      .catch(() => {});

    fetch('/api/voices')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setVoices(data);
      })
      .catch(() => {});
  }, []);

  // Setup WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/conversation`;
    
    let socket: WebSocket | null = null;
    let isMounted = true;
    try {
      socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        if (isMounted) {
          console.log('Voice WebSocket connected');
        }
      };

      socket.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const data: AIResponsePayload = JSON.parse(event.data);
          if (data.type === 'ai_thinking') {
            setIsThinking(true);
          } else if (data.type === 'ai_response') {
            setIsThinking(false);
            handleReceiveAIResponseRef.current(data);
          }
        } catch (e) {
          console.error('WS parse error:', e);
        }
      };

      socket.onerror = (e) => {
        if (isMounted && socket && socket.readyState === WebSocket.OPEN) {
          console.warn('WS error, fallback to REST:', e);
        }
      };
    } catch (e) {
      console.warn('WebSocket init exception:', e);
    }

    return () => {
      isMounted = false;
      if (socket) {
        if (socket.readyState === WebSocket.OPEN) {
          socket.close(1000, 'Component unmounted');
        } else if (socket.readyState === WebSocket.CONNECTING) {
          socket.onopen = () => {
            try { socket?.close(1000, 'Unmounted while connecting'); } catch {}
          };
        }
      }
    };
  }, []);

  // Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript.trim()) {
        handleUserSpeechFinalRef.current(transcript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition notice:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setMicError('Microphone access was denied or no input device exists. You can type your sentence in the box below.');
        setShowTextInput(true);
      } else if (event.error === 'audio-capture') {
        setMicError('No microphone detected on your system. Please connect a microphone or use keyboard text input.');
        setShowTextInput(true);
      } else if (event.error === 'network') {
        setMicError('Speech recognition network timeout. Please check your internet or type your message below.');
      } else if (event.error !== 'no-speech') {
        setMicError(`Voice recognition: ${event.error}. Feel free to use the text input below.`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  // Initialize Web Audio API Analyser for Live Mic Frequency Waveform
  const initAudioAnalyser = async (): Promise<boolean> => {
    if (analyserRef.current) return true;
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not supported');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      setAnalyserNode(analyser);
      setMicError(null);
      return true;
    } catch (err: any) {
      console.warn('Microphone stream access notice:', err);
      if (err.name === 'NotFoundError' || err.message?.includes('Requested device not found')) {
        setMicError('No microphone hardware detected on your device. Please plug in a microphone or type your sentence below.');
        setShowTextInput(true);
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicError('Microphone permission blocked by browser. Please allow microphone in your browser URL bar, or type below.');
        setShowTextInput(true);
      }
      return false;
    }
  };

  // Toggle listening
  const handleToggleListen = async () => {
    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      setIsListening(false);
    } else {
      // Clear previous error on retry
      setMicError(null);
      handleStopSpeaking();
      await initAudioAnalyser();
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        try { await audioContextRef.current.resume(); } catch {}
      }
      try {
        if (recognitionRef.current) {
          recognitionRef.current.start();
          setIsListening(true);
        } else {
          setMicError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or type your message below.');
          setShowTextInput(true);
        }
      } catch (err: any) {
        console.warn('Speech recognition start notice:', err);
        setIsListening(false);
        if (err.name !== 'InvalidStateError') {
          setMicError('Could not start microphone. You can type your sentence below.');
          setShowTextInput(true);
        }
      }
    }
  };

  // Play audio from base64 or Edge-TTS or fallback to SpeechSynthesis
  const playSpeechAudio = (text: string, audioBase64: string | null = null, customRate: number | null = null) => {
    handleStopSpeaking();
    setIsSpeaking(true);

    if (audioBase64) {
      const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
      currentAudioRef.current = audio;
      if (customRate) audio.playbackRate = customRate;
      
      audio.onended = () => {
        setIsSpeaking(false);
        if (autoListen) {
          setTimeout(() => handleToggleListen(), 400);
        }
      };

      audio.onerror = () => {
        fallbackSpeechSynthesis(text, customRate);
      };

      audio.play().catch(() => fallbackSpeechSynthesis(text, customRate));
    } else {
      fallbackSpeechSynthesis(text, customRate);
    }
  };

  // Fallback to client SpeechSynthesis
  const fallbackSpeechSynthesis = (text: string, customRate: number | null = null) => {
    if (!window.speechSynthesis) {
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = customRate || speechRate || 1.0;
    
    utterance.onend = () => {
      setIsSpeaking(false);
      if (autoListen) {
        setTimeout(() => handleToggleListen(), 400);
      }
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Stop speaking
  const handleStopSpeaking = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Process user utterance
  const handleUserSpeechFinal = async (text: string) => {
    setIsListening(false);
    setIsThinking(true);

    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);

    // Provide Gemini key if user entered one in settings, otherwise backend uses server .env key
    const geminiKey = (apiKey && apiKey.trim()) ? apiKey.trim() : null;

    // Check if WebSocket is open
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'user_speech',
        text: text,
        scenario_id: selectedScenarioId,
        voice: selectedVoice,
        api_key: geminiKey
      }));
    } else {
      // Fallback to REST API
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            scenario_id: selectedScenarioId,
            history: messages.slice(-4),
            voice: selectedVoice,
            api_key: geminiKey,
            return_audio: true
          })
        });
        const data: AIResponsePayload = await res.json();
        setIsThinking(false);
        handleReceiveAIResponse(data);
      } catch (err) {
        console.error('Chat REST error:', err);
        setIsThinking(false);
      }
    }
  };

  // Handle incoming AI response payload
  const handleReceiveAIResponse = (data: AIResponsePayload) => {
    const aiMsg: ChatMessage = {
      role: 'assistant',
      content: data.reply || '',
      grammar_feedback: data.grammar_feedback,
      audio_base64: data.audio_base64,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, aiMsg]);

    // Update real-time feedback HUD
    setCurrentFeedback({
      grammar_feedback: data.grammar_feedback,
      native_alternative: data.native_alternative,
      cefr_level: data.cefr_level || 'B1 (Intermediate)',
      fluency_score: data.fluency_score || 85,
      vocab_tips: data.vocab_tips || [],
      pronunciation_focus_word: data.pronunciation_focus_word
    });

    // Play AI voice
    if (data.reply) {
      playSpeechAudio(data.reply, data.audio_base64 || null);
    }
  };

  useEffect(() => {
    handleReceiveAIResponseRef.current = handleReceiveAIResponse;
    handleUserSpeechFinalRef.current = handleUserSpeechFinal;
  });

  // Replay tutor's last utterance
  const handleReplayLast = () => {
    const lastAiMsg = [...messages].reverse().find(m => m.role === 'assistant');
    if (lastAiMsg) {
      playSpeechAudio(lastAiMsg.content, lastAiMsg.audio_base64 || null);
    }
  };

  // Starter prompt clicked
  const handleSelectStarter = (starterText: string) => {
    handleUserSpeechFinal(starterText);
  };

  // Practice phrase clicked from Feedback HUD
  const handlePracticePhrase = (phrase: string) => {
    playSpeechAudio(phrase, null, 0.85);
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col selection:bg-rose-500/30 selection:text-rose-200">
      {/* Dynamic Ambient Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-rose-600/10 blur-[120px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-rose-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] ring-1 ring-white/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-rose-400 bg-clip-text text-transparent">
                MASTEREnglish
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                REAL-TIME AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
              Next-Gen Real-Time AI English Speaking Partner & Fluency Coach
            </p>
          </div>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-3">
          {/* Active Accent Tag */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
            <Headphones className="w-3.5 h-3.5 text-cyan-400" />
            <span>{selectedVoice.split('-')[1]} Accent</span>
          </div>

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-2 text-xs font-medium cursor-pointer"
          >
            <Settings className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Main Voice Interactive Area (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Reactive Waveform & Visualizer */}
          <AudioVisualizer
            isListening={isListening}
            isSpeaking={isSpeaking}
            isThinking={isThinking}
            analyserNode={analyserNode}
          />

          {/* Scenario Selector & Starters */}
          <ScenarioSelector
            scenarios={scenarios}
            selectedScenarioId={selectedScenarioId}
            onSelectScenario={setSelectedScenarioId}
            onSelectStarter={handleSelectStarter}
          />

          {/* Conversation Transcript Stream */}
          <div className="flex-1 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md overflow-hidden min-h-[300px] flex flex-col justify-between shadow-xl">
            <div className="px-4 py-2.5 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                Live Conversation Transcript
              </span>
              <span>{messages.length} exchanges</span>
            </div>

            <ChatTranscript
              messages={messages}
              onPlayMessage={playSpeechAudio}
              onWordClick={(w) => setPronunciationWord(w)}
            />

            {/* Bottom Controls Bar */}
            <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
              {micError && (
                <div className="mb-3 mx-auto max-w-xl p-3 rounded-2xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs flex items-start justify-between gap-3 shadow-lg shadow-amber-950/30 animate-fadeIn">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-amber-300 font-mono">Microphone Notice</p>
                      <p className="text-amber-200/90 text-[11px] leading-relaxed mt-0.5">{micError}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMicError(null)}
                    className="text-amber-400 hover:text-white text-xs font-mono px-2 py-0.5 rounded hover:bg-amber-900/50 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <VoiceControls
                isListening={isListening}
                isSpeaking={isSpeaking}
                isThinking={isThinking}
                autoListen={autoListen}
                onToggleListen={handleToggleListen}
                onToggleAutoListen={() => setAutoListen(!autoListen)}
                onStopSpeaking={handleStopSpeaking}
                onReplayLast={handleReplayLast}
                onSendMessage={handleUserSpeechFinal}
                onClearChat={() => setMessages([])}
                disabled={isThinking}
                showTextInput={showTextInput}
                onToggleTextInput={() => setShowTextInput(!showTextInput)}
              />
            </div>
          </div>
        </div>

        {/* Right Column / Live Fluency & Feedback HUD (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Feedback HUD Card */}
          <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-b from-slate-900/60 to-slate-950/70 border border-slate-800/90 backdrop-blur-xl shadow-2xl flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2 font-bold">
                <Award className="w-4 h-4 text-cyan-400" />
                Fluency & Grammar Coach
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Real-Time Analysis
              </span>
            </div>

            <FeedbackHUD
              currentFeedback={currentFeedback}
              onPracticePhrase={handlePracticePhrase}
              onOpenPronunciation={(word) => setPronunciationWord(word)}
            />
          </div>

          {/* Quick Speaking Tips Card */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-md">
            <h4 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              Pro Speaking Tip
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Listen to native speakers on podcasts or videos, and repeat after them, mimicking how they group words together rather than reading them flatly.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md py-4 px-4 sm:px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2.5 text-center sm:text-left text-sm text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,210,255,0.7)]" />
            <span>&copy;{new Date().getFullYear()} <strong className="text-slate-200">MASTEREnglish.</strong> All rights reserved.</span>
          </div>
        </div>
        <div>
          <span className="flex justify-center text-xs">Developed by &nbsp;<strong className="text-cyan-300 tracking-wider">KAVEEN SATHSARA.</strong></span>
        </div>
      </footer>

      {/* Modals */}
      <PronunciationModal
        word={pronunciationWord}
        isOpen={Boolean(pronunciationWord)}
        onClose={() => setPronunciationWord(null)}
        onPlayAudio={(word, rate) => playSpeechAudio(word, null, rate)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        voices={voices}
        selectedVoice={selectedVoice}
        onChangeVoice={setSelectedVoice}
        speechRate={speechRate}
        onChangeSpeechRate={setSpeechRate}
        apiKey={apiKey}
        onChangeApiKey={handleUpdateApiKey}
        provider={provider}
        onChangeProvider={handleUpdateProvider}
      />
    </div>
  );
}
