'use client';

import React, { memo } from 'react';
import { NodeProps, useReactFlow } from '@xyflow/react';
import { StickyNote, Trash2 } from 'lucide-react';
import { WorkflowNodeData } from '@/types/workflow';

export const NoteNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as WorkflowNodeData;
  const { setNodes, updateNodeData } = useReactFlow();

  const color = nodeData.noteColor || 'yellow';

  const getColorStyles = () => {
    switch (color) {
      case 'purple':
        return {
          bg: 'bg-purple-950/80 border-purple-600/50 text-purple-100',
          header: 'border-purple-800/60 bg-purple-900/40 text-purple-300',
          textarea: 'text-purple-100 placeholder-purple-400/50 focus:border-purple-400',
          badge: 'bg-purple-500',
        };
      case 'cyan':
        return {
          bg: 'bg-cyan-950/80 border-cyan-600/50 text-cyan-100',
          header: 'border-cyan-800/60 bg-cyan-900/40 text-cyan-300',
          textarea: 'text-cyan-100 placeholder-cyan-400/50 focus:border-cyan-400',
          badge: 'bg-cyan-500',
        };
      case 'emerald':
        return {
          bg: 'bg-emerald-950/80 border-emerald-600/50 text-emerald-100',
          header: 'border-emerald-800/60 bg-emerald-900/40 text-emerald-300',
          textarea: 'text-emerald-100 placeholder-emerald-400/50 focus:border-emerald-400',
          badge: 'bg-emerald-500',
        };
      default: // Yellow / Amber
        return {
          bg: 'bg-amber-950/80 border-amber-500/60 text-amber-100',
          header: 'border-amber-800/60 bg-amber-900/40 text-amber-300',
          textarea: 'text-amber-100 placeholder-amber-400/50 focus:border-amber-400',
          badge: 'bg-amber-400',
        };
    }
  };

  const styles = getColorStyles();

  const handleDelete = () => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
  };

  return (
    <div
      className={`w-64 rounded-2xl border-2 backdrop-blur-xl shadow-2xl transition-all duration-200 overflow-hidden font-sans ${
        styles.bg
      } ${selected ? 'ring-2 ring-sky-400/80 scale-[1.02]' : ''}`}
      dir="rtl"
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-3 py-1.5 border-b text-xs select-none ${styles.header}`}
      >
        <div className="flex items-center gap-1.5 font-bold">
          <StickyNote className="w-3.5 h-3.5" />
          <span>ملاحظة توثيقية</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Color Switchers */}
          <div className="flex items-center gap-1 bg-black/30 p-1 rounded-full">
            {(['yellow', 'purple', 'cyan', 'emerald'] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => updateNodeData(id, { noteColor: c })}
                className={`w-2.5 h-2.5 rounded-full transition-transform ${
                  c === 'yellow'
                    ? 'bg-amber-400'
                    : c === 'purple'
                    ? 'bg-purple-400'
                    : c === 'cyan'
                    ? 'bg-cyan-400'
                    : 'bg-emerald-400'
                } ${color === c ? 'scale-125 ring-1 ring-white' : 'opacity-70 hover:opacity-100'}`}
                title={`اللون ${c}`}
              />
            ))}
          </div>

          <button
            onClick={handleDelete}
            className="p-1 rounded text-slate-400 hover:text-rose-400 transition"
            title="حذف الملاحظة"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Note Body */}
      <div className="p-3">
        <textarea
          value={nodeData.noteText || ''}
          onChange={(e) => updateNodeData(id, { noteText: e.target.value })}
          placeholder="اكتب ملاحظاتك، شروحات للمخطط، أو توثيق خطوات السلسلة هنا..."
          rows={4}
          className={`w-full bg-transparent resize-y min-h-[70px] text-xs leading-relaxed focus:outline-none font-sans ${styles.textarea}`}
          dir="auto"
        />
      </div>
    </div>
  );
});

NoteNode.displayName = 'NoteNode';
