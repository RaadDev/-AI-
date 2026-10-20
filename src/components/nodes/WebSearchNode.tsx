'use client';

import React, { memo } from 'react';
import { Handle, NodeProps, useReactFlow } from '@xyflow/react';
import { Globe, Search, ExternalLink, Loader2, Sparkles, Sliders } from 'lucide-react';
import { NodeContainer } from './NodeContainer';
import { WorkflowNodeData } from '@/types/workflow';
import { useHandlePositions } from '@/utils/useHandlePositions';

export const WebSearchNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as WorkflowNodeData;
  const { updateNodeData } = useReactFlow();
  const { targetPosition, sourcePosition } = useHandlePositions();

  const isRunning = nodeData.status === 'running';
  const results = nodeData.searchResults || [];

  return (
    <div className="relative group">
      {/* Upstream input query */}
      <Handle
        type="target"
        position={targetPosition}
        id="query"
        className="!bg-cyan-500 !border-zinc-900 !w-3.5 !h-3.5"
      />

      <NodeContainer
        nodeId={id}
        title={nodeData.label || 'بحث الويب المباشر (Web Search)'}
        category="Search & Intel"
        icon={<Globe className="w-4 h-4 text-cyan-400" />}
        status={nodeData.status}
        accentColor="cyan"
        width="w-[340px]"
        selected={selected}
        isCollapsed={nodeData.isCollapsed}
      >
        <div className="space-y-3">
          {/* Query input */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-400 block text-right">
              كلمة البحث أو الموضوع (Search Query):
            </label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="اترك فارغاً لاستخدام المدخل من العقدة السابقة..."
                value={nodeData.searchQuery || ''}
                onChange={(e) =>
                  updateNodeData(id, { searchQuery: e.target.value })
                }
                className="w-full bg-[#0A0C10] border border-zinc-800 rounded-xl pr-9 pl-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/60"
                dir="auto"
              />
            </div>
          </div>

          {/* Engine & Count */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">
                نطاق البحث:
              </label>
              <select
                value={nodeData.searchEngine || 'all'}
                onChange={(e) =>
                  updateNodeData(id, { searchEngine: e.target.value as any })
                }
                className="w-full bg-[#0A0C10] border border-zinc-800 rounded-lg px-2 py-1.5 text-zinc-300 text-[11px] focus:outline-none"
              >
                <option value="all">الويب بالكامل (All Web)</option>
                <option value="news">أحدث الأخبار (Latest News)</option>
                <option value="academic">أكاديمي وتقني (Tech & Papers)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">
                عدد النتائج:
              </label>
              <select
                value={nodeData.maxResults || 3}
                onChange={(e) =>
                  updateNodeData(id, { maxResults: parseInt(e.target.value, 10) })
                }
                className="w-full bg-[#0A0C10] border border-zinc-800 rounded-lg px-2 py-1.5 text-zinc-300 text-[11px] focus:outline-none"
              >
                <option value={2}>2 مصادر</option>
                <option value={3}>3 مصادر (موصى به)</option>
                <option value={5}>5 مصادر شاملة</option>
              </select>
            </div>
          </div>

          {/* Output Search Results Preview */}
          {isRunning ? (
            <div className="p-4 rounded-xl bg-[#0A0C10] border border-cyan-500/30 flex items-center justify-center gap-2 text-xs text-cyan-300">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>جاري استرجاع وفلترة نتائج الويب...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              <div className="text-[10px] text-zinc-400 font-semibold">
                تم العثور على ({results.length}) نتائج حديثة:
              </div>
              {results.map((r, i) => (
                <div
                  key={`${r.url || r.title || i}`}
                  className="p-2 rounded-lg bg-[#0A0C10] border border-zinc-800/80 space-y-1 text-right"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-cyan-300 truncate">
                      {r.title}
                    </span>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-500 hover:text-cyan-400 transition"
                      title="فتح الرابط الخارجي"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {r.snippet}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            nodeData.output && (
              <div className="p-2.5 rounded-xl bg-[#0A0C10] border border-zinc-800 text-[11px] text-zinc-300 line-clamp-3 leading-relaxed">
                {nodeData.output}
              </div>
            )
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-1.5 border-t border-[var(--card-border)]/60">
          <span>بحث واستخراج ذكي</span>
          <span className="text-[var(--text-subtle)] font-medium">نتائج الويب المباشرة</span>
        </div>
      </NodeContainer>

      {/* Downstream output */}
      <Handle
        type="source"
        position={sourcePosition}
        id="output"
        className="!bg-cyan-400 !border-zinc-900 !w-3.5 !h-3.5"
      />
    </div>
  );
});

WebSearchNode.displayName = 'WebSearchNode';
