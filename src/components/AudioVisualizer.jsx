import React, { useEffect, useRef } from 'react';
import { Sparkles, Mic, Volume2 } from 'lucide-react';

export default function AudioVisualizer({
  isListening,
  isSpeaking,
  isThinking,
  analyserNode
}) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let phase = 0;
    const dataArray = analyserNode ? new Uint8Array(analyserNode.frequencyBinCount) : null;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      let currentLevel = 0;
      if (analyserNode && dataArray && isListening) {
        analyserNode.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < 32; i++) {
          sum += dataArray[i];
        }
        currentLevel = sum / (32 * 255);
      } else if (isSpeaking) {
        // Simulated organic energy for AI voice speech
        currentLevel = 0.45 + Math.sin(phase * 4) * 0.25 + Math.cos(phase * 7) * 0.15;
      } else if (isThinking) {
        currentLevel = 0.2 + Math.sin(phase * 6) * 0.1;
      }

      phase += 0.04;
      const centerY = height / 2;
      const centerX = width / 2;

      // Outer radial glow
      const radialGlow = ctx.createRadialGradient(
        centerX, centerY, 10,
        centerX, centerY, width * 0.45
      );

      if (isSpeaking) {
        // Vibrant Neon Red glow for AI speaking
        radialGlow.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
        radialGlow.addColorStop(0.5, 'rgba(255, 51, 102, 0.15)');
        radialGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
      } else if (isListening) {
        // Vibrant Electric Blue glow for User speaking
        radialGlow.addColorStop(0, 'rgba(0, 210, 255, 0.35)');
        radialGlow.addColorStop(0.5, 'rgba(59, 130, 246, 0.15)');
        radialGlow.addColorStop(1, 'rgba(59, 130, 246, 0)');
      } else {
        // Idle state: dual ambient red-blue gradient
        radialGlow.addColorStop(0, 'rgba(147, 51, 234, 0.12)');
        radialGlow.addColorStop(0.5, 'rgba(59, 130, 246, 0.05)');
        radialGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
      }

      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      // Multi-layer waveform curves
      const waveCount = 4;
      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath();
        ctx.lineWidth = w === 0 ? 3 : 1.5;

        // Gradient color for waves
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        if (isSpeaking) {
          gradient.addColorStop(0, '#ff3366');
          gradient.addColorStop(0.5, '#ef4444');
          gradient.addColorStop(1, '#ff708f');
        } else if (isListening) {
          gradient.addColorStop(0, '#00d2ff');
          gradient.addColorStop(0.5, '#3b82f6');
          gradient.addColorStop(1, '#60a5fa');
        } else {
          // Dual Red and Blue idle waves
          gradient.addColorStop(0, '#3b82f6');
          gradient.addColorStop(0.5, '#8b5cf6');
          gradient.addColorStop(1, '#ef4444');
        }

        ctx.strokeStyle = gradient;

        const amplitude = (isListening || isSpeaking || isThinking)
          ? 35 * currentLevel * (1 - w * 0.18) + 8
          : 6 + Math.sin(phase + w) * 4;

        const frequency = 0.015 + w * 0.005;

        for (let x = 0; x < width; x += 3) {
          const envelope = Math.sin((x / width) * Math.PI);
          const y = centerY + Math.sin(x * frequency + phase + (w * 0.8)) * amplitude * envelope;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Dynamic reactive center core
      ctx.beginPath();
      const coreRadius = 24 + currentLevel * 30;
      const coreGrad = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, coreRadius
      );

      if (isSpeaking) {
        coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        coreGrad.addColorStop(0.4, 'rgba(239, 68, 68, 0.8)');
        coreGrad.addColorStop(1, 'rgba(255, 51, 102, 0)');
      } else if (isListening) {
        coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        coreGrad.addColorStop(0.4, 'rgba(0, 210, 255, 0.8)');
        coreGrad.addColorStop(1, 'rgba(59, 130, 246, 0)');
      } else {
        coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
        coreGrad.addColorStop(0.5, 'rgba(139, 92, 246, 0.3)');
        coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }

      ctx.fillStyle = coreGrad;
      ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isListening, isSpeaking, isThinking, analyserNode]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden `bg-gradient-to-b` from-slate-900/80 via-[#0a0f1d]/90 to-slate-950 border border-slate-800/80 shadow-2xl p-4 backdrop-blur-xl">
      {/* Decorative cyber grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] `bg-[size:24px_24px]` pointer-events-none" />

      {/* Status Badges */}
      <div className="relative z-10 flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isSpeaking ? 'bg-rose-500' : isListening ? 'bg-cyan-400' : 'bg-blue-500'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isSpeaking ? 'bg-rose-500' : isListening ? 'bg-cyan-400' : 'bg-blue-500'
            }`}></span>
          </span>
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-300 font-mono">
            {isSpeaking
              ? 'AI TUTOR SPEAKING'
              : isThinking
              ? 'PROCESSING THOUGHTS...'
              : isListening
              ? 'LISTENING TO YOU...'
              : 'READY / WAITING'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isSpeaking && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-medium animate-pulse">
              <Volume2 className="w-3.5 h-3.5" />
              Voice Active
            </div>
          )}
          {isListening && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-medium animate-pulse">
              <Mic className="w-3.5 h-3.5" />
              Mic Active
            </div>
          )}
          {!isSpeaking && !isListening && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-400 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Dual AI Engine
            </div>
          )}
        </div>
      </div>

      {/* Canvas Waveform */}
      <canvas
        ref={canvasRef}
        width={720}
        height={160}
        className="w-full h-36 md:h-44 rounded-xl cursor-pointer block"
      />
    </div>
  );
}
