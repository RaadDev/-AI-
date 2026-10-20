'use client';

import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import {
  FileJson,
  Table,
  Copy,
  Check,
  Code,
  Sparkles,
  Maximize2,
} from 'lucide-react';
import { NodeContainer } from './NodeContainer';
import { WorkflowNodeData } from '@/types/workflow';
import { PreviewModal } from '@/components/canvas/PreviewModal';
import { useHandlePositions } from '@/utils/useHandlePositions';

export const JsonExtractorNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as WorkflowNodeData;
  const { updateNodeData } = useReactFlow();
  const { targetPosition, sourcePosition } = useHandlePositions();

  const [copied, setCopied] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const fields =
    nodeData.fields || 'العنوان, الملخص_التنفيذي, التصنيف, الكلمات_المفتاحية, التقييم';
  const format = nodeData.format || 'json';

  const handleCopy = () => {
    if (nodeData.output) {
      navigator.clipboard.writeText(nodeData.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  // Attempt to parse output as JSON if available
  let parsedJson: any = null;
  if (nodeData.output) {
    try {
      parsedJson = JSON.parse(nodeData.output);
    } catch {
      // If output is fenced or raw, try cleaning
      const cleaned = nodeData.output.replace(/```json|```/g, '').trim();
      try {
        parsedJson = JSON.parse(cleaned);
      } catch {
        parsedJson = null;
      }
    }
  }

  return (
    <div className="relative group">
      {/* Input Handle from upstream */}
      <Handle
        type="target"
        position={targetPosition}
        id="input"
        className="!bg-cyan-400 !border-slate-900 !w-3.5 !h-3.5"
      />

      <NodeContainer
        nodeId={id}
        title={nodeData.label || 'استخراج بيانات منظمة (JSON)'}
        category="Utility"
        icon={<FileJson className="w-4 h-4 text-cyan-400" />}
        status={nodeData.status}
        accentColor="cyan"
        width="w-88"
        selected={selected}
        isCollapsed={nodeData.isCollapsed}
      >
        <div className="space-y-2.5">
          {/* Target Fields Configuration */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400 block text-right">
              الحقول المستهدفة (مفصولة بفواصل):
            </label>
            <input
              type="text"
              value={fields}
              onChange={(e) => updateNodeData(id, { fields: e.target.value })}
              placeholder="العنوان, التصنيف, النقاط_الأساسية..."
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono text-left"
            />
          </div>

          {/* Format Selector */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] text-zinc-400">صيغة المخرج:</span>
            <div className="flex bg-zinc-950 border border-zinc-800 rounded-xl p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => updateNodeData(id, { format: 'json' })}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition font-medium ${
                  format === 'json'
                    ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/50'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Code className="w-3 h-3" />
                <span>JSON</span>
              </button>
              <button
                type="button"
                onClick={() => updateNodeData(id, { format: 'table' })}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition font-medium ${
                  format === 'table'
                    ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/50'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Table className="w-3 h-3" />
                <span>جدول</span>
              </button>
            </div>
          </div>

          {/* Output Display */}
          {nodeData.output && (
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-[11px] text-zinc-300">
                <span className="font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> البيانات المستخرجة:
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsPreviewOpen(true)}
                    className="p-1 text-zinc-400 hover:text-white transition"
                    title="تكبير العرض"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    {copied ? 'تم النسخ' : 'نسخ'}
                  </button>
                </div>
              </div>

              {format === 'table' && parsedJson && typeof parsedJson === 'object' ? (
                <div className="bg-zinc-950/90 border border-zinc-800/80 rounded-xl p-2 max-h-40 overflow-y-auto text-[11px]">
                  <table className="w-full text-right border-collapse">
                    <tbody>
                      {Object.entries(parsedJson).map(([k, v], idx) => (
                        <tr
                          key={k}
                          className="border-b border-zinc-800/60 last:border-0"
                        >
                          <td className="p-1 font-bold text-zinc-300 w-1/3 truncate">
                            {k}
                          </td>
                          <td className="p-1 text-zinc-300 font-mono text-[10px]">
                            {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div
                  className="bg-zinc-950/90 border border-zinc-800/80 rounded-xl p-2.5 max-h-40 overflow-y-auto text-xs text-zinc-200 font-mono whitespace-pre-wrap select-text leading-relaxed text-left"
                  dir="ltr"
                >
                  {nodeData.output}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-1.5 border-t border-[var(--card-border)]/60">
          <span>هيكلة البيانات النظيفة</span>
          <span className="text-[var(--text-subtle)] font-medium">
            مخرجات {format.toUpperCase()}
          </span>
        </div>
      </NodeContainer>

      {/* Output Handle */}
      <Handle
        type="source"
        position={sourcePosition}
        id="output"
        className="!bg-cyan-400 !border-slate-900 !w-3.5 !h-3.5"
      />

      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={nodeData.label || 'البيانات المنظمة'}
        initialContent={nodeData.output || ''}
        onSave={(updated) => updateNodeData(id, { output: updated })}
      />
    </div>
  );
});

JsonExtractorNode.displayName = 'JsonExtractorNode';
