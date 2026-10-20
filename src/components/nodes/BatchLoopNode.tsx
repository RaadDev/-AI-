'use client';

import React, { memo, useState } from 'react';
import { Handle, NodeProps, useReactFlow } from '@xyflow/react';
import {
  Repeat,
  ListOrdered,
  ChevronRight,
  ChevronLeft,
  Check,
  Copy,
  Layers,
} from 'lucide-react';
import { NodeContainer } from './NodeContainer';
import { WorkflowNodeData } from '@/types/workflow';
import { useHandlePositions } from '@/utils/useHandlePositions';

export const BatchLoopNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as WorkflowNodeData;
  const { updateNodeData } = useReactFlow();
  const { targetPosition, sourcePosition } = useHandlePositions();

  const [copied, setCopied] = useState(false);
  const delimiter = nodeData.batchDelimiter || 'newline';
  const rawInput = nodeData.text || nodeData.output || '';

  // Parse items based on delimiter
  const parseItems = (str: string): string[] => {
    if (!str) return [];
    if (delimiter === 'newline') {
      return str.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    }
    if (delimiter === 'comma') {
      return str.split(/[,،]/).map((s) => s.trim()).filter(Boolean);
    }
    return str.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  };

  const items = nodeData.batchItems || parseItems(rawInput);
  const currentIndex = nodeData.currentBatchIndex ?? 0;
  const currentItem = items[currentIndex] || '';

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      const nextIdx = currentIndex + 1;
      updateNodeData(id, {
        currentBatchIndex: nextIdx,
        output: items[nextIdx],
      });
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      updateNodeData(id, {
        currentBatchIndex: prevIdx,
        output: items[prevIdx],
      });
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const parsed = parseItems(val);
    updateNodeData(id, {
      text: val,
      batchItems: parsed,
      currentBatchIndex: 0,
      output: parsed[0] || '',
    });
  };

  const handleCopy = () => {
    if (currentItem) {
      navigator.clipboard.writeText(currentItem);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="relative group">
      {/* Input Handle from upstream list or text */}
      <Handle
        type="target"
        position={targetPosition}
        id="input"
        className="!bg-orange-400 !border-slate-900 !w-3.5 !h-3.5"
      />

      <NodeContainer
        nodeId={id}
        title={nodeData.label || 'التكرار والمعالجة الدفعية (Batch Loop)'}
        category="Utility"
        icon={<Repeat className="w-4 h-4 text-orange-400" />}
        status={nodeData.status}
        accentColor="amber"
        width="w-[360px]"
        selected={selected}
        isCollapsed={nodeData.isCollapsed}
        isPinned={nodeData.isPinned}
      >
        <div className="space-y-2.5">
          {/* Stepper Card */}
          <div className="p-3 rounded-xl bg-zinc-950/90 border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-medium flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-orange-400" />
                العنصر الحالي النشط:
              </span>
              <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-lg font-mono text-[11px] text-zinc-300">
                <span>{items.length > 0 ? currentIndex + 1 : 0}</span>
                <span className="text-zinc-600">/</span>
                <span>{items.length}</span>
              </div>
            </div>

            {/* Stepper buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex <= 0}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-zinc-800/70 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 border border-zinc-700/50 text-xs font-medium transition"
              >
                <ChevronRight className="w-3.5 h-3.5" />
                <span>السابق</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={currentIndex >= items.length - 1}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-zinc-800/70 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 border border-zinc-700/50 text-xs font-medium transition"
              >
                <span>التالي</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Active Item Preview */}
          {currentItem ? (
            <div className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span className="text-orange-400 font-semibold">المخرج الممرر للعقدة التالية:</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white transition"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'تم' : 'نسخ'}</span>
                </button>
              </div>
              <div className="text-xs text-zinc-200 font-sans leading-relaxed select-text">
                {currentItem}
              </div>
            </div>
          ) : (
            <textarea
              value={rawInput}
              onChange={handleTextChange}
              placeholder="اكتب العناصر سطراً بسطر لتقسيمها، أو اربط العقدة بمدخل سابق..."
              rows={3}
              className="w-full bg-[#0A0C10] border border-zinc-800/80 rounded-xl p-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-orange-500 resize-none leading-relaxed"
              dir="auto"
            />
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-1 border-t border-[var(--card-border)]/60">
          <span>تكرار دفعي متتابع</span>
          <span className="text-[var(--text-subtle)] font-medium">عنصر واحد لكل دورة</span>
        </div>
      </NodeContainer>

      {/* Output Handle */}
      <Handle
        type="source"
        position={sourcePosition}
        id="output"
        className="!bg-orange-400 !border-slate-900 !w-3.5 !h-3.5"
      />
    </div>
  );
});

BatchLoopNode.displayName = 'BatchLoopNode';
