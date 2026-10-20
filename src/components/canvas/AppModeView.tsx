'use client';

import React, { useState } from 'react';
import { Node, Edge } from '@xyflow/react';
import {
  Sparkles,
  Play,
  Loader2,
  Copy,
  Check,
  Download,
  ArrowRight,
  Sliders,
  FileText,
  Globe,
  UploadCloud,
  Search,
  Eye,
  Volume2,
  Share2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { WorkflowNodeData } from '@/types/workflow';

interface AppModeViewProps {
  nodes: Node[];
  edges: Edge[];
  onUpdateNode: (nodeId: string, updates: Partial<WorkflowNodeData>) => void;
  onRunWorkflow: () => Promise<void>;
  isRunning: boolean;
  onExitAppMode: () => void;
}

export const AppModeView: React.FC<AppModeViewProps> = ({
  nodes,
  edges,
  onUpdateNode,
  onRunWorkflow,
  isRunning,
  onExitAppMode,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'raw'>('preview');

  // Discover Input Nodes
  const inputNodes = nodes.filter(
    (n) =>
      n.type === 'textInput' ||
      n.type === 'urlScraper' ||
      n.type === 'fileUpload' ||
      n.type === 'webSearch'
  );

  // Discover Output Node (Prefer finalResult, else last textAI / toneRewriter)
  const finalResultNode =
    nodes.find((n) => n.type === 'finalResult') ||
    [...nodes]
      .reverse()
      .find((n) => n.type === 'textAI' || n.type === 'toneRewriter') ||
    nodes[nodes.length - 1];

  const finalOutput = (finalResultNode?.data as WorkflowNodeData)?.output || '';
  const finalLabel =
    (finalResultNode?.data as WorkflowNodeData)?.label || 'النتيجة النهائية';

  const handleCopy = () => {
    if (!finalOutput) return;
    navigator.clipboard.writeText(finalOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleExportMarkdown = () => {
    if (!finalOutput) return;
    const blob = new Blob([finalOutput], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `app-result-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-40 bg-[#090A0E] text-zinc-100 flex flex-col font-sans overflow-y-auto animate-in fade-in duration-200"
      dir="rtl"
    >
      {/* Top App Bar */}
      <header className="h-16 px-6 border-b border-zinc-800 bg-[#0C0E14]/90 backdrop-blur-xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-wide">
                واجهة التطبيق المباشر (App View Mode)
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-700/50 text-emerald-300">
                جاهز للاستخدام النهائي
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              واجهة مبسطة ونظيفة لتشغيل مسار الذكاء الاصطناعي كمنتج متكامل
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onExitAppMode}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/50 text-xs font-semibold transition"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لمحرر الكانفاس</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Right Column: Inputs Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 rounded-2xl bg-[#11131A] border border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <Sliders className="w-4 h-4" />
                <span>مدخلات التطبيق ({inputNodes.length})</span>
              </div>
              <span className="text-xs text-zinc-500">
                املأ الحقول لتوليد المخرجات
              </span>
            </div>

            {inputNodes.length === 0 ? (
              <div className="p-6 text-center text-zinc-500 text-xs bg-zinc-950/50 rounded-xl border border-zinc-800/60">
                لم يتم العثور على عقد مدخلات في هذا المخطط. يمكنك تشغيل السلسلة مباشرة.
              </div>
            ) : (
              <div className="space-y-4">
                {inputNodes.map((inputNode) => {
                  const d = inputNode.data as WorkflowNodeData;
                  return (
                    <div
                      key={inputNode.id}
                      className="space-y-1.5 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/70"
                    >
                      <label className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
                        {inputNode.type === 'textInput' && (
                          <FileText className="w-3.5 h-3.5 text-sky-400" />
                        )}
                        {inputNode.type === 'urlScraper' && (
                          <Globe className="w-3.5 h-3.5 text-cyan-400" />
                        )}
                        {inputNode.type === 'fileUpload' && (
                          <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        {inputNode.type === 'webSearch' && (
                          <Search className="w-3.5 h-3.5 text-cyan-400" />
                        )}
                        <span>{d.label || 'مدخل'}</span>
                      </label>

                      {inputNode.type === 'textInput' && (
                        <textarea
                          rows={3}
                          value={d.text || ''}
                          onChange={(e) =>
                            onUpdateNode(inputNode.id, {
                              text: e.target.value,
                              output: e.target.value,
                            })
                          }
                          placeholder="اكتب فكرتك الأساسية أو النص هنا..."
                          className="w-full bg-[#090A0D] border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 leading-relaxed resize-y"
                          dir="auto"
                        />
                      )}

                      {inputNode.type === 'urlScraper' && (
                        <input
                          type="url"
                          value={d.url || ''}
                          onChange={(e) =>
                            onUpdateNode(inputNode.id, { url: e.target.value })
                          }
                          placeholder="https://example.com/article"
                          className="w-full bg-[#090A0D] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono text-left"
                        />
                      )}

                      {inputNode.type === 'webSearch' && (
                        <input
                          type="text"
                          value={d.searchQuery || ''}
                          onChange={(e) =>
                            onUpdateNode(inputNode.id, { searchQuery: e.target.value })
                          }
                          placeholder="موضوع أو استفسار البحث..."
                          className="w-full bg-[#090A0D] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                        />
                      )}

                      {inputNode.type === 'fileUpload' && (
                        <div className="text-xs text-zinc-400 font-mono py-1">
                          {d.fileName ? `الملف المرفوع: ${d.fileName}` : 'لم يتم رفع ملف'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Run Button */}
            <button
              onClick={onRunWorkflow}
              disabled={isRunning}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition transform active:scale-98"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري معالجة وتوليد السلسلة...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>توليد المحتوى وتشغيل التطبيق (Generate)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Left Column: Output Display (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-[#11131A] border border-zinc-800 shadow-xl flex flex-col min-h-[500px]">
            {/* Output Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                <h2 className="text-sm font-bold text-zinc-100">
                  {finalLabel}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {/* View Mode Toggle */}
                <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`px-2 py-1 rounded transition text-[11px] ${
                      activeTab === 'preview'
                        ? 'bg-zinc-800 text-white font-medium'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    عرض منسق
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('raw')}
                    className={`px-2 py-1 rounded transition text-[11px] ${
                      activeTab === 'raw'
                        ? 'bg-zinc-800 text-white font-medium'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    نص خام
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!finalOutput}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 border border-zinc-700/50 text-xs transition"
                  title="نسخ المحتوى"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportMarkdown}
                  disabled={!finalOutput}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 border border-zinc-700/50 text-xs transition"
                  title="تصدير كملف Markdown"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تصدير .md</span>
                </button>
              </div>
            </div>

            {/* Output Body */}
            <div className="flex-1 bg-zinc-950/90 border border-zinc-800/80 rounded-xl p-5 overflow-y-auto leading-relaxed text-sm select-text">
              {finalOutput ? (
                activeTab === 'preview' ? (
                  <div
                    className="prose prose-invert prose-indigo max-w-none text-zinc-100 font-sans leading-7"
                    dir="auto"
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {finalOutput}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <pre
                    className="whitespace-pre-wrap font-mono text-xs text-zinc-200 leading-relaxed"
                    dir="auto"
                  >
                    {finalOutput}
                  </pre>
                )
              ) : isRunning ? (
                <div className="h-64 flex flex-col items-center justify-center text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                  <p className="text-xs text-zinc-400">
                    جاري التوليد المباشر عبر نماذج الذكاء الاصطناعي...
                  </p>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center space-y-2 text-zinc-500">
                  <Sparkles className="w-8 h-8 text-zinc-700 stroke-[1.5]" />
                  <p className="text-xs">
                    لم يتم توليد أي نتائج بعد. اضغط على زر "توليد المحتوى" لبدء التشغيل.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
