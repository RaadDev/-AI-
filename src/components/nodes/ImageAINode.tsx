'use client';

import React, { memo } from 'react';
import { Handle, NodeProps, useReactFlow, useEdges, useNodes } from '@xyflow/react';
import { ImageIcon, Layers, Download, ExternalLink, CheckCircle2, Sparkles } from 'lucide-react';
import { NodeContainer } from './NodeContainer';
import { WorkflowNodeData } from '@/types/workflow';
import { useHandlePositions } from '@/utils/useHandlePositions';
import { IMAGE_MODELS, DEFAULT_IMAGE_MODEL } from '@/config/models';
import { ModelSelectorDropdown } from './ModelSelectorDropdown';

export const ImageAINode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as WorkflowNodeData;
  const { updateNodeData } = useReactFlow();
  const edges = useEdges();
  const nodes = useNodes();
  const { targetPosition, sourcePosition } = useHandlePositions();

  const incoming = edges.filter((e) => e.target === id);
  const upstreamTexts = incoming
    .map((edge) => {
      const src = nodes.find((n) => n.id === edge.source);
      const d = src?.data as any;
      return d?.output ?? d?.text ?? '';
    })
    .filter(Boolean);

  const latestUpstreamText = upstreamTexts.join(' ').replace(/[#*`_~]/g, '').trim();
  const hasUpstreamContext = incoming.length > 0;

  return (
    <div className="relative group">
      {/* Input Handle for prompt from upstream */}
      <Handle
        type="target"
        position={targetPosition}
        id="prompt"
        className="!bg-pink-500 !border-slate-900 !w-3.5 !h-3.5"
      />

      <NodeContainer
        nodeId={id}
        title={nodeData.label || 'توليد الصور بالذكاء الاصطناعي'}
        category="Image AI"
        icon={<ImageIcon className="w-4 h-4 text-pink-400" />}
        status={nodeData.status}
        accentColor="pink"
        width="w-[360px]"
        selected={selected}
        isCollapsed={nodeData.isCollapsed}
      >
        <div className="space-y-2.5">
          {/* Engine Selector */}
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-medium text-slate-400">محرك الرسم:</label>
            <ModelSelectorDropdown
              selectedModelId={nodeData.model || DEFAULT_IMAGE_MODEL}
              onSelectModel={(modelId) => {
                updateNodeData(id, { model: modelId });
              }}
              category="image"
            />
          </div>

          {/* Live Upstream Context Preview */}
          {hasUpstreamContext && (
            <div className="p-2 rounded-xl bg-pink-500/10 border border-pink-500/25 text-[10px] space-y-1">
              <div className="flex items-center justify-between text-pink-300 font-semibold">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-pink-400" />
                  السياق الفعلي المستلم من العقدة السابقة:
                </span>
                <span className="text-[9px] bg-pink-500/20 px-1.5 py-0.2 rounded text-pink-300 font-mono">
                  {latestUpstreamText ? 'محدث ⚡' : 'بانتظار المخرجات'}
                </span>
              </div>
              <p className="text-zinc-300 leading-relaxed font-mono line-clamp-2 bg-black/40 p-1.5 rounded-lg border border-pink-500/15 select-text">
                {latestUpstreamText
                  ? `“${latestUpstreamText.slice(0, 100)}${latestUpstreamText.length > 100 ? '...' : ''}”`
                  : 'لم يتم توليد مخرجات من العقدة السابقة بعد.'}
              </p>
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-slate-400 block text-right">
                أمر ونمط الصورة (Prompt):
              </label>
              {hasUpstreamContext && (
                <span className="text-[10px] text-pink-400/90 font-medium">
                  يُشتق آلياً من سياق العقدة ⚡
                </span>
              )}
            </div>
            <textarea
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500 resize-none leading-relaxed"
              rows={2}
              placeholder={
                hasUpstreamContext
                  ? 'يتم توليد الوصف واستخلاص موضوع الصورة آلياً من العقدة السابقة، أو حدد نمطك هنا...'
                  : 'مثال: إضاءة استوديو سينمائية، دقة 8k، صورة واقعية فاخرة...'
              }
              value={nodeData.imagePrompt || ''}
              onChange={(e) => {
                updateNodeData(id, { imagePrompt: e.target.value });
              }}
              dir="auto"
            />
          </div>

          {/* Generated Image Preview */}
          {nodeData.imageUrl && (
            <div className="relative group/img rounded-xl overflow-hidden border border-zinc-800/80 bg-zinc-950 aspect-video flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={nodeData.imageUrl}
                alt="AI Generated"
                className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end justify-between p-2">
                <span className="text-[10px] text-white/90 font-mono">1024x1024</span>
                <div className="flex gap-1">
                  <a
                    href={nodeData.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded-lg bg-zinc-800/80 text-white hover:bg-zinc-700 border border-zinc-700/50 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={nodeData.imageUrl}
                    download="generated-image.jpg"
                    className="p-1 rounded-lg bg-zinc-800/80 text-white hover:bg-zinc-700 border border-zinc-700/50 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </NodeContainer>

      {/* Output Handle */}
      <Handle
        type="source"
        position={sourcePosition}
        id="output"
        className="!bg-pink-400 !border-slate-900 !w-3.5 !h-3.5"
      />
    </div>
  );
});

ImageAINode.displayName = 'ImageAINode';
