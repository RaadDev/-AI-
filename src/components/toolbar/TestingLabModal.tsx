'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  FlaskConical,
  Play,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
  FileText,
} from 'lucide-react';
import { Node, Edge } from '@xyflow/react';
import { WorkflowTestCase, WorkflowNodeData } from '@/types/workflow';
import { runWorkflowEngine } from '@/engine/executionEngine';

interface TestingLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: Node[];
  edges: Edge[];
  onNodeUpdate: (nodeId: string, updates: Partial<WorkflowNodeData>) => void;
}

const STORAGE_KEY = 'pf_studio_test_suites';

export const TestingLabModal: React.FC<TestingLabModalProps> = ({
  isOpen,
  onClose,
  nodes,
  edges,
  onNodeUpdate,
}) => {
  // Find all root input nodes
  const rootInputNodes = nodes.filter((n) => {
    const incoming = edges.filter((e) => e.target === n.id);
    return incoming.length === 0;
  });

  // Find all final output nodes
  const outputNodes = nodes.filter(
    (n) => n.type === 'finalResult' || n.type === 'webhookOutput' || n.type === 'structuredOutput'
  );

  const [testCases, setTestCases] = useState<WorkflowTestCase[]>([
    {
      id: 'test_1',
      name: 'اختبار حالة النجاح القياسية (Happy Path)',
      description: 'التحقق من تدفق البيانات وتوليد النتائج بدون أخطاء',
      inputs: {},
      expectedOutputs: {},
      assertions: [],
      status: 'idle',
    },
  ]);

  const [selectedTestId, setSelectedTestId] = useState<string>('test_1');
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [runningTestId, setRunningTestId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTestCases(parsed);
          setSelectedTestId(parsed[0]?.id || '');
        }
      }
    } catch {}
  }, []);

  const saveTestCases = (updated: WorkflowTestCase[]) => {
    setTestCases(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const activeTest = testCases.find((t) => t.id === selectedTestId) || testCases[0];

  const handleAddTestCase = () => {
    const newCase: WorkflowTestCase = {
      id: `test_${Date.now()}`,
      name: `حالة اختبار جديدة #${testCases.length + 1}`,
      description: 'فحص مخرجات المسار بمجموعة مدخلات محددة',
      inputs: {},
      expectedOutputs: {},
      assertions: [],
      status: 'idle',
    };
    const next = [...testCases, newCase];
    saveTestCases(next);
    setSelectedTestId(newCase.id);
  };

  const handleDeleteTestCase = (id: string) => {
    if (testCases.length <= 1) {
      alert('يجب الإبقاء على حالة اختبار واحدة على الأقل');
      return;
    }
    const next = testCases.filter((t) => t.id !== id);
    saveTestCases(next);
    if (selectedTestId === id) {
      setSelectedTestId(next[0]?.id || '');
    }
  };

  const handleUpdateActiveTest = (updates: Partial<WorkflowTestCase>) => {
    if (!activeTest) return;
    const next = testCases.map((t) => (t.id === activeTest.id ? { ...t, ...updates } : t));
    saveTestCases(next);
  };

  // Run a single test case
  const executeTestCase = async (tc: WorkflowTestCase): Promise<WorkflowTestCase> => {
    const startTime = performance.now();
    try {
      // 1. Prepare initial node values with test inputs
      const initialOutputs: Record<string, string> = { ...tc.inputs };

      // 2. Execute workflow engine
      const result = await runWorkflowEngine(
        nodes,
        edges,
        onNodeUpdate,
        undefined,
        initialOutputs
      );

      const durationMs = Math.round(performance.now() - startTime);

      if (!result.success) {
        return {
          ...tc,
          status: 'failed',
          lastRunTimestamp: new Date().toLocaleTimeString('ar-SA'),
          executionDurationMs: durationMs,
          actualOutputs: result.outputs,
        };
      }

      // 3. Verify assertions
      let allPassed = true;
      if (tc.expectedOutputs) {
        for (const [nodeId, expectedText] of Object.entries(tc.expectedOutputs)) {
          if (expectedText && expectedText.trim()) {
            const actual = result.outputs[nodeId] || '';
            if (!actual.toLowerCase().includes(expectedText.toLowerCase())) {
              allPassed = false;
              break;
            }
          }
        }
      }

      return {
        ...tc,
        status: allPassed ? 'passed' : 'failed',
        lastRunTimestamp: new Date().toLocaleTimeString('ar-SA'),
        executionDurationMs: durationMs,
        actualOutputs: result.outputs,
      };
    } catch (err) {
      return {
        ...tc,
        status: 'failed',
        lastRunTimestamp: new Date().toLocaleTimeString('ar-SA'),
        executionDurationMs: Math.round(performance.now() - startTime),
      };
    }
  };

  const handleRunActiveTest = async () => {
    if (!activeTest || runningTestId) return;
    setRunningTestId(activeTest.id);
    const updated = await executeTestCase(activeTest);
    const next = testCases.map((t) => (t.id === updated.id ? updated : t));
    saveTestCases(next);
    setRunningTestId(null);
  };

  const handleRunAllTests = async () => {
    if (isRunningAll) return;
    setIsRunningAll(true);
    const results: WorkflowTestCase[] = [];
    for (const tc of testCases) {
      setRunningTestId(tc.id);
      const res = await executeTestCase(tc);
      results.push(res);
    }
    saveTestCases(results);
    setRunningTestId(null);
    setIsRunningAll(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="w-full max-w-4xl h-[620px] bg-[#0E1017] border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-100 font-sans"
        dir="rtl"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-[#090B10] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2">
                <span>معمل الاختبار وضمان الجودة (Workflow Testing Lab)</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-mono">
                  v1.0
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                فحص ومطابقة مخرجات المسار آلياً ضد حالات اختبار محددة لضمان استقرار التدفق.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRunAllTests}
              disabled={isRunningAll || Boolean(runningTestId)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold transition shadow-sm"
            >
              {isRunningAll ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>جاري فحص الكل...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>تشغيل كافة الاختبارات ({testCases.length})</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Left sidebar test list + Right side test details */}
        <div className="flex-1 flex overflow-hidden">
          {/* Test Cases Sidebar */}
          <div className="w-64 border-l border-zinc-800 bg-[#0A0C10] flex flex-col p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-400">حالات الاختبار ({testCases.length})</span>
              <button
                type="button"
                onClick={handleAddTestCase}
                className="p-1 rounded-lg text-emerald-400 hover:bg-emerald-950/40 border border-emerald-500/30 transition text-xs flex items-center gap-1"
                title="إضافة حالة اختبار"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin">
              {testCases.map((tc) => (
                <div
                  key={tc.id}
                  onClick={() => setSelectedTestId(tc.id)}
                  className={`p-2.5 rounded-xl cursor-pointer border transition text-right ${
                    selectedTestId === tc.id
                      ? 'bg-zinc-800 border-emerald-500/50 text-white font-bold'
                      : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300 hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="truncate flex-1">{tc.name}</span>
                    {tc.status === 'passed' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mr-1" />
                    )}
                    {tc.status === 'failed' && (
                      <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mr-1" />
                    )}
                    {runningTestId === tc.id && (
                      <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin shrink-0 mr-1" />
                    )}
                  </div>
                  {tc.lastRunTimestamp && (
                    <div className="text-[10px] text-zinc-500 font-mono mt-1 flex items-center justify-between">
                      <span>{tc.lastRunTimestamp}</span>
                      {tc.executionDurationMs !== undefined && (
                        <span>{tc.executionDurationMs}ms</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Test Case Editor Panel */}
          {activeTest && (
            <div className="flex-1 flex flex-col p-5 overflow-y-auto space-y-4 scrollbar-thin select-text">
              {/* Top Meta info */}
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <div className="flex-1 max-w-md">
                  <input
                    type="text"
                    value={activeTest.name}
                    onChange={(e) => handleUpdateActiveTest({ name: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs font-bold text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    value={activeTest.description || ''}
                    onChange={(e) => handleUpdateActiveTest({ description: e.target.value })}
                    placeholder="وصف حالة الفحص..."
                    className="w-full bg-transparent text-[11px] text-zinc-400 mt-1 focus:outline-none placeholder-zinc-600"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRunActiveTest}
                    disabled={Boolean(runningTestId)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold transition"
                  >
                    {runningTestId === activeTest.id ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>جاري الفحص...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-white" />
                        <span>تشغيل الفحص الفردي</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteTestCase(activeTest.id)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition"
                    title="حذف حالة الفحص"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status banner */}
              {activeTest.status !== 'idle' && (
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                    activeTest.status === 'passed'
                      ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                      : 'bg-rose-950/30 border-rose-800/60 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {activeTest.status === 'passed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                    <span className="font-bold">
                      {activeTest.status === 'passed'
                        ? 'نجحت كافة الفحوصات والمطابقات بنجاح ✅'
                        : 'فشل الفحص: المخرجات لا تطابق المعايير المتوقعة ❌'}
                    </span>
                  </div>
                  <div className="font-mono text-[11px]">
                    المدة: {activeTest.executionDurationMs}ms
                  </div>
                </div>
              )}

              {/* Inputs section */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 block">
                  1. مدخلات الاختبار (Mock Inputs):
                </label>
                {rootInputNodes.length === 0 ? (
                  <p className="text-xs text-zinc-500">لا توجد عقد مدخلات رئيسية في المخطط الحالي.</p>
                ) : (
                  rootInputNodes.map((node) => {
                    const d = (node.data || {}) as WorkflowNodeData;
                    const val = activeTest.inputs?.[node.id] || '';
                    return (
                      <div key={node.id} className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-1">
                        <span className="text-[11px] font-bold text-indigo-300 block">
                          عقدة: {d.label || node.id} ({node.type})
                        </span>
                        <textarea
                          rows={2}
                          placeholder="اكتب قيمة الإدخال التجريبية لهذه العقدة..."
                          value={val}
                          onChange={(e) => {
                            const newInputs = { ...activeTest.inputs, [node.id]: e.target.value };
                            handleUpdateActiveTest({ inputs: newInputs });
                          }}
                          className="w-full bg-[#0A0C10] border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-mono resize-none"
                        />
                      </div>
                    );
                  })
                )}
              </div>

              {/* Expected Outputs & Assertions section */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 block">
                  2. المخرجات المتوقعة وفحص التأكيد (Expected Output Criteria):
                </label>
                {outputNodes.length === 0 ? (
                  <p className="text-xs text-zinc-500">
                    أضف عقدة مخرجات نهائية (Final Result أو Structured Output) لفحص مخرجاتها.
                  </p>
                ) : (
                  outputNodes.map((node) => {
                    const d = (node.data || {}) as WorkflowNodeData;
                    const expVal = activeTest.expectedOutputs?.[node.id] || '';
                    const actualVal = activeTest.actualOutputs?.[node.id] || '';
                    return (
                      <div key={node.id} className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-2">
                        <span className="text-[11px] font-bold text-emerald-300 block">
                          المخرجات المستهدفة: {d.label || node.id}
                        </span>

                        <div>
                          <label className="text-[10px] text-zinc-400 block mb-1">
                            يجب أن يحتوي النص على (Must Contain):
                          </label>
                          <input
                            type="text"
                            placeholder="الكلمة أو القيمة المتوقعة في الناتج..."
                            value={expVal}
                            onChange={(e) => {
                              const newExpected = { ...activeTest.expectedOutputs, [node.id]: e.target.value };
                              handleUpdateActiveTest({ expectedOutputs: newExpected });
                            }}
                            className="w-full bg-[#0A0C10] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 font-mono placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        {actualVal && (
                          <div>
                            <span className="text-[10px] text-zinc-500 block mb-0.5">
                              الناتج الفعلي لآخر فحص (Actual Output):
                            </span>
                            <div
                              dir="ltr"
                              className="max-h-24 overflow-y-auto bg-zinc-950 p-2 rounded-lg font-mono text-[10px] text-zinc-300 whitespace-pre-wrap select-text scrollbar-thin"
                            >
                              {actualVal}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
