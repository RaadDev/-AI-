'use client';

import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { Send, CheckCircle2, AlertCircle, Loader2, Globe, Radio } from 'lucide-react';
import { NodeContainer } from './NodeContainer';
import { WorkflowNodeData } from '@/types/workflow';
import { useHandlePositions } from '@/utils/useHandlePositions';

export const WebhookOutputNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as WorkflowNodeData;
  const { updateNodeData } = useReactFlow();
  const { targetPosition } = useHandlePositions();

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ status: number; text: string } | null>(null);

  const handleTestWebhook = async () => {
    const url = (nodeData.webhookUrl || '').trim();
    if (!url) {
      alert('يرجى إدخال رابط Webhook أولاً');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch(url, {
        method: nodeData.webhookMethod || 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test: true,
          nodeId: id,
          label: nodeData.label || 'PF Studio Webhook',
          payload: nodeData.output || 'تجربة إرسال ناجحة من استوديو PF Studio',
          timestamp: new Date().toISOString(),
        }),
      });

      setTestResult({
        status: res.status,
        text: res.ok ? 'نجح الإرسال (OK)' : `استجابة برمز (${res.status})`,
      });

      updateNodeData(id, {
        lastResponseStatus: res.status,
      });
    } catch (err: any) {
      setTestResult({
        status: 0,
        text: 'تعذر الاتصال بالرابط (CORS/Network)',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="relative group">
      {/* Upstream input */}
      <Handle
        type="target"
        position={targetPosition}
        id="context"
        className="!bg-emerald-500 !border-zinc-900 !w-3.5 !h-3.5"
      />

      <NodeContainer
        nodeId={id}
        title={nodeData.label || 'إرسال Webhook خارجي'}
        category="External Output"
        icon={<Radio className="w-4 h-4 text-emerald-400" />}
        status={nodeData.status}
        accentColor="emerald"
        width="w-[340px]"
        selected={selected}
        isCollapsed={nodeData.isCollapsed}
      >
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-medium text-zinc-400 block text-right mb-1">
              رابط الاستدعاء (Target Webhook URL):
            </label>
            <div className="relative">
              <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input
                type="url"
                placeholder="https://hooks.zapier.com/..."
                value={nodeData.webhookUrl || ''}
                onChange={(e) =>
                  updateNodeData(id, { webhookUrl: e.target.value })
                }
                className="w-full bg-[#0A0C10] border border-zinc-800 rounded-xl pr-9 pl-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/60 font-mono"
              />
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">
              متوافق مع Zapier, Make, Slack, Discord, Telegram و REST APIs.
            </p>
          </div>

          <div className="flex items-center justify-between gap-2">
            <select
              value={nodeData.webhookMethod || 'POST'}
              onChange={(e) =>
                updateNodeData(id, { webhookMethod: e.target.value as any })
              }
              className="bg-[#0A0C10] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 font-mono focus:outline-none"
            >
              <option value="POST">POST</option>
              <option value="GET">GET</option>
            </select>

            <button
              type="button"
              onClick={handleTestWebhook}
              disabled={isTesting}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700/60 transition"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>جاري الإرسال...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  <span>اختبار الإرسال (Test Send)</span>
                </>
              )}
            </button>
          </div>

          {/* Test Status feedback */}
          {testResult && (
            <div
              className={`p-2 rounded-lg text-[11px] flex items-center gap-2 ${
                testResult.status >= 200 && testResult.status < 300
                  ? 'bg-emerald-950/40 border border-emerald-800/40 text-emerald-300'
                  : 'bg-rose-950/40 border border-rose-800/40 text-rose-300'
              }`}
            >
              {testResult.status >= 200 && testResult.status < 300 ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>{testResult.text}</span>
            </div>
          )}

          {/* Payload Summary */}
          {nodeData.output && (
            <div className="p-2.5 rounded-xl bg-[#0A0C10] border border-zinc-800 text-[10px] text-zinc-400 line-clamp-2 font-mono">
              Payload: {nodeData.output}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-1.5 border-t border-[var(--card-border)]/60">
          <span>إرسال وتكامل برمجي</span>
          <span className="text-[var(--text-subtle)] font-medium">HTTP Endpoint</span>
        </div>
      </NodeContainer>
    </div>
  );
});

WebhookOutputNode.displayName = 'WebhookOutputNode';
