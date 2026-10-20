'use client';

import React, { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Magnet,
  ArrowDownUp,
  Map,
  Sparkles,
  Wand2,
  Loader2,
  X,
} from 'lucide-react';

interface FloatingBottomDockProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  isLocked?: boolean;
  onToggleLock?: () => void;
  snapToGrid: boolean;
  onToggleSnapToGrid: () => void;
  onAutoLayout: (direction: 'TB' | 'LR' | 'RL') => void;
  onUndo?: () => void;
  canUndo?: boolean;
  onRedo?: () => void;
  canRedo?: boolean;
  showMiniMap?: boolean;
  onToggleMiniMap?: () => void;
  onGenerateWorkflow?: (prompt: string) => Promise<void> | void;
  isGeneratingWorkflow?: boolean;
}

export const FloatingBottomDock: React.FC<FloatingBottomDockProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onFitView,
  snapToGrid,
  onToggleSnapToGrid,
  onAutoLayout,
  showMiniMap = true,
  onToggleMiniMap,
  onGenerateWorkflow,
  isGeneratingWorkflow = false,
}) => {
  const [askPrompt, setAskPrompt] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const zoomPercent = Math.round(zoom * 100);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!askPrompt.trim() || isGeneratingWorkflow || !onGenerateWorkflow) return;
    onGenerateWorkflow(askPrompt.trim());
    setAskPrompt('');
    setIsFocused(false);
  };

  return (
    <div
      className={`h-11 px-3 py-1 rounded-2xl md:rounded-full backdrop-blur-2xl border transition-all duration-300 shadow-2xl flex items-center gap-2 select-none text-xs font-sans max-w-[94vw] ${
        isFocused
          ? 'bg-[#0C0F19]/95 border-indigo-500/70 shadow-2xl shadow-indigo-500/15 ring-2 ring-indigo-500/20'
          : 'bg-[#0B0E17]/90 border-white/10 shadow-2xl ring-1 ring-white/5 hover:border-white/20'
      }`}
      dir="rtl"
    >
      {/* 1. Natural Language Ask AI / Copilot Input */}
      {onGenerateWorkflow && (
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 flex-1 min-w-[220px] sm:min-w-[300px] md:min-w-[360px]"
        >
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
          </div>
          <input
            type="text"
            value={askPrompt}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setAskPrompt(e.target.value)}
            placeholder="اطلب من المساعد الذكي (Copilot) بناء مسار أو إضافة عقد..."
            disabled={isGeneratingWorkflow}
            className="flex-1 bg-transparent border-none text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none leading-tight"
          />
          {askPrompt && (
            <button
              type="button"
              onClick={() => setAskPrompt('')}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 transition shrink-0 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <button
            type="submit"
            disabled={!askPrompt.trim() || isGeneratingWorkflow}
            className="p-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-30 text-white transition active:scale-95 shrink-0 shadow-md shadow-indigo-600/30 cursor-pointer"
            title="توليد المسار بالذكاء الاصطناعي (Enter)"
          >
            {isGeneratingWorkflow ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Wand2 className="w-3.5 h-3.5" />
            )}
          </button>
        </form>
      )}

      {/* Subtle Vertical Divider */}
      <div className="h-5 w-px bg-white/10 mx-0.5 shrink-0" />

      {/* 2. Compact Canvas Tools (Left Side in RTL) */}
      <div className="flex items-center gap-1 shrink-0 text-zinc-400">
        {/* Zoom Out */}
        <button
          type="button"
          onClick={onZoomOut}
          className="p-1 rounded-md hover:text-white hover:bg-white/[0.06] transition"
          title="تصغير"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        {/* Zoom Percentage / Fit View */}
        <button
          type="button"
          onClick={onFitView}
          className="px-1.5 py-0.5 rounded-md hover:text-white hover:bg-white/[0.06] font-mono text-[11px] text-zinc-300 transition"
          title="ملاءمة الشاشة (Fit View)"
        >
          {zoomPercent}%
        </button>

        {/* Zoom In */}
        <button
          type="button"
          onClick={onZoomIn}
          className="p-1 rounded-md hover:text-white hover:bg-white/[0.06] transition"
          title="تكبير"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <div className="h-3 w-px bg-white/[0.06] mx-0.5 shrink-0" />

        {/* Auto Layout */}
        <button
          type="button"
          onClick={() => onAutoLayout('TB')}
          className="p-1 rounded-md hover:text-white hover:bg-white/[0.06] transition"
          title="ترتيب تلقائي للمسار (Auto Layout)"
        >
          <ArrowDownUp className="w-3.5 h-3.5" />
        </button>

        {/* Snap to Grid */}
        <button
          type="button"
          onClick={onToggleSnapToGrid}
          className={`p-1 rounded-md transition ${
            snapToGrid
              ? 'text-indigo-400 bg-indigo-500/10'
              : 'hover:text-white hover:bg-white/[0.06]'
          }`}
          title={snapToGrid ? 'إلغاء المحاذاة للشبكة' : 'تفعيل المحاذاة للشبكة'}
        >
          <Magnet className="w-3.5 h-3.5" />
        </button>

        {/* MiniMap Toggle */}
        {onToggleMiniMap && (
          <button
            type="button"
            onClick={onToggleMiniMap}
            className={`p-1 rounded-md transition ${
              showMiniMap
                ? 'text-indigo-400 bg-indigo-500/10'
                : 'hover:text-white hover:bg-white/[0.06]'
            }`}
            title={showMiniMap ? 'إخفاء الخريطة المصغرة' : 'إظهار الخريطة المصغرة'}
          >
            <Map className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
