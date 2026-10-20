'use client';

import React, { memo, useState } from 'react';
import { Handle, NodeProps, useReactFlow } from '@xyflow/react';
import { Braces, CheckCircle2, AlertCircle, Copy, Check, Sparkles } from 'lucide-react';
import { NodeContainer } from './NodeContainer';
import { WorkflowNodeData } from '@/types/workflow';
import { useHandlePositions } from '@/utils/useHandlePositions';

const SCHEMA_TEMPLATES = [
  {
    name: 'ملخص وتصنيف',
    schema: JSON.stringify(
      {
        title: 'String',
        summary: 'String',
        tags: ['String'],
        sentiment: 'positive | neutral | negative',
        confidenceScore: 'Number (0-100)',
      },
      null,
      2
    ),
  },
  {
    name: 'استخراج عميل محتمل (Lead)',
    schema: JSON.stringify(
      {
        fullName: 'String',
        company: 'String',
        email: 'String',
        jobTitle: 'String',
        interestLevel: 'High | Medium | Low',
        budgetEstimatedUsd: 'Number',
      },
      null,
      2
    ),
  },
  {
    name: 'عناصر عمل ومهام (Action Items)',
    schema: JSON.stringify(
      {
        tasks: [
          {
            title: 'String',
            assignee: 'String',
            priority: 'Urgent | Normal | Low',
            deadline: 'YYYY-MM-DD',
          },
        ],
      },
      null,
      2
    ),
  },
];

export const StructuredOutputNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as WorkflowNodeData;
  const { updateNodeData } = useReactFlow();
  const { sourcePosition, targetPosition } = useHandlePositions();

  const [copied, setCopied] = useState(false);
  const [showSchemaEditor, setShowSchemaEditor] = useState(false);

  const handleCopy = () => {
    if (nodeData.output) {
      navigator.clipboard.writeText(String(nodeData.output));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const status = nodeData.status || 'idle';
  const isValid = nodeData.isValidSchema;

  return (
    <div className="relative group">
      {/* Target handle: Upstream text/context */}
      <Handle
        type="target"
        position={targetPosition}
        id="input"
        className="!bg-violet-500 !border-zinc-900 !w-3.5 !h-3.5"
      />

      <NodeContainer
        nodeId={id}
        title={nodeData.label || 'مخرجات مهيكلة (JSON Schema)'}
        category="Data & Schema"
        icon={<Braces className="w-4 h-4 text-violet-400" />}
        status={status}
        accentColor="violet"
        width="w-[360px]"
        selected={selected}
        isCollapsed={nodeData.isCollapsed}
      >
        <div className="space-y-3">
          {/* Header & Template Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-500">قوالب جاهزة:</span>
              <label className="text-[11px] font-medium text-zinc-400 block text-right">
                مخطط البيانات (JSON Schema):
              </label>
            </div>

            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
              {SCHEMA_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.name}
                  type="button"
                  onClick={() => updateNodeData(id, { jsonSchema: tpl.schema })}
                  className="text-[10px] whitespace-nowrap bg-zinc-900 hover:bg-violet-950/60 hover:text-violet-300 border border-zinc-800 px-2 py-0.5 rounded-lg text-zinc-400 transition-colors"
                >
                  {tpl.name}
                </button>
              ))}
            </div>
          </div>

          {/* Schema preview / edit */}
          <div>
            <textarea
              value={
                nodeData.jsonSchema ||
                SCHEMA_TEMPLATES[0].schema
              }
              onChange={(e) => updateNodeData(id, { jsonSchema: e.target.value })}
              rows={4}
              dir="ltr"
              placeholder='{\n  "key": "type"\n}'
              className="w-full bg-[#0A0C10] border border-zinc-800 rounded-xl p-2.5 text-[11px] font-mono text-violet-300 placeholder-zinc-700 focus:outline-none focus:border-violet-500/60 resize-none scrollbar-thin"
            />
          </div>

          {/* Status feedback & validation */}
          {nodeData.output && (
            <div className="space-y-1 pt-1 border-t border-zinc-800/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="text-zinc-500 hover:text-zinc-200 transition-colors p-1"
                    title="نسخ الـ JSON"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  {isValid !== undefined && (
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                        isValid
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {isValid ? (
                        <>
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>JSON صالح</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-2.5 h-2.5" />
                          <span>تنسيق غير متطابق</span>
                        </>
                      )}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium text-zinc-500">
                  المخرجات المهيكلة:
                </span>
              </div>

              <div
                dir="ltr"
                className="max-h-32 overflow-y-auto bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-2 font-mono text-[10px] text-zinc-200 whitespace-pre-wrap select-text scrollbar-thin"
              >
                {String(nodeData.output)}
              </div>
            </div>
          )}
        </div>
      </NodeContainer>

      {/* Source handle: Emits validated JSON */}
      <Handle
        type="source"
        position={sourcePosition}
        id="output"
        className="!bg-violet-500 !border-zinc-900 !w-3.5 !h-3.5"
      />
    </div>
  );
});

StructuredOutputNode.displayName = 'StructuredOutputNode';
