'use client';

import React, { memo } from 'react';
import { Handle, NodeProps, useReactFlow } from '@xyflow/react';
import { Clock, Hourglass, Play, Loader2 } from 'lucide-react';
import { NodeContainer } from './NodeContainer';
import { WorkflowNodeData } from '@/types/workflow';
import { useHandlePositions } from '@/utils/useHandlePositions';

const QUICK_DURATIONS = [1, 2, 5, 10, 30];

export const DelayNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as WorkflowNodeData;
  const { updateNodeData } = useReactFlow();
  const { sourcePosition, targetPosition } = useHandlePositions();

  const seconds = Number(nodeData.delaySeconds || 2);
  const status = nodeData.status || 'idle';

  return (
    <div className="relative group">
      {/* Target handle */}
      <Handle
        type="target"
        position={targetPosition}
        id="input"
        className="!bg-amber-500 !border-zinc-900 !w-3.5 !h-3.5"
      />

      <NodeContainer
        nodeId={id}
        title={nodeData.label || 'مؤقت تأخير (Delay)'}
        category="Control Flow"
        icon={<Clock className="w-4 h-4 text-amber-400" />}
        status={status}
        accentColor="amber"
        width="w-[300px]"
        selected={selected}
        isCollapsed={nodeData.isCollapsed}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30">
              {seconds} ثانية
            </span>
            <label className="text-[11px] font-medium text-zinc-400 block text-right">
              مدة الانتظار:
            </label>
          </div>

          {/* Quick presets */}
          <div className="flex justify-between gap-1">
            {QUICK_DURATIONS.map((dur) => (
              <button
                key={dur}
                type="button"
                onClick={() => updateNodeData(id, { delaySeconds: dur })}
                className={`flex-1 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                  seconds === dur
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                {dur}s
              </button>
            ))}
          </div>

          {/* Slider */}
          <div>
            <input
              type="range"
              min={1}
              max={60}
              value={seconds}
              onChange={(e) =>
                updateNodeData(id, { delaySeconds: Number(e.target.value) })
              }
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-zinc-600 font-mono">
              <span>60s</span>
              <span>1s</span>
            </div>
          </div>

          {/* Running animation indicator with Live Countdown */}
          {status === 'running' && (
            <div className="flex items-center justify-between p-2.5 bg-amber-500/15 border border-amber-500/40 rounded-xl text-amber-300 text-xs font-semibold shadow-inner">
              <div className="flex items-center gap-2">
                <Hourglass className="w-4 h-4 animate-spin text-amber-400" />
                <span>جاري العد التنازلي...</span>
              </div>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-amber-500/25 border border-amber-500/50 text-amber-200 font-bold animate-pulse">
                {typeof nodeData.remainingSeconds === 'number'
                  ? `${nodeData.remainingSeconds} ث`
                  : `${seconds} ث`}
              </span>
            </div>
          )}
        </div>
      </NodeContainer>

      {/* Source handle */}
      <Handle
        type="source"
        position={sourcePosition}
        id="output"
        className="!bg-amber-500 !border-zinc-900 !w-3.5 !h-3.5"
      />
    </div>
  );
});

DelayNode.displayName = 'DelayNode';
