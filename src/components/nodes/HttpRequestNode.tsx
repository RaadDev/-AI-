'use client';

import React, { memo, useState } from 'react';
import { Handle, NodeProps, useReactFlow } from '@xyflow/react';
import { Globe, ArrowRightLeft, Loader2, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';
import { NodeContainer } from './NodeContainer';
import { WorkflowNodeData } from '@/types/workflow';
import { useHandlePositions } from '@/utils/useHandlePositions';

export const HttpRequestNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as WorkflowNodeData;
  const { updateNodeData } = useReactFlow();
  const { sourcePosition, targetPosition } = useHandlePositions();

  const [copied, setCopied] = useState(false);
  const [showHeaders, setShowHeaders] = useState(false);

  const handleCopy = () => {
    if (nodeData.output) {
      navigator.clipboard.writeText(String(nodeData.output));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const status = nodeData.status || 'idle';
  const httpStatus = typeof nodeData.httpResponseStatus === 'number' ? nodeData.httpResponseStatus : undefined;
  const httpUrl = typeof nodeData.httpUrl === 'string' ? nodeData.httpUrl : '';

  return (
    <div className="relative group">
      {/* Target handle: Upstream input/body */}
      <Handle
        type="target"
        position={targetPosition}
        id="input"
        className="!bg-cyan-500 !border-zinc-900 !w-3.5 !h-3.5"
      />

      <NodeContainer
        nodeId={id}
        title={nodeData.label || 'طلب HTTP (API)'}
        category="APIs & Web"
        icon={<Globe className="w-4 h-4 text-cyan-400" />}
        status={status}
        accentColor="cyan"
        width="w-[360px]"
        selected={selected}
        isCollapsed={nodeData.isCollapsed}
      >
        <div className="space-y-3">
          {/* Method and URL */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-zinc-400 block text-right">
              الوجهة المستهدفة (HTTP Endpoint):
            </label>
            <div className="flex gap-1.5">
              <select
                value={nodeData.httpMethod || 'GET'}
                onChange={(e) =>
                  updateNodeData(id, { httpMethod: e.target.value as any })
                }
                className="bg-[#0A0C10] border border-zinc-800 rounded-xl px-2 py-1.5 text-xs font-mono font-bold text-cyan-400 focus:outline-none focus:border-cyan-500/60"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>

              <div className="relative flex-1">
                <input
                  type="url"
                  placeholder="https://api.example.com/v1/data"
                  value={httpUrl}
                  onChange={(e) => updateNodeData(id, { httpUrl: e.target.value })}
                  className="w-full bg-[#0A0C10] border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/60 font-mono text-left"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          {/* Toggle Headers / Body Settings */}
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-800/60">
            <button
              type="button"
              onClick={() => setShowHeaders(!showHeaders)}
              className="text-xs text-zinc-400 hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span>{showHeaders ? 'إخفاء الترويسات والمتن' : 'إعداد الترويسات والمتن (Headers & Body)'}</span>
            </button>
            {httpStatus !== undefined && (
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  httpStatus >= 200 && httpStatus < 300
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}
              >
                HTTP {httpStatus} {httpStatus === 200 ? 'OK' : ''}
              </span>
            )}
          </div>

          {showHeaders && (
            <div className="space-y-2 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
              <div>
                <label className="text-[10px] text-zinc-400 block text-right mb-1">
                  ترويسات الطلب (Headers JSON):
                </label>
                <textarea
                  placeholder='{"Authorization": "Bearer ...", "Accept": "application/json"}'
                  value={
                    typeof nodeData.httpHeaders === 'object'
                      ? JSON.stringify(nodeData.httpHeaders, null, 2)
                      : nodeData.httpHeaders || ''
                  }
                  onChange={(e) => updateNodeData(id, { httpHeaders: e.target.value })}
                  rows={2}
                  dir="ltr"
                  className="w-full bg-[#0A0C10] border border-zinc-800/80 rounded-lg p-2 text-[11px] font-mono text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-cyan-500/50 resize-none"
                />
              </div>

              {(nodeData.httpMethod === 'POST' ||
                nodeData.httpMethod === 'PUT' ||
                nodeData.httpMethod === 'PATCH') && (
                <div>
                  <label className="text-[10px] text-zinc-400 block text-right mb-1">
                    متن الطلب (Request Body JSON):
                  </label>
                  <textarea
                    placeholder='{"key": "value"}'
                    value={nodeData.httpBody || ''}
                    onChange={(e) => updateNodeData(id, { httpBody: e.target.value })}
                    rows={2}
                    dir="ltr"
                    className="w-full bg-[#0A0C10] border border-zinc-800/80 rounded-lg p-2 text-[11px] font-mono text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-cyan-500/50 resize-none"
                  />
                  <p className="text-[9px] text-zinc-500 text-right mt-0.5">
                    ملاحظة: إذا ترك الحقل فارغاً، سيتم تلقائياً استخدام مخرجات العقدة السابقة كـ Body.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Response Output Preview */}
          {nodeData.output && (
            <div className="space-y-1 pt-1 border-t border-zinc-800/60">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-zinc-500 hover:text-zinc-200 transition-colors p-1"
                  title="نسخ الاستجابة"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <span className="text-[10px] font-medium text-zinc-500">
                  بيانات الاستجابة (Response):
                </span>
              </div>
              <div
                dir="ltr"
                className="max-h-28 overflow-y-auto bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-2 font-mono text-[10px] text-zinc-300 whitespace-pre-wrap select-text scrollbar-thin"
              >
                {String(nodeData.output).slice(0, 800)}
                {String(nodeData.output).length > 800 && '... [تم اقتصار المعاينة]'}
              </div>
            </div>
          )}
        </div>
      </NodeContainer>

      {/* Source handle: Emits API response */}
      <Handle
        type="source"
        position={sourcePosition}
        id="output"
        className="!bg-cyan-500 !border-zinc-900 !w-3.5 !h-3.5"
      />
    </div>
  );
});

HttpRequestNode.displayName = 'HttpRequestNode';
