'use client';

import React, { memo } from 'react';
import { Handle, NodeProps, useReactFlow } from '@xyflow/react';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { NodeContainer } from './NodeContainer';
import { WorkflowNodeData } from '@/types/workflow';
import { useHandlePositions } from '@/utils/useHandlePositions';

export const TestAssertionNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as WorkflowNodeData;
  const { updateNodeData } = useReactFlow();
  const { sourcePosition, targetPosition } = useHandlePositions();

  const status = nodeData.status || 'idle';
  const assertionType = nodeData.assertionType || 'notEmpty';
  const passed = typeof nodeData.assertionPassed === 'boolean' ? nodeData.assertionPassed : undefined;
  const message = typeof nodeData.assertionMessage === 'string' ? nodeData.assertionMessage : '';

  return (
    <div className="relative group">
      {/* Target handle */}
      <Handle
        type="target"
        position={targetPosition}
        id="input"
        className="!bg-emerald-500 !border-zinc-900 !w-3.5 !h-3.5"
      />

      <NodeContainer
        nodeId={id}
        title={nodeData.label || 'فحص واختبار (Assertion)'}
        category="Testing & Debug"
        icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
        status={status}
        accentColor={passed === false ? 'rose' : 'emerald'}
        width="w-[340px]"
        selected={selected}
        isCollapsed={nodeData.isCollapsed}
      >
        <div className="space-y-3">
          {/* Assertion Type */}
          <div>
            <label className="text-[11px] font-medium text-zinc-400 block text-right mb-1">
              معيار التحقق (Assertion Type):
            </label>
            <select
              value={assertionType}
              onChange={(e) =>
                updateNodeData(id, { assertionType: e.target.value as any })
              }
              className="w-full bg-[#0A0C10] border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/60"
            >
              <option value="notEmpty">التحقق أن المخرجات غير فارغة (Not Empty)</option>
              <option value="contains">التحقق من احتواء النص على كلمة (Contains)</option>
              <option value="equals">المطابقة التامة للنص (Strict Equals)</option>
              <option value="matchesRegex">مطابقة تعبير نمطي (Regex Match)</option>
              <option value="jsonValid">التحقق من صحة تنسيق JSON (Valid JSON)</option>
            </select>
          </div>

          {/* Expected Value (for contains, equals, regex) */}
          {(assertionType === 'contains' ||
            assertionType === 'equals' ||
            assertionType === 'matchesRegex') && (
            <div>
              <label className="text-[11px] font-medium text-zinc-400 block text-right mb-1">
                القيمة المتوقعة (Expected Value):
              </label>
              <input
                type="text"
                placeholder={
                  assertionType === 'matchesRegex'
                    ? '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$'
                    : 'النص المطلوب التحقق منه...'
                }
                value={nodeData.expectedValue || ''}
                onChange={(e) => updateNodeData(id, { expectedValue: e.target.value })}
                className="w-full bg-[#0A0C10] border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/60 font-mono"
              />
            </div>
          )}

          {/* Halt workflow on failure toggle */}
          <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60">
            <input
              type="checkbox"
              id={`fail-toggle-${id}`}
              checked={Boolean(nodeData.failWorkflowOnMismatch)}
              onChange={(e) =>
                updateNodeData(id, { failWorkflowOnMismatch: e.target.checked })
              }
              className="accent-rose-500 rounded cursor-pointer w-3.5 h-3.5"
            />
            <label
              htmlFor={`fail-toggle-${id}`}
              className="text-[11px] text-zinc-400 cursor-pointer select-none"
            >
              إيقاف تنفيذ المسار فوراً في حال فشل الفحص
            </label>
          </div>

          {/* Assertion Result Feedback */}
          {passed !== undefined && (
            <div
              className={`p-2 rounded-xl border flex items-start gap-2 ${
                passed
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {passed ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              )}
              <div className="text-right flex-1">
                <span className="text-[11px] font-bold block">
                  {passed ? 'نجح الفحص التأكيدي ✅' : 'فشل الفحص التأكيدي ❌'}
                </span>
                {message && (
                  <p className="text-[10px] opacity-80 mt-0.5 leading-snug">
                    {message}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </NodeContainer>

      {/* Source handle */}
      <Handle
        type="source"
        position={sourcePosition}
        id="output"
        className="!bg-emerald-500 !border-zinc-900 !w-3.5 !h-3.5"
      />
    </div>
  );
});

TestAssertionNode.displayName = 'TestAssertionNode';
