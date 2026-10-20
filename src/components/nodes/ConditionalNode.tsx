'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { GitBranch, CheckCircle2, XCircle, Filter } from 'lucide-react';
import { NodeContainer } from './NodeContainer';
import { WorkflowNodeData } from '@/types/workflow';
import { useHandlePositions } from '@/utils/useHandlePositions';

export const ConditionalNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as WorkflowNodeData;
  const { updateNodeData } = useReactFlow();
  const { targetPosition, sourcePosition, isHorizontal } = useHandlePositions();

  const conditionType = nodeData.conditionType || 'contains';
  const conditionValue = nodeData.conditionValue || 'ذكاء اصطناعي';
  const conditionResult = nodeData.conditionResult;

  return (
    <div className="relative group">
      {/* Input Handle from upstream */}
      <Handle
        type="target"
        position={targetPosition}
        id="input"
        className="!bg-amber-400 !border-slate-900 !w-3.5 !h-3.5"
      />

      <NodeContainer
        nodeId={id}
        title={nodeData.label || 'عقدة شرطية (If / Else)'}
        category="Logic"
        icon={<GitBranch className="w-4 h-4 text-amber-400" />}
        status={nodeData.status}
        accentColor="amber"
        width="w-[360px]"
        selected={selected}
        isCollapsed={nodeData.isCollapsed}
      >
        <div className="space-y-3">
          {/* Condition Type Selection */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400 block text-right">
              نوع الشرط:
            </label>
            <select
              value={conditionType}
              onChange={(e) =>
                updateNodeData(id, { conditionType: e.target.value as any })
              }
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="contains" className="bg-slate-900 text-white">
                يحتوي على الكلمة / النص
              </option>
              <option value="notContains" className="bg-slate-900 text-white">
                لا يحتوي على الكلمة
              </option>
              <option value="wordsGreaterThan" className="bg-slate-900 text-white">
                عدد الكلمات أكبر من ( {'>'} )
              </option>
              <option value="charsGreaterThan" className="bg-slate-900 text-white">
                عدد الأحرف أكبر من ( {'>'} )
              </option>
            </select>
          </div>

          {/* Condition Value Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400 block text-right">
              القيمة المقارنة:
            </label>
            <input
              type="text"
              value={conditionValue}
              onChange={(e) =>
                updateNodeData(id, { conditionValue: e.target.value })
              }
              placeholder="مثال: ذكاء اصطناعي أو 100"
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono text-left"
            />
          </div>

          {/* Live Condition Evaluation Result */}
          {conditionResult !== undefined && (
            <div
              className={`p-2 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                conditionResult
                  ? 'bg-emerald-950/50 border-emerald-800/60 text-emerald-300'
                  : 'bg-rose-950/50 border-rose-800/60 text-rose-300'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {conditionResult ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>تحقق الشرط: مسار True نشط</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>لم يتحقق الشرط: مسار False نشط</span>
                  </>
                )}
              </span>
              <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-900/60">
                {conditionResult ? 'TRUE' : 'FALSE'}
              </span>
            </div>
          )}
        </div>

        {/* Port Indicators footer */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/60 font-mono">
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            True (يمين)
          </span>
          <span className="text-rose-400 flex items-center gap-1">
            False (يسار)
            <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
          </span>
        </div>
      </NodeContainer>

      {/* Output Handles: True and False */}
      <Handle
        type="source"
        position={sourcePosition}
        id="true"
        style={isHorizontal ? { top: '35%' } : { left: '70%' }}
        className="!bg-emerald-400 !border-slate-900 !w-3.5 !h-3.5"
        title="مخرج الشرط: True"
      />
      <Handle
        type="source"
        position={sourcePosition}
        id="false"
        style={isHorizontal ? { top: '65%' } : { left: '30%' }}
        className="!bg-rose-500 !border-slate-900 !w-3.5 !h-3.5"
        title="مخرج الشرط: False"
      />
    </div>
  );
});

ConditionalNode.displayName = 'ConditionalNode';
