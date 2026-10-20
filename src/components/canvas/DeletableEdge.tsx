'use client';

import React, { useState, useId } from 'react';
import {
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  useReactFlow,
} from '@xyflow/react';
import { X } from 'lucide-react';

export const DeletableEdge: React.FC<EdgeProps> = ({
  id,
  source,
  sourceHandleId,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  selected,
}) => {
  const { setEdges, getNode } = useReactFlow();
  const [isHovered, setIsHovered] = useState(false);
  const reactId = useId().replace(/:/g, '');
  const gradientId = `edge-grad-${reactId}-${id.replace(/[^a-zA-Z0-9-_]/g, '_')}`;

  // Smooth Bezier path calculation for natural fluid curves
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.28,
  });

  const sourceNode = getNode(source);
  const sourceType = sourceNode?.type;
  const sourceStatus = (sourceNode?.data as any)?.status;
  const isRunning = sourceStatus === 'running';
  const isCompleted = sourceStatus === 'completed';

  // Determine dynamic gradient palette based on state and source type
  const getGradientColors = () => {
    if (sourceHandleId === 'false') {
      return { start: '#f43f5e', end: '#fb7185', particle: '#f43f5e' }; // Rose (False)
    }
    if (sourceHandleId === 'true') {
      return { start: '#10b981', end: '#34d399', particle: '#34d399' }; // Emerald (True)
    }
    if (isRunning) {
      return { start: '#06b6d4', end: '#c084fc', particle: '#38bdf8' }; // Electric Cyan to Neon Purple
    }
    if (isCompleted) {
      return { start: '#10b981', end: '#06b6d4', particle: '#34d399' }; // Emerald to Cyan
    }

    switch (sourceType) {
      case 'textInput':
      case 'urlScraper':
        return { start: '#38bdf8', end: '#818cf8', particle: '#38bdf8' }; // Sky to Indigo
      case 'fileUpload':
        return { start: '#10b981', end: '#38bdf8', particle: '#10b981' }; // Emerald to Sky
      case 'textAI':
      case 'toneRewriter':
        return { start: '#a855f7', end: '#6366f1', particle: '#c084fc' }; // Purple to Indigo
      case 'jsonExtractor':
      case 'structuredOutput':
        return { start: '#06b6d4', end: '#3b82f6', particle: '#22d3ee' }; // Cyan to Blue
      case 'imageAI':
        return { start: '#ec4899', end: '#8b5cf6', particle: '#f472b6' }; // Pink to Violet
      case 'audioVoice':
        return { start: '#8b5cf6', end: '#d946ef', particle: '#c084fc' }; // Violet to Fuchsia
      case 'httpRequest':
        return { start: '#14b8a6', end: '#06b6d4', particle: '#2dd4bf' }; // Teal to Cyan
      case 'conditional':
        return { start: '#f59e0b', end: '#fbbf24', particle: '#f59e0b' }; // Amber
      default:
        return { start: '#38bdf8', end: '#a855f7', particle: '#67e8f9' }; // Cyan to Purple
    }
  };

  const colors = getGradientColors();

  // Edge label pill content
  const getBadgeLabel = () => {
    if (sourceHandleId === 'false') return 'خطأ ✕';
    if (sourceHandleId === 'true') return 'صواب ✓';

    switch (sourceType) {
      case 'textInput':
      case 'urlScraper':
        return 'نص 📝';
      case 'fileUpload':
        return 'مستند 📄';
      case 'textAI':
      case 'toneRewriter':
        return 'سياق 🔗';
      case 'jsonExtractor':
      case 'structuredOutput':
        return 'JSON ⚡';
      case 'imageAI':
        return 'صورة 🎨';
      case 'audioVoice':
        return 'صوت 🎙️';
      case 'webSearch':
        return 'بحث 🌐';
      case 'httpRequest':
        return 'API 📡';
      default:
        return 'سياق 🔗';
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer select-none"
    >
      <defs>
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1={sourceX}
          y1={sourceY}
          x2={targetX}
          y2={targetY}
        >
          <stop offset="0%" stopColor={colors.start} />
          <stop offset="100%" stopColor={colors.end} />
        </linearGradient>
      </defs>

      {/* 1. Ambient Glow Path */}
      <path
        d={edgePath}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={selected || isHovered ? 7 : isRunning ? 6 : 4}
        strokeOpacity={selected || isHovered ? 0.38 : isRunning ? 0.28 : 0.12}
        strokeLinecap="round"
        style={{
          filter: 'blur(3px)',
          transition: 'stroke-width 0.2s ease, stroke-opacity 0.2s ease',
        }}
      />

      {/* 2. Core Crisp Gradient Path */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={
          selected
            ? '#818cf8'
            : isHovered
            ? '#f43f5e'
            : `url(#${gradientId})`
        }
        strokeWidth={selected || isHovered ? 2.5 : 2}
        strokeLinecap="round"
        style={{
          ...style,
          transition: 'stroke 0.2s ease, stroke-width 0.2s ease',
        }}
      />

      {/* 3. Animated Light Particles (Streaming Data Flow) */}
      <circle
        r={isRunning ? 3.5 : 2.5}
        fill={colors.particle}
        className="pointer-events-none"
        style={{
          filter: `drop-shadow(0 0 6px ${colors.particle})`,
        }}
      >
        <animateMotion
          dur={isRunning ? '1.6s' : '3.2s'}
          repeatCount="indefinite"
          path={edgePath}
        />
      </circle>

      {(isRunning || selected) && (
        <circle
          r={isRunning ? 3 : 2}
          fill={colors.end}
          className="pointer-events-none"
          style={{
            filter: `drop-shadow(0 0 6px ${colors.end})`,
          }}
        >
          <animateMotion
            dur={isRunning ? '1.6s' : '3.2s'}
            begin={isRunning ? '0.8s' : '1.6s'}
            repeatCount="indefinite"
            path={edgePath}
          />
        </circle>
      )}

      {/* 4. Wide Invisible Hit Area for Easy Mouse Detection */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={28}
        className="cursor-pointer"
      />

      {/* 5. Center Interactive Edge Badge & Quick Delete Button */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full backdrop-blur-xl transition-all duration-200 select-none shadow-lg ${
              selected
                ? 'bg-[#0B0F19]/95 border border-indigo-500/80 text-indigo-300 shadow-indigo-500/20'
                : isHovered
                ? 'bg-[#0B0F19]/95 border border-white/20 text-white shadow-black/70 scale-105'
                : 'bg-[#0B0F19]/80 border border-white/[0.08] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="text-[10px] font-medium tracking-tight">
              {getBadgeLabel()}
            </span>

            {isHovered && (
              <button
                type="button"
                onClick={handleDelete}
                className="w-4 h-4 rounded-full bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white flex items-center justify-center transition-all duration-150 shrink-0 shadow-sm hover:scale-110 active:scale-95"
                title="حذف هذا الرابط (✕)"
              >
                <X className="w-2.5 h-2.5 stroke-[3]" />
              </button>
            )}
          </div>
        </div>
      </EdgeLabelRenderer>
    </g>
  );
};

export default DeletableEdge;
