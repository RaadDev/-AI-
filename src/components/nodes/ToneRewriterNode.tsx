'use client';

import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import {
  Wand2,
  Copy,
  Check,
  Maximize2,
  Sliders,
} from 'lucide-react';
import { NodeContainer } from './NodeContainer';
import { WorkflowNodeData } from '@/types/workflow';
import { PreviewModal } from '@/components/canvas/PreviewModal';
import { useHandlePositions } from '@/utils/useHandlePositions';

export const ToneRewriterNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as WorkflowNodeData;
  const { updateNodeData } = useReactFlow();
  const { targetPosition, sourcePosition } = useHandlePositions();

  const [copied, setCopied] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const currentTone = nodeData.targetTone || 'saudi';
  const currentLength = nodeData.lengthPreference || 'balanced';

  const handleCopy = () => {
    if (nodeData.output) {
      navigator.clipboard.writeText(nodeData.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const tones = [
    { id: 'saudi', label: '🇸🇦 سعودية بيضاء', desc: 'عفوية وودية' },
    { id: 'khaleeji', label: '🌊 خليجية تسويقية', desc: 'حماسية وإعلانية' },
    { id: 'formal', label: '📜 فصحى رسمية', desc: 'مهنية وموثوقة' },
    { id: 'story', label: '📖 أسلوب قصصي', desc: 'مشوق وسردي' },
    { id: 'executive', label: '💼 تلخيص تنفيذي', desc: 'مباشر للقرارات' },
  ];

  const lengths = [
    { id: 'concise', label: 'موجز ومختصر' },
    { id: 'balanced', label: 'متوازن' },
    { id: 'detailed', label: 'مفصل وشامل' },
  ];

  return (
    <div className="relative group">
      {/* Input Handle from upstream */}
      <Handle
        type="target"
        position={targetPosition}
        id="input"
        className="!bg-indigo-400 !border-zinc-900 !w-3.5 !h-3.5"
      />

      <NodeContainer
        nodeId={id}
        title={nodeData.label || 'محول اللهجة والأسلوب (Tone)'}
        category="AI Polish"
        icon={<Wand2 className="w-4 h-4 text-indigo-400" />}
        status={nodeData.status}
        accentColor="violet"
        width="w-[340px]"
        selected={selected}
        isCollapsed={nodeData.isCollapsed}
      >
        <div className="space-y-3">
          {/* Minimal Segmented Tone Selector */}
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 block text-right">
              الأسلوب والنبرة:
            </span>
            <div className="flex flex-wrap gap-1 bg-black/20 p-1 rounded-xl border border-white/[0.06]">
              {tones.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() =>
                    updateNodeData(id, { targetTone: t.id as any })
                  }
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    currentTone === t.id
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Minimal Segmented Length Preference */}
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-zinc-400 block text-right">
              طول النص:
            </span>
            <div className="flex bg-black/20 p-0.5 rounded-xl border border-white/[0.06] text-xs">
              {lengths.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() =>
                    updateNodeData(id, { lengthPreference: l.id as any })
                  }
                  className={`flex-1 py-1 rounded-lg text-xs font-medium transition ${
                    currentLength === l.id
                      ? 'bg-zinc-700 text-white font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Output Display */}
          {nodeData.output && (
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-[11px] text-zinc-300">
                <span className="font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> النتيجة:
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsPreviewOpen(true)}
                    className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
                    title="تكبير العرض"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800/70 hover:bg-zinc-700 border border-zinc-700/50 text-[10px] text-zinc-300 hover:text-white transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
                  </button>
                </div>
              </div>

              <div
                className="border border-white/[0.08] bg-black/30 rounded-xl p-3 max-h-44 overflow-y-auto text-xs leading-relaxed text-zinc-200 font-sans whitespace-pre-wrap select-text"
                dir="auto"
              >
                {nodeData.output}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-1.5 border-t border-[var(--card-border)]/60">
          <span>تحويل الأسلوب الذكي</span>
          <span className="text-[var(--text-subtle)] font-medium">جاهز للتمرير</span>
        </div>
      </NodeContainer>

      {/* Output Handle */}
      <Handle
        type="source"
        position={sourcePosition}
        id="output"
        className="!bg-emerald-400 !border-zinc-900 !w-3.5 !h-3.5"
      />

      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={nodeData.label || 'النص المعاد صياغته'}
        initialContent={nodeData.output || ''}
        onSave={(updated) => updateNodeData(id, { output: updated })}
      />
    </div>
  );
});

ToneRewriterNode.displayName = 'ToneRewriterNode';
