'use client';

import React, { useState, useMemo } from 'react';
import {
  Terminal,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Search,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Minimize2,
  Maximize2,
  FileText,
  Layers,
  Activity,
  Cpu,
  Coins,
  Check,
  CheckCheck,
  FileDown,
  ExternalLink,
  ImageIcon,
  Save,
  Braces,
} from 'lucide-react';
import { Node, Edge } from '@xyflow/react';
import { ExecutionLog } from '@/engine/executionEngine';
import { WorkflowValidationResult, ExecutionMetrics, WorkflowNodeData } from '@/types/workflow';

interface BottomExecutionPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  logs: ExecutionLog[];
  onClearLogs: () => void;
  nodes: Node[];
  edges: Edge[];
  metrics: ExecutionMetrics;
  validationResult: WorkflowValidationResult;
  isRunning: boolean;
  onSelectNode?: (nodeId: string) => void;
  onUpdateNode?: (nodeId: string, updates: Partial<WorkflowNodeData>) => void;
}

export const BottomExecutionPanel: React.FC<BottomExecutionPanelProps> = ({
  isOpen,
  onToggle,
  logs,
  onClearLogs,
  nodes,
  edges,
  metrics,
  validationResult,
  isRunning,
  onSelectNode,
  onUpdateNode,
}) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'outputs' | 'diagnostics' | 'inputs' | 'timeline'>('logs');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'error' | 'warn' | 'info'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filterSeverity !== 'all' && log.severity && log.severity !== filterSeverity) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        log.message.toLowerCase().includes(q) ||
        log.nodeTitle.toLowerCase().includes(q) ||
        log.nodeId.toLowerCase().includes(q)
      );
    });
  }, [logs, filterSeverity, searchQuery]);

  // Nodes with outputs
  const completedNodesWithOutput = useMemo(() => {
    return nodes.filter((n) => {
      const d = (n.data || {}) as WorkflowNodeData;
      return d.output && String(d.output).trim().length > 0;
    });
  }, [nodes]);

  // Root input nodes
  const inputNodes = useMemo(() => {
    return nodes.filter((n) => {
      const incoming = edges.filter((e) => e.target === n.id);
      return incoming.length === 0;
    });
  }, [nodes, edges]);

  const handleCopyLogs = () => {
    const text = logs
      .map(
        (l) =>
          `[${l.timestamp}] [${l.nodeTitle} (${l.nodeId})] [${(l.severity || l.status).toUpperCase()}]: ${l.message}`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const errorCount = logs.filter((l) => l.severity === 'error' || l.status === 'error').length;
  const warnCount = logs.filter((l) => l.severity === 'warn').length;

  // Structured dynamic tabs configuration ensuring instant reactive updates to counts
  const tabs = useMemo(() => [
    {
      id: 'logs' as const,
      label: 'السجلات',
      icon: Activity,
      count: logs.length,
      badge: errorCount > 0 ? errorCount : undefined,
      badgeColor: 'bg-rose-500',
    },
    {
      id: 'outputs' as const,
      label: 'المخرجات',
      icon: FileText,
      count: completedNodesWithOutput.length,
    },
    {
      id: 'diagnostics' as const,
      label: 'التشخيص',
      icon: AlertTriangle,
      count: validationResult?.issues?.length ?? 0,
      badge: (validationResult?.issues?.length ?? 0) > 0 ? validationResult.issues.length : undefined,
      badgeColor: validationResult?.isValid ? 'bg-amber-500' : 'bg-rose-500',
    },
    {
      id: 'inputs' as const,
      label: 'المدخلات',
      icon: Layers,
      count: inputNodes.length,
    },
    {
      id: 'timeline' as const,
      label: 'المخطط الزمني',
      icon: Clock,
      count: undefined,
    },
  ], [
    logs.length,
    errorCount,
    completedNodesWithOutput.length,
    validationResult?.issues?.length,
    validationResult?.isValid,
    inputNodes.length,
  ]);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-20 transition-all duration-300 font-sans shadow-2xl border-t ${
        !isOpen ? 'translate-y-[calc(100%-28px)]' : isExpanded ? 'h-[500px]' : 'h-[280px]'
      }`}
      style={{
        backgroundColor: 'var(--sidebar-bg, #0A0C10)',
        borderColor: 'var(--card-border, #1E2330)',
        color: 'var(--text-main, #E4E4E7)',
      }}
      dir="rtl"
    >
      {/* Top Header Bar / Dock Tab (28px sleek minimal strip) */}
      <div
        className="h-[28px] px-3 flex items-center justify-between border-b cursor-pointer select-none"
        style={{
          borderColor: 'var(--card-border, #1E2330)',
          backgroundColor: 'var(--card-header-bg, #0E121B)',
        }}
        onClick={onToggle}
      >
        {/* Left Side (in RTL): Tabs & Live Execution Indicator */}
        <div className="flex items-center gap-1 overflow-x-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1.5 pl-2 ml-1.5 border-l border-zinc-800 text-[11px]">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold text-zinc-300">السجلات والمراقبة</span>
            {isRunning && (
              <span className="flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 animate-pulse">
                <span className="w-1 h-1 rounded-full bg-indigo-400 animate-ping" />
                جاري المعالجة...
              </span>
            )}
          </div>

          {/* Navigation Tabs (Reactively derived from active tabs data) */}
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (!isOpen) onToggle();
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-md font-medium transition ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="flex items-center gap-1">
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="opacity-80 text-[11px] font-normal">({tab.count})</span>
                  )}
                </span>
                {tab.id === 'logs' && errorCount > 0 ? (
                  <span
                    className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm mr-1.5"
                    title={`${errorCount} خطأ في التنفيذ`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <span>{errorCount} {errorCount === 1 ? 'خطأ' : 'أخطاء'}</span>
                  </span>
                ) : tab.id !== 'logs' && tab.badge !== undefined ? (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold text-white mr-1 ${
                      tab.badgeColor || 'bg-rose-500'
                    }`}
                  >
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Right Side (in RTL): Metrics Summary & Expand/Collapse Controls */}
        <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
          {metrics.totalTokens > 0 && (
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
              <span className="flex items-center gap-1 text-indigo-400">
                <Cpu className="w-3 h-3" />
                <span>{metrics.totalTokens.toLocaleString()} توكن</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <Coins className="w-3 h-3" />
                <span>${metrics.totalCostUsd.toFixed(4)}</span>
              </span>
            </div>
          )}

          <div className="flex items-center gap-1 border-r border-zinc-800 pr-2">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              title={isExpanded ? 'تصغير الحجم' : 'تكبير الحجم'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={onToggle}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              title={isOpen ? 'طي اللوحة' : 'فتح اللوحة'}
            >
              {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Body (visible when open) */}
      {isOpen && (
        <div className="h-[calc(100%-38px)] flex flex-col overflow-hidden">
          {/* TAB 1: Execution Logs */}
          {activeTab === 'logs' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Controls bar */}
              <div className="px-4 py-2 border-b flex items-center justify-between gap-3 text-xs" style={{ borderColor: 'var(--card-border)' }}>
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                  <div className="relative w-full">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="بحث في السجلات..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pr-8 pl-3 py-1 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-zinc-500 ml-1">تصفية:</span>
                  {(['all', 'error', 'warn', 'info'] as const).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setFilterSeverity(sev)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                        filterSeverity === sev
                          ? 'bg-zinc-700 text-white font-bold'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      {sev === 'all' && 'الكل'}
                      {sev === 'error' && 'الأخطاء ❌'}
                      {sev === 'warn' && 'التنبيهات ⚠️'}
                      {sev === 'info' && 'المعلومات ℹ️'}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 mr-auto">
                  <button
                    type="button"
                    onClick={handleCopyLogs}
                    disabled={logs.length === 0}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 text-xs transition"
                  >
                    {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'تم النسخ' : 'نسخ السجل'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClearLogs}
                    disabled={logs.length === 0}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-rose-950/60 hover:text-rose-300 disabled:opacity-40 text-zinc-400 text-xs transition"
                    title="مسح السجلات"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>مسح</span>
                  </button>
                </div>
              </div>

              {/* Logs Content list */}
              <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] space-y-1 scrollbar-thin select-text">
                {filteredLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-xs gap-1 py-8">
                    <Terminal className="w-6 h-6 stroke-[1.5]" />
                    <span>لا توجد سجلات بعد. قم بتشغيل المسار لبدء المراقبة.</span>
                  </div>
                ) : (
                  filteredLogs.map((log, idx) => {
                    const isErr = log.status === 'error' || log.severity === 'error';
                    const isWarn = log.severity === 'warn' || log.status === 'cancelled';
                    const isSuccess = log.status === 'completed';

                    return (
                      <div
                        key={`${log.timestamp}-${log.nodeId}-${log.status}-${idx}`}
                        className={`flex items-start gap-2.5 px-2.5 py-1.5 rounded-lg border transition ${
                          isErr
                            ? 'bg-rose-950/30 border-rose-900/40 text-rose-300'
                            : isWarn
                            ? 'bg-amber-950/30 border-amber-900/40 text-amber-300'
                            : isSuccess
                            ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-300'
                            : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-300'
                        }`}
                      >
                        <span className="text-[10px] text-zinc-500 shrink-0 select-none">
                          {log.timestamp}
                        </span>

                        <span
                          onClick={() => onSelectNode?.(log.nodeId)}
                          className="font-bold text-[11px] shrink-0 text-indigo-400 hover:underline cursor-pointer"
                        >
                          [{log.nodeTitle}]
                        </span>

                        <span className="flex-1 whitespace-pre-wrap">{log.message}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Outputs */}
          {activeTab === 'outputs' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {completedNodesWithOutput.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-xs gap-1 py-8">
                  <FileText className="w-6 h-6 stroke-[1.5]" />
                  <span>لم يتم تسجيل أي مخرجات حتى الآن. قم بتشغيل المسار أو عقدة محددة.</span>
                </div>
              ) : (
                completedNodesWithOutput.map((node) => {
                  const d = (node.data || {}) as WorkflowNodeData;
                  const outStr = String(d.output || '');
                  const isImg =
                    /\.(png|jpe?g|webp|svg|gif)(\?.*)?$/i.test(outStr) ||
                    outStr.startsWith('data:image/') ||
                    outStr.includes('pollinations.ai') ||
                    Boolean(d.imageUrl);
                  const imgUrl = isImg ? d.imageUrl || outStr : null;

                  let jsonPretty: string | null = null;
                  try {
                    const parsed = JSON.parse(outStr.trim());
                    if (typeof parsed === 'object' && parsed !== null) {
                      jsonPretty = JSON.stringify(parsed, null, 2);
                    }
                  } catch {}

                  const words = outStr.trim() ? outStr.trim().split(/\s+/).filter(Boolean).length : 0;

                  const handleDownloadOutput = (ext: 'txt' | 'json' | 'md') => {
                    const blob = new Blob([jsonPretty && ext === 'json' ? jsonPretty : outStr], {
                      type: 'text/plain;charset=utf-8',
                    });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${d.label || node.id}-${Date.now()}.${ext}`;
                    link.click();
                    URL.revokeObjectURL(url);
                  };

                  return (
                    <div
                      key={node.id}
                      className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2 hover:border-zinc-700 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            onClick={() => onSelectNode?.(node.id)}
                            className="text-xs font-bold text-indigo-300 hover:underline cursor-pointer"
                          >
                            {d.label || node.id}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                            {node.type}
                          </span>
                          {d.executionDuration !== undefined && (
                            <span className="text-[10px] text-emerald-400 font-mono font-medium">
                              {d.executionDuration.toFixed(2)}s
                            </span>
                          )}
                          {d.tokensUsed !== undefined && (
                            <span className="text-[10px] text-zinc-500 font-mono">
                              ~{d.tokensUsed} tok
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDownloadOutput(jsonPretty ? 'json' : 'txt')}
                            className="text-[10px] text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 transition flex items-center gap-1"
                            title="تحميل المخرج"
                          >
                            <FileDown className="w-3 h-3 text-sky-400" />
                            <span>تحميل</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(outStr);
                            }}
                            className="text-[10px] text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 transition flex items-center gap-1"
                            title="نسخ النص"
                          >
                            <Copy className="w-3 h-3 text-emerald-400" />
                            <span>نسخ</span>
                          </button>
                        </div>
                      </div>

                      {/* Image Thumbnail Preview if applicable */}
                      {imgUrl && (
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imgUrl}
                            alt="Output preview"
                            className="w-16 h-16 object-cover rounded-md border border-zinc-700"
                          />
                          <div className="text-xs space-y-1">
                            <span className="text-pink-400 font-semibold flex items-center gap-1">
                              <ImageIcon className="w-3.5 h-3.5" />
                              <span>صورة مولدة بالذكاء الاصطناعي</span>
                            </span>
                            <a
                              href={imgUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>فتح الصورة بدقة كاملة</span>
                            </a>
                          </div>
                        </div>
                      )}

                      {/* JSON Pretty or Text Box */}
                      {jsonPretty ? (
                        <div
                          dir="ltr"
                          className="max-h-32 overflow-y-auto bg-zinc-950 p-2.5 rounded-lg font-mono text-[11px] text-violet-300 whitespace-pre-wrap select-text scrollbar-thin border border-zinc-800/60"
                        >
                          {jsonPretty}
                        </div>
                      ) : (
                        <div
                          dir="auto"
                          className="max-h-28 overflow-y-auto bg-zinc-950 p-2.5 rounded-lg font-sans text-xs text-zinc-300 whitespace-pre-wrap select-text scrollbar-thin border border-zinc-800/60 leading-relaxed"
                        >
                          {outStr}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                        <span>{words} كلمة • {outStr.length} حرف</span>
                        <span>معرف: {node.id}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 3: Diagnostics & Validation */}
          {activeTab === 'diagnostics' && (() => {
            // Compute real-time diagnostic checks
            const disconnectedNodes = nodes.filter((n) => {
              if (n.type === 'note') return false;
              const hasIncoming = edges.some((e) => e.target === n.id);
              const hasOutgoing = edges.some((e) => e.source === n.id);
              return !hasIncoming && !hasOutgoing && nodes.length > 1;
            });

            const missingInputNodes = nodes.filter((n) => {
              if (n.type === 'note') return false;
              const d = (n.data || {}) as WorkflowNodeData;
              const incoming = edges.filter((e) => e.target === n.id);

              switch (n.type) {
                case 'textInput':
                  return !d.text && !d.output;
                case 'urlScraper':
                  return !d.url && !d.output;
                case 'httpRequest':
                  return !d.httpUrl && incoming.length === 0;
                case 'structuredOutput':
                  return !d.jsonSchema && incoming.length === 0;
                case 'templateMerge':
                  return incoming.length === 0;
                case 'finalResult':
                  return incoming.length === 0;
                case 'textAI':
                  return !d.systemPrompt && incoming.length === 0;
                default:
                  return false;
              }
            });

            const totalIssues =
              disconnectedNodes.length + missingInputNodes.length + validationResult.errors.length;

            return (
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin select-text">
                {/* Diagnostics Summary Header */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-2">
                  <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block">إجمالي العقد</span>
                    <span className="text-sm font-bold font-mono text-zinc-200">
                      {nodes.length} عقدة
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block">العقد السليمة</span>
                    <span className="text-sm font-bold font-mono text-emerald-400">
                      {Math.max(0, nodes.length - totalIssues)} عقدة ✅
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block">عقد معزولة (غير متصلة)</span>
                    <span
                      className={`text-sm font-bold font-mono ${
                        disconnectedNodes.length > 0 ? 'text-amber-400' : 'text-zinc-500'
                      }`}
                    >
                      {disconnectedNodes.length} عقدة
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block">مدخلات ناقصة</span>
                    <span
                      className={`text-sm font-bold font-mono ${
                        missingInputNodes.length > 0 ? 'text-rose-400' : 'text-zinc-500'
                      }`}
                    >
                      {missingInputNodes.length} عقدة
                    </span>
                  </div>
                </div>

                {/* Overall status banner */}
                <div className="flex items-center justify-between pb-2 mb-1 border-b border-zinc-800/80">
                  <span className="text-xs font-bold text-zinc-200">
                    تقرير الفحص الهندسي والتشخيص (Diagnostic Analysis):
                  </span>
                  <span
                    className={`text-[11px] px-3 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                      totalIssues === 0
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {totalIssues === 0 ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>المسار مكتمل وجاهز للتنفيذ بنسبة 100%</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>يوجد {totalIssues} تنبيه(ات) تتطلب انتباهك</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Disconnected / Isolated Nodes Section */}
                {disconnectedNodes.map((node) => {
                  const d = (node.data || {}) as WorkflowNodeData;
                  return (
                    <div
                      key={`disc-${node.id}`}
                      className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-amber-300">
                              عقدة غير متصلة بأي سلك:
                            </span>
                            <span className="font-semibold text-zinc-200">
                              {d.label || node.id}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                              {node.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            هذه العقدة معزولة ولن تتلقى سياقاً أو ترسل مخرجات لأي عقدة أخرى. قم بربطها بسلك اتصال.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelectNode?.(node.id)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-medium shrink-0 transition"
                      >
                        تحديد العقدة 🔍
                      </button>
                    </div>
                  );
                })}

                {/* Missing Input Nodes Section */}
                {missingInputNodes.map((node) => {
                  const d = (node.data || {}) as WorkflowNodeData;
                  let missingFieldDesc = 'ينقص هذه العقدة مدخل بيانات للبدء';
                  if (node.type === 'urlScraper') missingFieldDesc = 'لم يتم تحديد رابط موقع أو فيديو يوتيوب';
                  if (node.type === 'textInput') missingFieldDesc = 'حقل النص فارغ ولا توجد مخرجات';
                  if (node.type === 'httpRequest') missingFieldDesc = 'عنوان URL الخاص بطلب HTTP غير محدد';
                  if (node.type === 'templateMerge') missingFieldDesc = 'لا تتلقى أي مدخلات عبر الأسلاك الواردة للدمج';
                  if (node.type === 'finalResult') missingFieldDesc = 'لا يوجد سلك وارد يغذي النتيجة النهائية';

                  return (
                    <div
                      key={`miss-${node.id}`}
                      className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-rose-300">
                              مدخل ناقص:
                            </span>
                            <span className="font-semibold text-zinc-200">
                              {d.label || node.id}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                              {node.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            {missingFieldDesc}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelectNode?.(node.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-medium shrink-0 transition"
                      >
                        إكمال المدخل ✍️
                      </button>
                    </div>
                  );
                })}

                {/* Graph cycle or extra issues from validator */}
                {validationResult.issues
                  .filter(
                    (i) =>
                      !disconnectedNodes.some((n) => n.id === i.nodeId) &&
                      !missingInputNodes.some((n) => n.id === i.nodeId)
                  )
                  .map((issue, idx) => (
                    <div
                      key={`iss-${issue.id || idx}-${issue.nodeId || ''}-${idx}`}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 text-xs ${
                        issue.type === 'error'
                          ? 'bg-rose-950/30 border-rose-900/40 text-rose-300'
                          : 'bg-amber-950/30 border-amber-900/40 text-amber-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {issue.type === 'error' ? (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                        <div>
                          <span className="font-bold">{issue.message}</span>
                          {issue.details && (
                            <p className="text-[11px] opacity-80 mt-0.5 font-mono">
                              {issue.details}
                            </p>
                          )}
                        </div>
                      </div>
                      {issue.nodeId && (
                        <button
                          type="button"
                          onClick={() => onSelectNode?.(issue.nodeId!)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 shrink-0 text-[11px]"
                        >
                          عرض العقدة
                        </button>
                      )}
                    </div>
                  ))}

                {totalIssues === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-emerald-400 text-xs gap-1.5">
                    <CheckCircle2 className="w-8 h-8 stroke-[1.5]" />
                    <span className="font-bold text-sm">كافة العقد متصلة ومكتملة المدخلات بنجاح!</span>
                    <span className="text-zinc-500 text-[11px]">
                      لا توجد أي حلقات مغلقة أو أسلاك مفقودة في المخطط.
                    </span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* TAB 4: Inputs (With Quick Inline Editor) */}
          {activeTab === 'inputs' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span>العقد الجذرية المغذية للمسار (Root Inputs) - يمكنك تعديلها مباشرة هنا:</span>
                <span className="text-[11px] text-zinc-500 font-mono">({inputNodes.length} عقدة)</span>
              </div>

              {inputNodes.length === 0 ? (
                <div className="text-zinc-500 text-xs text-center py-6">لا توجد عقد مدخلات رئيسية.</div>
              ) : (
                inputNodes.map((node) => {
                  const d = (node.data || {}) as WorkflowNodeData;
                  const currentInputVal = String(d.text || d.output || d.content || d.url || '');
                  const words = currentInputVal.trim()
                    ? currentInputVal.trim().split(/\s+/).filter(Boolean).length
                    : 0;

                  return (
                    <div
                      key={node.id}
                      className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2 hover:border-zinc-700 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            onClick={() => onSelectNode?.(node.id)}
                            className="text-xs font-bold text-sky-400 hover:underline cursor-pointer"
                          >
                            {d.label || node.id}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                            {node.type}
                          </span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950/60 text-sky-300 border border-sky-800/50 font-mono">
                          مدخل رئيسي (Root)
                        </span>
                      </div>

                      {/* Live editable input box */}
                      <div>
                        <textarea
                          rows={2}
                          defaultValue={currentInputVal}
                          onBlur={(e) => {
                            const val = e.target.value;
                            onUpdateNode?.(node.id, {
                              text: val,
                              output: val,
                            });
                          }}
                          placeholder="اكتب مدخل البيانات هنا..."
                          className="w-full bg-[#0A0C10] border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-sky-500 resize-none font-sans leading-relaxed"
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                        <span>{words} كلمة • {currentInputVal.length} حرف</span>
                        <span className="text-[9px] text-zinc-600">يُحفظ تلقائياً عند مغادرة الحقل (Blur)</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 5: Timeline with Horizontal Gantt Bars */}
          {activeTab === 'timeline' && (() => {
            const timedNodes = nodes.filter(
              (n) => (n.data as WorkflowNodeData)?.executionDuration !== undefined
            );

            const maxDurationSeconds = Math.max(
              ...timedNodes.map((n) => Number((n.data as WorkflowNodeData).executionDuration || 0)),
              0.001
            );

            const totalDurationMs = Math.round(
              timedNodes.reduce(
                (sum, n) => sum + Number((n.data as WorkflowNodeData).executionDuration || 0) * 1000,
                0
              )
            );

            return (
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin select-text">
                {/* Timeline Header Metrics */}
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-200">
                      المخطط الزمني لتنفيذ العقد (Gantt Execution Timeline):
                    </span>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      ({timedNodes.length} عقدة منفذة)
                    </span>
                  </div>
                  {timedNodes.length > 0 && (
                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="text-zinc-400">إجمالي الوقت:</span>
                      <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                        {totalDurationMs.toLocaleString()} ms
                      </span>
                    </div>
                  )}
                </div>

                {/* Empty State */}
                {timedNodes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-zinc-500 text-xs gap-2">
                    <Clock className="w-8 h-8 stroke-[1.5]" />
                    <span className="font-medium">لم يتم تنفيذ أي عقد حتى الآن لرسم المخطط الزمني.</span>
                    <span className="text-[11px] text-zinc-600">
                      اضغط على &quot;تشغيل المسار (Ctrl+Enter)&quot; لحساب زمن الاستغراق لكل عقدة بالمللي ثانية ورسم أشرطة Gantt.
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {timedNodes.map((node, idx) => {
                      const d = (node.data || {}) as WorkflowNodeData;
                      const durationSec = Number(d.executionDuration || 0);
                      const durationMs = Math.round(durationSec * 1000);
                      const widthPercent = Math.max(
                        8,
                        Math.min(100, Math.round((durationSec / maxDurationSeconds) * 100))
                      );

                      // Dynamic color coding based on duration & node type
                      let barGradient = 'from-emerald-500 to-teal-400';
                      let barBgGlow = 'rgba(16, 185, 129, 0.3)';
                      if (durationMs > 2500 || node.type === 'textAI' || node.type === 'imageAI') {
                        barGradient = 'from-indigo-500 via-purple-500 to-pink-500';
                        barBgGlow = 'rgba(168, 85, 247, 0.35)';
                      } else if (durationMs > 800) {
                        barGradient = 'from-cyan-500 to-indigo-500';
                        barBgGlow = 'rgba(6, 182, 212, 0.3)';
                      }

                      return (
                        <div
                          key={node.id}
                          className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-[10px] font-bold font-mono">
                                #{idx + 1}
                              </span>
                              <span
                                onClick={() => onSelectNode?.(node.id)}
                                className="font-bold text-zinc-200 hover:text-indigo-300 hover:underline cursor-pointer"
                              >
                                {d.label || node.id}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                                {node.type}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 font-mono text-[11px]">
                              {d.tokensUsed !== undefined && d.tokensUsed > 0 && (
                                <span className="text-zinc-500 text-[10px]">
                                  ~{d.tokensUsed} توكن
                                </span>
                              )}
                              <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                                {durationMs.toLocaleString()} ms ({durationSec.toFixed(2)}s)
                              </span>
                            </div>
                          </div>

                          {/* Gantt Bar Visualization */}
                          <div className="w-full bg-zinc-950 rounded-full h-3.5 p-0.5 border border-zinc-800/60 overflow-hidden relative">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-500 flex items-center justify-end pr-1.5 shadow-sm`}
                              style={{
                                width: `${widthPercent}%`,
                                boxShadow: `0 0 10px ${barBgGlow}`,
                              }}
                            >
                              {widthPercent > 20 && (
                                <span className="text-[8px] font-mono text-white font-bold drop-shadow">
                                  {durationMs}ms
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
