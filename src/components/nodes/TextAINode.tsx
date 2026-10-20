'use client';

import React, { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps, useReactFlow, useEdges, useNodes } from '@xyflow/react';
import {
  Sparkles,
  Cpu,
  Copy,
  Check,
  Loader2,
  Maximize2,
  Eye,
  FileCode,
  Clock,
  Coins,
  Wand2,
  ChevronLeft,
  ChevronRight,
  History,
  Settings2,
  Sliders,
  BookOpen,
  AlertCircle,
  Key,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { NodeContainer } from './NodeContainer';
import { WorkflowNodeData } from '@/types/workflow';
import { PreviewModal } from '@/components/canvas/PreviewModal';
import { PromptLibraryModal } from '@/components/modals/PromptLibraryModal';
import { useToast } from '@/components/ui/Toast';
import { useHandlePositions } from '@/utils/useHandlePositions';
import { TEXT_MODELS, DEFAULT_TEXT_MODEL } from '@/config/models';
import { ModelSelectorDropdown } from './ModelSelectorDropdown';

export const TextAINode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as WorkflowNodeData;
  const { updateNodeData } = useReactFlow();
  const edges = useEdges();
  const nodes = useNodes();
  const { targetPosition, sourcePosition } = useHandlePositions();
  const { showToast } = useToast();

  const incoming = edges.filter((e) => e.target === id);
  const upstreamTexts = incoming
    .map((edge) => {
      const src = nodes.find((n) => n.id === edge.source);
      const d = src?.data as any;
      return d?.output ?? d?.text ?? d?.fileContent ?? '';
    })
    .filter(Boolean);

  const latestUpstreamText = upstreamTexts.join(' ').replace(/[#*`_~]/g, '').trim();
  const hasUpstreamContext = incoming.length > 0;

  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'raw'>('preview');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [magicFeedback, setMagicFeedback] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isRunning = nodeData.status === 'running';
  const hasOutput = Boolean(nodeData.output);

  // Dual Tabs: 'prompt' (الأمر الموجه) vs 'output' (المخرجات الحية المتدفقة)
  const [activeTab, setActiveTab] = useState<'prompt' | 'output'>(
    isRunning || hasOutput ? 'output' : 'prompt'
  );
  const liveOutputRef = useRef<HTMLDivElement>(null);

  // Automatically activate the live streaming output tab upon running
  useEffect(() => {
    if (isRunning) {
      setActiveTab('output');
    }
  }, [isRunning]);

  // Smooth auto-scroll to latest token while generating
  useEffect(() => {
    if (isRunning && liveOutputRef.current) {
      liveOutputRef.current.scrollTop = liveOutputRef.current.scrollHeight;
    }
  }, [nodeData.output, isRunning]);

  const history = nodeData.outputHistory || (nodeData.output ? [nodeData.output] : []);
  const currentIndex =
    nodeData.historyIndex !== undefined && nodeData.historyIndex < history.length
      ? nodeData.historyIndex
      : Math.max(0, history.length - 1);

  const handleCopy = () => {
    if (nodeData.output) {
      navigator.clipboard.writeText(nodeData.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handlePrevHistory = () => {
    if (currentIndex > 0) {
      const newIdx = currentIndex - 1;
      updateNodeData(id, {
        output: history[newIdx],
        historyIndex: newIdx,
      });
    }
  };

  const handleNextHistory = () => {
    if (currentIndex < history.length - 1) {
      const newIdx = currentIndex + 1;
      updateNodeData(id, {
        output: history[newIdx],
        historyIndex: newIdx,
      });
    }
  };

  const handleMagicPrompt = () => {
    const raw = (nodeData.systemPrompt || nodeData.prompt || '').trim();
    if (!raw) {
      const enhanced =
        'أنت خبير ومستشار ذكاء اصطناعي محترف. قم بتحليل السياق المدخل بدقة، واستخلص أهم الأفكار الجوهرية وصغها بأسلوب عربي جذاب، متسق ومهيأ للنشر المباشر.';
      updateNodeData(id, { systemPrompt: enhanced, prompt: enhanced });
      setMagicFeedback(true);
      setTimeout(() => setMagicFeedback(false), 1500);
      return;
    }

    // Clean up any recursive prefixes and previous wrapping brackets to extract genuine intent
    let cleanRaw = raw;
    // Repeatedly unwrap "أنت نموذج ذكاء اصطناعي فائق الدقة. مهمتك الرئيسية: [...]"
    const loopRegex = /أنت نموذج ذكاء اصطناعي فائق الدقة[\s\S]*?مهمتك الرئيسية:\s*\[?([\s\S]*?)\]?\.\s*(الإرشادات:[\s\S]*)?$/;
    let match = cleanRaw.match(loopRegex);
    while (match && match[1]) {
      cleanRaw = match[1].trim();
      match = cleanRaw.match(loopRegex);
    }
    // Clean any trailing or leading prefixes
    cleanRaw = cleanRaw
      .replace(/^(أنت (خبير ومستشار ذكاء اصطناعي|خبير تلخيص واستخلاص محتوى|صانع محتوى فيروسي|كاتب مقالات تقنية|نموذج ذكاء اصطناعي فائق الدقة)[^:]*:\s*)+/gi, '')
      .replace(/^\[+|\]+$/g, '')
      .trim();

    if (!cleanRaw) {
      cleanRaw = 'قم بتحليل واستخلاص أهم الأفكار وصياغتها بنتيجة عملية ومباشرة';
    }

    let enhanced = '';
    if (cleanRaw.includes('لخص') || cleanRaw.includes('تلخيص')) {
      enhanced = `أنت خبير تلخيص واستخلاص محتوى. المطلوب: ${cleanRaw}.\n\nالقواعد:\n- ركز على النقاط المفصلية ذات القيمة العالية.\n- استخدم التنسيق النقطي الواضح والعناوين الجانبية البارزة.\n- احذف الحشو والكلمات الزائدة واجعل النتيجة سهلة القراءة السريعة.`;
    } else if (cleanRaw.includes('ثريد') || cleanRaw.includes('تغريد') || cleanRaw.includes('تويتر')) {
      enhanced = `أنت صانع محتوى فيروسي ومحترف كتابة سلاسل تغريدات (Threads). المطلوب: ${cleanRaw}.\n\nالهيكل:\n1. خطاف جذاب وقوي يوقف القارئ (Hook).\n2. تفكيك الأفكار إلى 4-6 تغريدات مترابطة ومرقمة.\n3. تضمين أمثلة وحقائق وأرقام واضحة.\n4. خاتمة تدعو للتفاعل والمشاركة (CTA) مع وسوم مناسبة.`;
    } else if (cleanRaw.includes('مقال') || cleanRaw.includes('blog')) {
      enhanced = `أنت كاتب مقالات تقنية ومحرر محتوى أول. المطلوب: ${cleanRaw}.\n\nالمعايير:\n- عنوان رئيسي جذاب ومطابق لمعايير الـ SEO.\n- مقدمة تشرح المشكلة والحل.\n- عناوين فرعية (H2, H3) وفقرات متماسكة.\n- خاتمة تلخص الدروس المستفادة.`;
    } else {
      enhanced = `أنت نموذج ذكاء اصطناعي فائق الدقة. مهمتك الرئيسية: [${cleanRaw}].\n\nالإرشادات:\n- اعتمد لغة عربية سليمة ومصطلحات دقيقة.\n- نسق المخرجات بنقاط وفواصل واضحة.\n- ركز على تقديم نتيجة عملية ومباشرة بدون مقدمات تقليدية.`;
    }

    updateNodeData(id, { systemPrompt: enhanced, prompt: enhanced });
    setMagicFeedback(true);
    setTimeout(() => setMagicFeedback(false), 1500);
  };

  const wordCount = (nodeData.output || '').split(/\s+/).filter(Boolean).length;
  const estTokens = nodeData.tokensUsed || Math.round((nodeData.output || '').length / 3.5);

  return (
    <div className="relative group">
      {/* Input Handle from upstream */}
      <Handle
        type="target"
        position={targetPosition}
        id="context"
        className="!bg-indigo-500 !border-zinc-900 !w-3.5 !h-3.5"
      />

      <NodeContainer
        nodeId={id}
        title={nodeData.label || 'توليد نص ذكي (AI)'}
        category="Processor"
        icon={<Sparkles className="w-4 h-4 text-indigo-400" />}
        status={nodeData.status}
        accentColor="violet"
        width="w-[350px]"
        selected={selected}
        isCollapsed={nodeData.isCollapsed}
      >
        <div className="space-y-3">
          {/* Model selection & Advanced Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-medium text-zinc-400">النموذج:</label>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`p-1 rounded-md text-[10px] transition flex items-center gap-1 ${
                  showAdvanced
                    ? 'bg-zinc-800 text-indigo-300 border border-zinc-700'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="خيارات النموذج المتقدمة"
              >
                <Settings2 className="w-3 h-3" />
                <span className="text-[9px]">متقدم</span>
              </button>
            </div>

            <ModelSelectorDropdown
              selectedModelId={nodeData.model || DEFAULT_TEXT_MODEL}
              onSelectModel={(modelId) => {
                updateNodeData(id, { model: modelId, fallbackApplied: false });
              }}
              category="text"
            />
          </div>

          {/* Silent Auto-Fallback Information Badge */}
          {nodeData.fallbackApplied && (
            <div className="p-2 px-2.5 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-200 text-[11px] flex items-center gap-2 animate-fadeIn shadow-sm" dir="rtl">
              <span className="text-blue-400 text-xs shrink-0">ℹ️</span>
              <span className="flex-1 leading-snug text-[10px]">
                {nodeData.fallbackMessage || `تم التنفيذ عبر ${nodeData.activeModel || 'Gemini 1.5 Pro'} لعدم توفر مفتاح OpenAI`}
              </span>
            </div>
          )}

          {/* Collapsible Advanced Settings */}
          {showAdvanced && (
            <div className="p-2.5 rounded-xl bg-[#0A0C10] border border-zinc-800 space-y-2 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-zinc-400 flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-indigo-400" />
                  درجة الإبداع (Temperature):
                </span>
                <span className="font-mono text-indigo-300">
                  {nodeData.temperature ?? 0.7}
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.2"
                step="0.1"
                value={nodeData.temperature ?? 0.7}
                onChange={(e) =>
                  updateNodeData(id, { temperature: parseFloat(e.target.value) })
                }
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          )}

          {/* Compact Live Upstream Context Badge */}
          {hasUpstreamContext && (
            <div className="px-2.5 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[10px] flex items-center justify-between gap-2 shadow-sm">
              <span className="flex items-center gap-1.5 text-indigo-300 font-medium truncate">
                <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
                <span className="truncate">
                  {latestUpstreamText
                    ? `“${latestUpstreamText.slice(0, 85)}${latestUpstreamText.length > 85 ? '...' : ''}”`
                    : 'في انتظار مخرجات العقد السابقة'}
                </span>
              </span>
              <span className="text-[9px] bg-indigo-500/20 px-1.5 py-0.2 rounded text-indigo-300 font-mono shrink-0">
                {latestUpstreamText ? 'محدث ⚡' : 'بانتظار'}
              </span>
            </div>
          )}

          {/* View Tabs: Prompt (الأمر) vs Live Stream (المخرجات الحية) */}
          <div className="flex items-center gap-1 bg-[#090B10] p-1 rounded-xl border border-white/[0.08] text-[11px] shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('prompt')}
              className={`flex-1 py-1 px-2.5 rounded-lg font-medium transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'prompt'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sliders className="w-3 h-3 text-indigo-400" />
              <span>الأمر (Prompt)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('output')}
              className={`flex-1 py-1 px-2.5 rounded-lg font-medium transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'output'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {isRunning ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span className="text-amber-300 font-bold">بث مباشر ⚡</span>
                </>
              ) : hasOutput ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-zinc-200">النتيجة ({wordCount} كلمة)</span>
                </>
              ) : (
                <>
                  <FileCode className="w-3 h-3 text-zinc-500" />
                  <span>المخرجات</span>
                </>
              )}
            </button>
          </div>

          {/* TAB 1: System Instructions / Prompt */}
          {activeTab === 'prompt' && (
            <div className="space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-slate-400 block text-right">
                  الأمر الموجه للذكاء الاصطناعي:
                </label>

                <div className="flex items-center gap-1.5">
                  {/* Built-in Prompt Library button */}
                  <button
                    type="button"
                    onClick={() => setIsLibraryOpen(true)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/10 text-[10px] transition shadow-sm cursor-pointer"
                    title="مكتبة الأوامر الهندسية الجاهزة"
                  >
                    <BookOpen className="w-3 h-3 text-amber-400" />
                    <span>📚 المكتبة (+26)</span>
                  </button>

                  {/* Magic Prompt Button */}
                  <button
                    type="button"
                    onClick={handleMagicPrompt}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/10 text-[10px] transition shadow-sm cursor-pointer"
                    title="تحسين البرومبت تلقائياً بضغطة زر"
                  >
                    <Wand2 className="w-3 h-3 text-indigo-400" />
                    <span>{magicFeedback ? 'تم التحسين!' : '✨ تحسين'}</span>
                  </button>
                </div>
              </div>

              <textarea
                className="w-full bg-black/40 border border-white/[0.08] rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:bg-black/60 resize-y min-h-[90px] leading-relaxed transition-all font-sans scrollbar-thin scrollbar-thumb-white/10"
                rows={4}
                placeholder="مثال: لخص النص القادم في 3 نقاط محددة باللهجة البيضاء مع إضافة وسوم هاشتاق مناسبة..."
                value={nodeData.systemPrompt || nodeData.prompt || ''}
                onChange={(e) => {
                  updateNodeData(id, { systemPrompt: e.target.value, prompt: e.target.value });
                }}
                dir="auto"
              />

              {/* Quick Jump to Live Stream if running */}
              {isRunning && (
                <button
                  type="button"
                  onClick={() => setActiveTab('output')}
                  className="w-full py-1.5 px-3 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-[11px] flex items-center justify-between transition animate-pulse cursor-pointer shadow-sm"
                >
                  <span className="flex items-center gap-1.5 font-medium">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>جاري التوليد الآن... اضغط لعرض البث المباشر</span>
                  </span>
                  <span className="text-[10px] bg-indigo-500/30 px-2 py-0.5 rounded font-mono font-bold text-white">
                    مشاهدة ⚡
                  </span>
                </button>
              )}
            </div>
          )}

          {/* TAB 2: Dedicated Live Streaming Output View */}
          {activeTab === 'output' && (
            <div className="space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-semibold flex items-center gap-1.5 ${
                      isRunning ? 'text-amber-400' : 'text-zinc-300'
                    }`}
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        <span>جاري التوليد المباشر (Live)...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>النتيجة المولدة:</span>
                      </>
                    )}
                  </span>

                  {/* History Navigation */}
                  {history.length > 1 && !isRunning && (
                    <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg px-1 py-0.5 text-[10px] text-zinc-400">
                      <History className="w-2.5 h-2.5 text-zinc-500" />
                      <button
                        type="button"
                        onClick={handlePrevHistory}
                        disabled={currentIndex === 0}
                        className="hover:text-white disabled:opacity-30 px-0.5 cursor-pointer"
                        title="النتيجة السابقة"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                      <span className="font-mono text-zinc-300">
                        {currentIndex + 1}/{history.length}
                      </span>
                      <button
                        type="button"
                        onClick={handleNextHistory}
                        disabled={currentIndex === history.length - 1}
                        className="hover:text-white disabled:opacity-30 px-0.5 cursor-pointer"
                        title="النتيجة التالية"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {/* Markdown Preview vs Raw toggle */}
                  <div className="flex bg-[#0A0C10] border border-zinc-800 rounded-lg p-0.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setViewMode('preview')}
                      className={`px-1.5 py-0.5 rounded cursor-pointer ${
                        viewMode === 'preview'
                          ? 'bg-zinc-700 text-white'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                      title="عرض منسق"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('raw')}
                      className={`px-1.5 py-0.5 rounded cursor-pointer ${
                        viewMode === 'raw'
                          ? 'bg-zinc-700 text-white'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                      title="نص خام"
                    >
                      <FileCode className="w-3 h-3" />
                    </button>
                  </div>

                  {hasOutput && (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsPreviewOpen(true)}
                        className="p-1 rounded bg-[#0A0C10] border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                        title="تكبير العرض"
                      >
                        <Maximize2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="p-1 rounded bg-[#0A0C10] border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
                        title="نسخ النتيجة"
                      >
                        {copied ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Streaming Output Box with auto-scrolling */}
              <div
                ref={liveOutputRef}
                className={`border rounded-xl p-3 text-xs leading-relaxed text-zinc-200 min-h-[140px] max-h-60 overflow-y-auto select-text font-sans transition-all scrollbar-thin scrollbar-thumb-white/10 ${
                  isRunning
                    ? 'border-indigo-500/50 bg-[#07090F] shadow-lg shadow-indigo-500/10'
                    : 'border-white/[0.08] bg-black/40'
                }`}
                dir="auto"
              >
                {viewMode === 'preview' && !isRunning ? (
                  <div className="prose prose-invert prose-xs max-w-none text-zinc-100 leading-6 font-sans">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {nodeData.output || ''}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap font-sans text-xs leading-6 text-zinc-100">
                    {nodeData.output || (
                      <span className="text-zinc-500 italic">
                        {isRunning
                          ? 'جاري بدء استدعاء النموذج وتدفق الرد...'
                          : 'لا توجد مخرجات بعد. اضغط زر "تشغيل" لبدء التوليد.'}
                      </span>
                    )}
                    {isRunning && (
                      <span className="inline-block w-2 h-4 bg-indigo-400 ml-1 rounded-[1px] animate-pulse align-middle shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
                    )}
                  </div>
                )}
              </div>

              {/* Metrics inside output tab */}
              {nodeData.status === 'completed' && (
                <div className="flex items-center justify-between text-[10px] text-zinc-400 bg-[#0A0C10] rounded-lg px-2 py-1 border border-zinc-800/80 font-mono">
                  <span className="flex items-center gap-1 text-zinc-300">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>
                      {nodeData.executionDuration
                        ? `${nodeData.executionDuration.toFixed(1)}s`
                        : '1.1s'}
                    </span>
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-300">{wordCount} كلمة</span>
                  <span className="text-zinc-600">•</span>
                  <span className="flex items-center gap-1 text-zinc-400">
                    <Coins className="w-3 h-3 text-amber-400" />
                    <span>~{estTokens} tok</span>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Missing API Key Card */}
          {(nodeData.status === 'error' && (nodeData.missingKey || nodeData.errorMessage?.includes('مفتاح'))) ? (
            <div className="p-3 rounded-xl bg-gradient-to-b from-amber-950/40 to-rose-950/30 border border-amber-500/40 text-amber-200 text-xs space-y-2.5 animate-fadeIn shadow-lg shadow-black/40" dir="rtl">
              <div className="flex items-start gap-2">
                <span className="text-base leading-none">🔑</span>
                <div className="flex-1 leading-snug">
                  <span className="font-bold block text-amber-100 text-xs">مفتاح الـ API غير متوفر لهذا النموذج</span>
                  <span className="text-[11px] text-amber-200/80 mt-0.5 block leading-relaxed">
                    {nodeData.errorMessage || 'يرجى إدخال مفتاح الـ API في الإعدادات لتشغيل هذا النموذج'}
                  </span>
                </div>
              </div>

              {/* Direct Action Button to open settings on the right tab */}
              <div className="pt-0.5 flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.dispatchEvent(
                      new CustomEvent('promptflow:open-settings', {
                        detail: { tab: 'keys', focusKey: nodeData.requiredProvider || 'openai' },
                      })
                    );
                  }}
                  className="w-full py-1.5 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm"
                >
                  <Key className="w-3.5 h-3.5 text-amber-300" />
                  <span>إدخال المفتاح في الإعدادات ⚙️</span>
                </button>

                {/* Quick Model Switch to Free Tiers */}
                <div className="flex items-center gap-1 pt-1 border-t border-amber-500/20">
                  <span className="text-[10px] text-zinc-400 shrink-0">أو بدّل لنموذج مجاني:</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateNodeData(id, {
                        model: 'gemini-2.5-flash',
                        status: 'idle',
                        errorMessage: undefined,
                        missingKey: false,
                      });
                    }}
                    className="flex-1 py-1 px-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-sky-300 border border-zinc-700 text-[10px] font-medium transition truncate text-center"
                    title="التبديل إلى Google Gemini Flash (طبقة مجانية)"
                  >
                    Gemini Flash ⚡
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateNodeData(id, {
                        model: 'llama-3.3-70b-versatile',
                        status: 'idle',
                        errorMessage: undefined,
                        missingKey: false,
                      });
                    }}
                    className="flex-1 py-1 px-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-zinc-700 text-[10px] font-medium transition truncate text-center"
                    title="التبديل إلى Llama 3.3 عبر Groq (طبقة مجانية)"
                  >
                    Llama 3 (Groq) 🦙
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </NodeContainer>

      {/* Output Handle */}
      <Handle
        type="source"
        position={sourcePosition}
        id="output"
        className="!bg-emerald-400 !border-zinc-900 !w-3.5 !h-3.5"
      />

      {/* Full-screen Lightbox Preview */}
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={nodeData.label || 'معاينة النص الذكي المولد'}
        initialContent={nodeData.output || ''}
        onSave={(updated) => updateNodeData(id, { output: updated })}
      />

      {/* Built-in Prompt Library Modal */}
      <PromptLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        targetNodeTitle={nodeData.label}
        onSelectPrompt={(selected) => {
          const text = typeof selected === 'string' ? selected : selected.systemPrompt;
          const promptTitle = typeof selected === 'object' ? selected.title : undefined;
          updateNodeData(id, { 
            systemPrompt: text,
            prompt: text,
            ...(promptTitle ? { label: `${(nodeData.label || 'توليد نص').split('(')[0].trim()} (${promptTitle})` } : {})
          });
          showToast(`تم تطبيق الأمر [${promptTitle || 'المحدد'}] بنجاح 🎯`, undefined, 'success');
        }}
      />
    </div>
  );
});

TextAINode.displayName = 'TextAINode';
