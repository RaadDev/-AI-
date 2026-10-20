'use client';

import React, { memo, useState, useEffect, useRef } from 'react';
import { Handle, NodeProps, useReactFlow } from '@xyflow/react';
import {
  Mic,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  AudioWaveform,
  Copy,
  Check,
} from 'lucide-react';
import { NodeContainer } from './NodeContainer';
import { WorkflowNodeData } from '@/types/workflow';
import { useHandlePositions } from '@/utils/useHandlePositions';

export const AudioVoiceNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as WorkflowNodeData;
  const { updateNodeData } = useReactFlow();
  const { targetPosition, sourcePosition } = useHandlePositions();

  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState(nodeData.voiceName || '');
  const [rate, setRate] = useState(nodeData.voiceRate ?? 1.0);
  const [pitch, setPitch] = useState(nodeData.voicePitch ?? 1.0);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const textToSpeak = nodeData.text || nodeData.output || '';

  // Load available speech synthesis voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available.length > 0) {
        setVoices(available);
        if (!selectedVoice) {
          // Prefer Arabic voice if available
          const arVoice = available.find((v) => v.lang.startsWith('ar'));
          setSelectedVoice(arVoice ? arVoice.name : available[0].name);
        }
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [selectedVoice]);

  const handlePlayPause = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('المتصفح لا يدعم محرك النطق الصوتي (SpeechSynthesis)');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    if (!textToSpeak.trim()) {
      alert('لا يوجد نص لقراءته صوتياً. قم بربط عقدة نصية أو كتابة نص أولاً.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = rate;
    utterance.pitch = pitch;

    if (selectedVoice) {
      const voiceObj = voices.find((v) => v.name === selectedVoice);
      if (voiceObj) utterance.voice = voiceObj;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      updateNodeData(id, { status: 'completed' });
    };
    utterance.onerror = () => setIsPlaying(false);

    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    updateNodeData(id, { status: 'running' });
  };

  const handleStop = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const handleCopy = () => {
    if (textToSpeak) {
      navigator.clipboard.writeText(textToSpeak);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="relative group">
      {/* Target input handle from previous text node */}
      <Handle
        type="target"
        position={targetPosition}
        id="text"
        className="!bg-teal-400 !border-slate-900 !w-3.5 !h-3.5"
      />

      <NodeContainer
        nodeId={id}
        title={nodeData.label || 'التعليق الصوتي (Voice TTS)'}
        category="Audio"
        icon={<Mic className="w-4 h-4 text-teal-400" />}
        status={nodeData.status}
        accentColor="emerald"
        width="w-[360px]"
        selected={selected}
        isCollapsed={nodeData.isCollapsed}
        isPinned={nodeData.isPinned}
      >
        <div className="space-y-2.5">
          {/* AI Audio Model Engine Selector */}
          <div className="flex items-center justify-between gap-1 bg-[#0A0C10] border border-zinc-800 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-[10px] text-zinc-400 flex items-center gap-1">
              <AudioWaveform className="w-3 h-3 text-teal-400" />
              محرك الصوت:
            </span>
            <select
              value={nodeData.audioModel || 'elevenlabs-v2'}
              onChange={(e) => updateNodeData(id, { audioModel: e.target.value })}
              className="bg-transparent text-[11px] text-teal-300 focus:outline-none cursor-pointer max-w-[180px] truncate"
            >
              <option value="elevenlabs-v2" className="bg-zinc-900 text-white">ElevenLabs v2 (أصوات بشرية)</option>
              <option value="whisper-v3" className="bg-zinc-900 text-white">Whisper v3 (تفريغ وصوت OpenAI)</option>
              <option value="bark-suno" className="bg-zinc-900 text-white">Bark - Suno (أصوات ومؤثرات)</option>
              <option value="web-speech" className="bg-zinc-900 text-white">Web Speech API (محرك المتصفح)</option>
            </select>
          </div>

          {/* Audio Player Card */}
          <div className="p-3 rounded-xl bg-zinc-950/90 border border-zinc-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePlayPause}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition shadow-sm ${
                    isPlaying
                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                      : 'bg-teal-600 hover:bg-teal-500 text-white'
                  }`}
                  title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل النطق الصوتي'}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current mr-0.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleStop}
                  className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/50 transition"
                  title="إيقاف نهائي"
                >
                  <VolumeX className="w-4 h-4" />
                </button>
              </div>

              {/* Waveform Animation when playing */}
              <div className="flex items-center gap-1 h-6 px-2">
                {[0.4, 0.8, 0.3, 1, 0.6, 0.9, 0.5, 0.7].map((height, i) => (
                  <span
                    key={`wave-${i}-${height}`}
                    style={{
                      height: isPlaying ? `${Math.max(4, height * 20)}px` : '4px',
                      animationDuration: `${0.4 + (i % 3) * 0.2}s`,
                    }}
                    className={`w-1 rounded-full transition-all duration-150 ${
                      isPlaying
                        ? 'bg-teal-400 animate-pulse'
                        : 'bg-zinc-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Voice and Speed Controls */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-800/70 text-xs">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">الصوت:</label>
                <select
                  value={selectedVoice}
                  onChange={(e) => {
                    setSelectedVoice(e.target.value);
                    updateNodeData(id, { voiceName: e.target.value });
                  }}
                  className="w-full bg-[#121316] border border-zinc-800 rounded-lg px-2 py-1 text-[11px] text-zinc-200 focus:outline-none focus:border-teal-500 truncate"
                >
                  {voices.map((v) => (
                    <option key={v.name} value={v.name} className="bg-zinc-900 text-white">
                      {v.name} ({v.lang})
                    </option>
                  ))}
                  {voices.length === 0 && (
                    <option value="">صوت النظام الافتراضي</option>
                  )}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">السرعة ({rate}x):</label>
                <select
                  value={rate}
                  onChange={(e) => {
                    const r = parseFloat(e.target.value);
                    setRate(r);
                    updateNodeData(id, { voiceRate: r });
                  }}
                  className="w-full bg-[#121316] border border-zinc-800 rounded-lg px-2 py-1 text-[11px] text-zinc-200 focus:outline-none focus:border-teal-500"
                >
                  <option value={0.75}>0.75x بطيء</option>
                  <option value={1.0}>1.0x عادي</option>
                  <option value={1.25}>1.25x سريع</option>
                  <option value={1.5}>1.5x سريع جداً</option>
                </select>
              </div>
            </div>
          </div>

          {/* Text Preview Box */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span>النص المراد قراءته:</span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white transition"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
              </button>
            </div>
            <textarea
              value={textToSpeak}
              onChange={(e) => updateNodeData(id, { text: e.target.value, output: e.target.value })}
              placeholder="اكتب النص هنا أو اربط العقدة بمخرج نصي سابق..."
              rows={3}
              className="w-full bg-[#0A0C10] border border-zinc-800/80 rounded-xl p-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-teal-500 resize-none leading-relaxed"
              dir="auto"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-1 border-t border-[var(--card-border)]/60">
          <span>توليد وقراءة صوتية</span>
          <span className="text-[var(--text-subtle)] font-medium">جاهز للاستماع</span>
        </div>
      </NodeContainer>

      {/* Output Handle */}
      <Handle
        type="source"
        position={sourcePosition}
        id="output"
        className="!bg-teal-400 !border-slate-900 !w-3.5 !h-3.5"
      />
    </div>
  );
});

AudioVoiceNode.displayName = 'AudioVoiceNode';
