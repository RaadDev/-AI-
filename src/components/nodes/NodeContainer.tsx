'use client';

import React from 'react';
import { NodeExecutionStatus } from '@/types/workflow';
import {
  Circle,
  Play,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Pin,
  PinOff,
  AlertCircle,
} from 'lucide-react';
import { useReactFlow, useEdges, useNodes } from '@xyflow/react';

interface NodeContainerProps {
  nodeId?: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  status?: NodeExecutionStatus;
  accentColor?:
    | 'sky'
    | 'purple'
    | 'emerald'
    | 'amber'
    | 'rose'
    | 'pink'
    | 'violet'
    | 'cyan';
  children: React.ReactNode;
  width?: string;
  selected?: boolean;
  onRunSingle?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onOpenInspector?: () => void;
  isPinned?: boolean;
  onTogglePin?: () => void;
  compactMode?: boolean;
}

export const NodeContainer: React.FC<NodeContainerProps> = ({
  nodeId,
  title,
  category,
  icon,
  status = 'idle',
  accentColor = 'sky',
  children,
  width = 'w-[360px]',
  selected = false,
  onRunSingle,
  isCollapsed = false,
  onToggleCollapse,
  onDuplicate,
  onDelete,
  onOpenInspector,
  isPinned = false,
  onTogglePin,
  compactMode = false,
}) => {
  const { getNode, setNodes, updateNodeData } = useReactFlow();
  const edges = useEdges();
  const nodes = useNodes();

  // Find all upstream connected source nodes
  const incomingEdges = nodeId ? edges.filter((e) => e.target === nodeId) : [];
  const incomingData = incomingEdges.map((edge) => {
    const srcNode = nodes.find((n) => n.id === edge.source);
    const d = srcNode?.data as any;
    return {
      sourceId: edge.source,
      label: d?.label || srcNode?.id || 'عقدة سابقة',
    };
  });

  const handleToggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleCollapse) {
      onToggleCollapse();
    } else if (nodeId) {
      updateNodeData(nodeId, { isCollapsed: !isCollapsed });
    }
  };

  const handleTogglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTogglePin) {
      onTogglePin();
    } else if (nodeId) {
      updateNodeData(nodeId, { isPinned: !isPinned });
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDuplicate) {
      onDuplicate();
    } else if (nodeId) {
      const node = getNode(nodeId);
      if (node) {
        const newId = `node_${Date.now()}`;
        const newNode = {
          ...node,
          id: newId,
          position: {
            x: node.position.x + 40,
            y: node.position.y + 40,
          },
          selected: true,
          data: {
            ...node.data,
            label: `${(node.data as any)?.label || 'عقدة'} (نسخة)`,
            status: 'idle',
            output: '',
          },
        };
        setNodes((nds) =>
          nds.map((n) => ({ ...n, selected: false })).concat(newNode)
        );
      }
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    } else if (nodeId) {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    }
  };

  const handleRunSingle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRunSingle) {
      onRunSingle();
    } else if (nodeId) {
      window.dispatchEvent(
        new CustomEvent('promptflow:run-single-node', {
          detail: { nodeId },
        })
      );
    }
  };

  const handleOpenInspector = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (onOpenInspector) {
      onOpenInspector();
    } else if (nodeId) {
      window.dispatchEvent(
        new CustomEvent('promptflow:open-inspector', {
          detail: { nodeId },
        })
      );
    }
  };

  // State-based Minimalist Pill Badge with Pulsing Dot
  const getStatusIndicator = () => {
    switch (status) {
      case 'running':
        return (
          <span
            className="flex items-center gap-1.5 text-[10px] text-cyan-300 font-medium px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 whitespace-nowrap"
            title="جاري المعالجة..."
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400"></span>
            </span>
            <span>معالجة</span>
          </span>
        );
      case 'completed':
        return (
          <span
            className="flex items-center gap-1.5 text-[10px] text-emerald-300 font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 whitespace-nowrap"
            title="مكتمل بنجاح"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>مكتمل</span>
          </span>
        );
      case 'error':
        return (
          <span
            className="flex items-center gap-1.5 text-[10px] text-rose-300 font-medium px-2 py-0.5 rounded-full whitespace-nowrap bg-rose-500/10 border border-rose-500/20"
            title="حدث خطأ"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>خطأ</span>
          </span>
        );
      default:
        return (
          <span
            className="flex items-center gap-1 text-[10px] text-zinc-500 font-medium px-1"
            title="جاهز للتنفيذ"
          >
            <Circle className="w-1.5 h-1.5 fill-current opacity-30" />
          </span>
        );
    }
  };

  // Modern Studio Glass Glow & Ring Styling
  const getCardBorderAndGlow = () => {
    if (status === 'running') {
      return 'border-cyan-500/60 ring-2 ring-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.25)]';
    }
    if (selected) {
      return 'border-indigo-500/80 ring-2 ring-indigo-500/60 shadow-[0_0_25px_rgba(99,102,241,0.25)]';
    }
    if (status === 'completed') {
      return 'border-emerald-500/35 hover:border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.08)]';
    }
    if (status === 'error') {
      return 'border-rose-500/60 ring-1 ring-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.15)]';
    }
    return 'border border-white/[0.08] hover:border-white/15';
  };

  return (
    <div
      onDoubleClick={() => handleOpenInspector()}
      className={`group ${width} rounded-2xl transition-all duration-200 overflow-visible font-sans relative cursor-default bg-[#0B0F19]/90 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.45)] before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:rounded-t-2xl before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:pointer-events-none ${getCardBorderAndGlow()}`}
      dir="rtl"
    >
      {/* Node Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/[0.06] bg-white/[0.02] rounded-t-2xl select-none transition-colors">
        {/* Category Icon & Full Title */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-0.5">
          <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-200 shrink-0 shadow-sm">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="text-xs font-semibold text-zinc-100 truncate block leading-tight flex-1 min-w-0"
                title={title}
              >
                {title}
              </span>
              {isPinned && (
                <span
                  className="p-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[8px] shrink-0"
                  title="المخرجات مثبتة"
                >
                  <Pin className="w-2.5 h-2.5 inline fill-current" />
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions & Status Area */}
        <div className="flex items-center gap-1 shrink-0 mr-1">
          {/* Secondary actions: hidden by default, smoothly appear on node hover */}
          <div className="max-w-0 group-hover:max-w-[140px] overflow-hidden opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out flex items-center gap-0.5 pointer-events-none group-hover:pointer-events-auto">
            {/* Pin Output Toggle */}
            <button
              type="button"
              onClick={handleTogglePin}
              className={`p-1 rounded-lg transition shrink-0 ${
                isPinned
                  ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40'
                  : 'hover:bg-white/10 text-zinc-400 hover:text-amber-400'
              }`}
              title={isPinned ? 'إلغاء تثبيت المخرجات (Unpin)' : 'تثبيت المخرجات لمنع إعادة التشغيل (Pin)'}
            >
              {isPinned ? <Pin className="w-3.5 h-3.5 fill-current" /> : <PinOff className="w-3.5 h-3.5" />}
            </button>

            {/* Inspector Button */}
            <button
              type="button"
              onClick={handleOpenInspector}
              className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-indigo-300 transition shrink-0"
              title="توسيع التحرير وفحص العقدة (Inspector)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {/* Duplicate Button */}
            <button
              type="button"
              onClick={handleDuplicate}
              className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-zinc-200 transition shrink-0"
              title="مضاعفة العقدة (Duplicate)"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            {/* Collapse / Expand Button */}
            <button
              type="button"
              onClick={handleToggleCollapse}
              className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-zinc-200 transition shrink-0"
              title={isCollapsed ? 'توسيع العقدة' : 'طي العقدة'}
            >
              {isCollapsed ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Delete Button */}
            <button
              type="button"
              onClick={handleDelete}
              className="p-1 rounded-lg hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition shrink-0"
              title="حذف العقدة (Delete)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <div className="h-3 w-px bg-white/10 mx-0.5 shrink-0" />
          </div>

          {/* Status Indicator (always visible) */}
          <div className="px-0.5">{getStatusIndicator()}</div>

          {/* Single Node Quick Run Button (always visible) */}
          <button
            type="button"
            onClick={handleRunSingle}
            disabled={status === 'running'}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-indigo-400 transition disabled:opacity-40"
            title="تشغيل هذه العقدة منفردة (Run Single ▶️)"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>
      </div>

      {/* Direct Error Banner if node execution encountered error */}
      {status === 'error' && (() => {
        const currNode = nodeId ? nodes.find((n) => n.id === nodeId) : null;
        const d = (currNode?.data as any) || {};
        const errMsg = d.errorMessage;
        const isKeyErr = Boolean(d.missingKey || errMsg?.includes('مفتاح'));
        if (!errMsg) return null;

        if (isKeyErr) {
          return (
            <div className="px-3.5 py-2 bg-amber-500/15 border-b border-amber-500/30 text-amber-200 text-[11px] flex items-center justify-between gap-2 animate-fadeIn" dir="rtl">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <span className="text-sm shrink-0 leading-none">🔑</span>
                <span className="truncate leading-tight font-medium" title={errMsg}>
                  {errMsg}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  window.dispatchEvent(
                    new CustomEvent('promptflow:open-settings', {
                      detail: { tab: 'keys', focusKey: d.requiredProvider || 'gemini' },
                    })
                  );
                }}
                className="px-2 py-0.5 rounded-md bg-amber-500/25 hover:bg-amber-500/40 text-amber-100 text-[10px] font-bold border border-amber-500/40 shrink-0 transition"
              >
                إدخال المفتاح ⚙️
              </button>
            </div>
          );
        }

        const displayError = errMsg
          ? errMsg.length > 45
            ? `${errMsg.slice(0, 42)}...`
            : errMsg
          : 'خطأ في الاستجابة';
        return (
          <div className="px-3 py-1.5 bg-rose-500/15 border-b border-rose-500/30 text-rose-200 text-[11px] flex items-center justify-between gap-2 animate-fadeIn" dir="rtl">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="truncate leading-tight font-medium text-[11px]" title={errMsg}>{displayError}</span>
            </div>
            <button
              type="button"
              onClick={handleRunSingle}
              className="px-2 py-0.5 rounded-lg bg-rose-500/25 hover:bg-rose-500/40 text-rose-100 hover:text-white text-[10px] font-bold border border-rose-500/40 shrink-0 transition flex items-center gap-1 shadow-sm whitespace-nowrap active:scale-95"
              title="إعادة تشغيل هذه العقدة فوراً"
            >
              <span>⚡</span>
              <span>إعادة المحاولة</span>
            </button>
          </div>
        );
      })()}

      {/* Sleek, Minimalist Horizontal Context Ribbon */}
      {incomingData.length > 0 && !isCollapsed && (
        <div className="px-3 py-1 bg-white/[0.02] border-b border-white/[0.05] text-[10px] flex items-center justify-between text-zinc-400 select-none">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-indigo-400 shrink-0">🔗</span>
            <span className="truncate">
              سياق مستلم من:{' '}
              <span className="text-zinc-200 font-medium">
                {Array.from(new Set(incomingData.map((i) => i.label))).join('، ')}
              </span>
            </span>
          </div>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shrink-0 font-mono">
            متصل
          </span>
        </div>
      )}

      {/* Node Body */}
      {!isCollapsed ? (
        <div className={`p-3.5 space-y-3 ${compactMode ? 'max-h-56 overflow-hidden' : ''}`}>
          {children}
        </div>
      ) : (
        <div
          className="px-3.5 py-2 text-[10px] text-zinc-400 bg-white/[0.02] text-center cursor-pointer hover:text-zinc-200 transition"
          onClick={handleToggleCollapse}
        >
          عقدة مطوية • انقر للتوسيع
        </div>
      )}
    </div>
  );
};

export default NodeContainer;
