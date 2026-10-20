'use client';

import React, { memo } from 'react';
import { Handle, NodeProps, useReactFlow } from '@xyflow/react';
import { Split, ListFilter, Scissors, Layers } from 'lucide-react';
import { NodeContainer } from './NodeContainer';
import { WorkflowNodeData } from '@/types/workflow';
import { useHandlePositions } from '@/utils/useHandlePositions';

export const SplitterNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as WorkflowNodeData;
  const { updateNodeData } = useReactFlow();
  const { targetPosition, sourcePosition } = useHandlePositions();

  const delimiter = nodeData.delimiter || 'newline';
  const splitItems = nodeData.splitItems || [];
  const selectedIndex = nodeData.selectedItemIndex ?? -1;

  return (
    <div className="relative group">
      {/* Upstream input */}
      <Handle
        type="target"
        position={targetPosition}
        id="context"
        className="!bg-amber-500 !border-zinc-900 !w-3.5 !h-3.5"
      />

      <NodeContainer
        nodeId={id}
        title={nodeData.label || 'تقسيم ومعالجة دفعية (Splitter)'}
        category="Batch & Transform"
        icon={<Scissors className="w-4 h-4 text-amber-400" />}
        status={nodeData.status}
        accentColor="amber"
        width="w-[330px]"
        selected={selected}
        isCollapsed={nodeData.isCollapsed}
      >
        <div className="space-y-3">
          {/* Delimiter Selection */}
          <div>
            <label className="text-[11px] font-medium text-zinc-400 block text-right mb-1">
              محدد التقسيم (Split By):
            </label>
            <select
              value={delimiter}
              onChange={(e) =>
                updateNodeData(id, { delimiter: e.target.value as any })
              }
              className="w-full bg-[#0A0C10] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/60"
            >
              <option value="newline">كل سطر مستقل (Lines \n)</option>
              <option value="paragraph">كل فقرة مستقلة (Paragraphs \n\n)</option>
              <option value="comma">الفواصل العادية (Commas ,)</option>
              <option value="custom">محدد مخصص (Custom Delimiter)</option>
            </select>
          </div>

          {delimiter === 'custom' && (
            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">
                الرمز أو الكلمة الفاصلة:
              </label>
              <input
                type="text"
                placeholder="مثال: --- أو ;"
                value={nodeData.customDelimiter || ''}
                onChange={(e) =>
                  updateNodeData(id, { customDelimiter: e.target.value })
                }
                className="w-full bg-[#0A0C10] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none"
              />
            </div>
          )}

          {/* Mode: Pick One or Pass All */}
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-zinc-400">العنصر الممرر للمرحلة التالية:</span>
              <span className="text-amber-400 font-bold font-mono">
                {splitItems.length} عناصر
              </span>
            </div>

            <select
              value={selectedIndex}
              onChange={(e) =>
                updateNodeData(id, {
                  selectedItemIndex: parseInt(e.target.value, 10),
                })
              }
              className="w-full bg-[#0A0C10] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none"
            >
              <option value={-1}>جميع العناصر بالتسلسل (All Items)</option>
              {splitItems.map((_, idx) => (
                <option key={`split-opt-${idx}`} value={idx}>
                  العنصر رقم {idx + 1} فقط
                </option>
              ))}
            </select>
          </div>

          {/* Items Preview */}
          {splitItems.length > 0 && (
            <div className="space-y-1 max-h-36 overflow-y-auto">
              <span className="text-[10px] text-zinc-500 block">
                معاينة العناصر المستخرجة:
              </span>
              {splitItems.slice(0, 4).map((item, idx) => (
                <div
                  key={`split-item-${idx}-${item.slice(0, 15)}`}
                  className={`p-2 rounded-lg text-[10px] border truncate ${
                    selectedIndex === idx
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                      : 'bg-[#0A0C10] border-zinc-800/80 text-zinc-400'
                  }`}
                >
                  <span className="font-mono text-zinc-500 ml-1.5">#{idx + 1}</span>
                  <span>{item}</span>
                </div>
              ))}
              {splitItems.length > 4 && (
                <div className="text-[9px] text-zinc-500 text-center">
                  + {splitItems.length - 4} عناصر إضافية...
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-1.5 border-t border-[var(--card-border)]/60">
          <span>تقسيم دفعي ذكي</span>
          <span className="text-[var(--text-subtle)] font-medium">جاهز للتمرير</span>
        </div>
      </NodeContainer>

      {/* Downstream output */}
      <Handle
        type="source"
        position={sourcePosition}
        id="output"
        className="!bg-amber-400 !border-zinc-900 !w-3.5 !h-3.5"
      />
    </div>
  );
});

SplitterNode.displayName = 'SplitterNode';
