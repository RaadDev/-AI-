'use client';

import React, { memo, useState } from 'react';
import { Handle, NodeProps, useReactFlow } from '@xyflow/react';
import { Globe, ArrowDownCircle, Check, Loader2, AlertCircle, Copy, Video } from 'lucide-react';
import { NodeContainer } from './NodeContainer';
import { WorkflowNodeData } from '@/types/workflow';
import { useHandlePositions } from '@/utils/useHandlePositions';

export const UrlScraperNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as WorkflowNodeData;
  const { updateNodeData } = useReactFlow();
  const { sourcePosition } = useHandlePositions();

  const [url, setUrl] = useState(nodeData.url || '');
  const [isScraping, setIsScraping] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');

  const handleScrape = async () => {
    if (!url.trim()) {
      setErrorMsg('يرجى كتابة أو لصق رابط أولاً');
      return;
    }

    setIsScraping(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'تعذر سحب المحتوى من هذا الرابط');
      }

      updateNodeData(id, {
        url: url.trim(),
        output: json.text,
        status: 'completed',
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل سحب المحتوى');
      updateNodeData(id, {
        status: 'error',
        errorMessage: err.message,
      });
    } finally {
      setIsScraping(false);
    }
  };

  const handleCopy = () => {
    if (nodeData.output) {
      navigator.clipboard.writeText(nodeData.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="relative group">
      <NodeContainer
        nodeId={id}
        title={nodeData.label || 'سحب رابط / يوتيوب'}
        category="Input"
        icon={
          isYoutube ? (
            <Video className="w-4 h-4 text-rose-400" />
          ) : (
            <Globe className="w-4 h-4 text-cyan-400" />
          )
        }
        status={nodeData.status}
        accentColor="sky"
        width="w-[360px]"
        selected={selected}
        isCollapsed={nodeData.isCollapsed}
      >
        <div className="space-y-2.5">
          <label className="text-[11px] font-medium text-slate-400 block text-right">
            رابط المقال أو فيديو اليوتيوب:
          </label>
          <div className="flex gap-1.5">
            <input
              type="url"
              className="flex-1 bg-slate-950/70 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-left font-mono"
              placeholder="https://example.com/article"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                updateNodeData(id, { url: e.target.value });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleScrape();
                }
              }}
            />
            <button
              onClick={handleScrape}
              disabled={isScraping || !url.trim()}
              className="px-3 py-1.5 bg-zinc-800/80 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 border border-zinc-700/50 rounded-xl text-xs flex items-center gap-1 transition-colors font-medium shrink-0 shadow-sm"
              title="سحب المحتوى الفعلي"
            >
              {isScraping ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ArrowDownCircle className="w-3.5 h-3.5" />
              )}
              <span>{isScraping ? 'سحب...' : 'سحب'}</span>
            </button>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-[11px]">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {nodeData.output && (
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-[11px] text-zinc-300">
                <span className="font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> تم سحب المحتوى:
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  {copied ? 'تم النسخ' : 'نسخ'}
                </button>
              </div>
              <div
                className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-2.5 max-h-28 overflow-y-auto text-[11px] text-zinc-200 leading-relaxed font-mono whitespace-pre-wrap select-text"
                dir="auto"
              >
                {nodeData.output}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-1.5 border-t border-[var(--card-border)]/60">
          <span>{isYoutube ? 'تفريغ يوتيوب ذكي' : 'استخراج نص نقي'}</span>
          <span className="text-[var(--text-subtle)] font-medium">
            {nodeData.output ? `${nodeData.output.length} حرف` : 'جاهز للتمرير'}
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
    </div>
  );
});

UrlScraperNode.displayName = 'UrlScraperNode';
