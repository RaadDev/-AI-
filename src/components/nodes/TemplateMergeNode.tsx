'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps, useReactFlow, useEdges, useNodes } from '@xyflow/react';
import { GitMerge, Code2, Tag, ArrowLeftRight } from 'lucide-react';
import { NodeContainer } from './NodeContainer';
import { WorkflowNodeData } from '@/types/workflow';
import { useHandlePositions } from '@/utils/useHandlePositions';

export const TemplateMergeNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as WorkflowNodeData;
  const { updateNodeData } = useReactFlow();
  const edges = useEdges();
  const nodes = useNodes();
  const { targetPosition, sourcePosition, isHorizontal } = useHandlePositions();

  const incoming = edges.filter((e) => e.target === id);
  const input1Edge = incoming.find((e) => e.targetHandle === 'input_1') || incoming[0];
  const input2Edge = incoming.find((e) => e.targetHandle === 'input_2') || incoming[1];

  const src1Node = input1Edge ? nodes.find((n) => n.id === input1Edge.source) : null;
  const src2Node = input2Edge ? nodes.find((n) => n.id === input2Edge.source) : null;

  const src1Label = (src1Node?.data as any)?.label || src1Node?.id || 'غير متصل';
  const src2Label = (src2Node?.data as any)?.label || src2Node?.id || 'غير متصل';

  const src1Val = String((src1Node?.data as any)?.output ?? (src1Node?.data as any)?.text ?? '').trim();
  const src2Val = String((src2Node?.data as any)?.output ?? (src2Node?.data as any)?.text ?? '').trim();

  const currentTemplate =
    nodeData.template || 'المقال المكتمل:\n{{input_1}}\n\nالتغريدات المقترحة:\n{{input_2}}';

  // Reactive live recalculation: automatically sync merged output whenever inputs update
  React.useEffect(() => {
    if (!src1Val && !src2Val) return;
    let t = currentTemplate;
    t = t.replaceAll('{{input_1}}', src1Val);
    t = t.replaceAll('{{input_2}}', src2Val);
    t = t.replace(/\{\{input_\d+\}\}/g, '');
    t = t.replace(/\{\{[a-zA-Z0-9_-]+\}\}/g, '');
    t = t.replace(/\n{3,}/g, '\n\n').trim();
    if (t && t !== nodeData.output) {
      updateNodeData(id, { output: t });
    }
  }, [src1Val, src2Val, currentTemplate, id, nodeData.output, updateNodeData]);

  const insertVariable = (variableName: string) => {
    const updated = currentTemplate + ` {{${variableName}}}`;
    updateNodeData(id, { template: updated });
  };

  return (
    <div className="relative group">
      {/* Target Handles for inputs */}
      <Handle
        type="target"
        position={targetPosition}
        id="input_1"
        style={isHorizontal ? { top: '35%' } : { left: '30%' }}
        className="!bg-amber-400 !border-slate-900 !w-3.5 !h-3.5"
        title="مدخل القناة الأولى (input_1)"
      />
      <Handle
        type="target"
        position={targetPosition}
        id="input_2"
        style={isHorizontal ? { top: '65%' } : { left: '70%' }}
        className="!bg-teal-400 !border-slate-900 !w-3.5 !h-3.5"
        title="مدخل القناة الثانية (input_2)"
      />

      <NodeContainer
        nodeId={id}
        title={nodeData.label || 'دمج وتنسيق (Template Merge)'}
        category="Utility"
        icon={<GitMerge className="w-4 h-4 text-amber-400" />}
        status={nodeData.status}
        accentColor="amber"
        width="w-[330px]"
        selected={selected}
        isCollapsed={nodeData.isCollapsed}
      >
        <div className="space-y-2">
          {/* Quick variable tags */}
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span className="flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5 text-zinc-400" />
              المتغيرات المتاحة:
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => insertVariable('input_1')}
                className="px-2 py-0.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/50 text-zinc-300 text-[10px] font-mono flex items-center gap-1 transition"
                title={`إدراج {{input_1}} (متصل بـ: ${src1Label})`}
              >
                <Tag className="w-2.5 h-2.5 text-amber-400" />
                {"{{input_1}}"}
              </button>
              <button
                type="button"
                onClick={() => insertVariable('input_2')}
                className="px-2 py-0.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/50 text-zinc-300 text-[10px] font-mono flex items-center gap-1 transition"
                title={`إدراج {{input_2}} (متصل بـ: ${src2Label})`}
              >
                <Tag className="w-2.5 h-2.5 text-teal-400" />
                {"{{input_2}}"}
              </button>
            </div>
          </div>

          {/* Live Variable Sources Mapping */}
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <div
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border truncate transition ${
                src1Node
                  ? 'bg-amber-500/10 border-amber-500/25 text-amber-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}
              title={`input_1: ${src1Label}`}
            >
              <span className="font-mono font-bold text-amber-400">{"{{1}}"}:</span>
              <span className="truncate">{src1Label}</span>
            </div>
            <div
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border truncate transition ${
                src2Node
                  ? 'bg-teal-500/10 border-teal-500/25 text-teal-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}
              title={`input_2: ${src2Label}`}
            >
              <span className="font-mono font-bold text-teal-400">{"{{2}}"}:</span>
              <span className="truncate">{src2Label}</span>
            </div>
          </div>

          {/* Template Format Textarea */}
          <div className="space-y-1">
            <textarea
              className="w-full bg-[#0A0C10] border border-zinc-800/80 rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 resize-y min-h-[85px] font-mono text-left leading-relaxed"
              rows={3}
              placeholder="المقال:&#10;{{input_1}}&#10;&#10;التغريدات:&#10;{{input_2}}"
              value={currentTemplate}
              onChange={(e) => {
                updateNodeData(id, { template: e.target.value });
              }}
              dir="auto"
            />
          </div>

          {/* Output Preview */}
          {nodeData.output && (
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-semibold text-zinc-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                معاينة النص المدمج:
              </span>
              <div
                className="bg-zinc-950/90 border border-zinc-800/80 rounded-xl p-3 text-xs text-zinc-200 max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text shadow-inner"
                dir="auto"
              >
                {nodeData.output}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-1 border-t border-[var(--card-border)]/60">
          <span>قناتي دمج مخصصتين</span>
          <span className="text-[var(--text-subtle)] font-medium">جاهز للتمرير</span>
        </div>
      </NodeContainer>

      {/* Output Handle */}
      <Handle
        type="source"
        position={sourcePosition}
        id="output"
        className="!bg-emerald-400 !border-slate-900 !w-3.5 !h-3.5"
      />
    </div>
  );
});

TemplateMergeNode.displayName = 'TemplateMergeNode';
