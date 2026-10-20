'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Play,
  RotateCcw,
  Copy,
  Check,
  History,
  Coins,
  Clock,
  FileText,
  Sliders,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Save,
  Maximize2,
  Cpu,
  Layers,
  Wand2,
  Code,
  Globe,
  SlidersHorizontal,
  Loader2,
  AlertCircle,
  Key,
} from 'lucide-react';
import { TEXT_MODELS, DEFAULT_TEXT_MODEL } from '@/config/models';
import { Node, Edge, useReactFlow } from '@xyflow/react';
import { WorkflowNodeData } from '@/types/workflow';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PromptLibraryModal } from '@/components/modals/PromptLibraryModal';
import { PromptTemplate } from '@/data/promptLibrary';
import { useToast } from '@/components/ui/Toast';

interface NodeInspectorProps {
  selectedNode: Node | null;
  allNodes: Node[];
  edges: Edge[];
  onClose: () => void;
  onUpdateNode: (nodeId: string, updates: Partial<WorkflowNodeData>) => void;
  onRunSingleNode: (nodeId: string) => void;
  isRunning?: boolean;
}

const TONES = [
  { id: 'saudi', label: '🇸🇦 سعودية بيضاء', desc: 'عفوية وودية' },
  { id: 'khaleeji', label: '🌊 خليجية تسويقية', desc: 'حماسية وإعلانية' },
  { id: 'formal', label: '📜 فصحى رسمية', desc: 'مهنية وموثوقة' },
  { id: 'story', label: '📖 أسلوب قصصي', desc: 'مشوق وسردي' },
  { id: 'executive', label: '💼 تلخيص تنفيذي', desc: 'مباشر للقرارات' },
  { id: 'sales', label: '🛍️ تسويقي وبيعي', desc: 'محفز للشراء' },
];

const LENGTHS = [
  { id: 'concise', label: 'موجز ومختصر' },
  { id: 'balanced', label: 'متوازن' },
  { id: 'detailed', label: 'مفصل وشامل' },
];

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  selectedNode,
  allNodes,
  edges,
  onClose,
  onUpdateNode,
  onRunSingleNode,
  isRunning = false,
}) => {
  const [activeTab, setActiveTab] = useState<'prompt' | 'filters' | 'output' | 'advanced'>('prompt');
  const [copied, setCopied] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const { showToast } = useToast();
  const [outputEditMode, setOutputEditMode] = useState(false);
  const [editableOutput, setEditableOutput] = useState('');

  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);
  const { updateNodeData } = useReactFlow();

  const nodeData = (selectedNode?.data || {}) as WorkflowNodeData;

  useEffect(() => {
    if (nodeData.output !== undefined) {
      setEditableOutput(nodeData.output || '');
    }
  }, [nodeData.output, selectedNode?.id]);

  if (!selectedNode) return null;

  // Unified two-way binding updater: React Flow Store + WorkflowCanvas React State
  const handleUpdate = (updates: Partial<WorkflowNodeData>) => {
    try {
      updateNodeData(selectedNode.id, updates);
    } catch (e) {
      console.warn('Inspector updateNodeData warning:', e);
    }
    onUpdateNode(selectedNode.id, updates);
  };

  // Find incoming nodes to provide variable injection pills
  const incomingEdges = edges.filter((e) => e.target === selectedNode.id);
  const upstreamVariables = incomingEdges.map((edge, index) => {
    const parent = allNodes.find((n) => n.id === edge.source);
    const parentLabel = (parent?.data as any)?.label || parent?.id || `مدخل ${index + 1}`;
    const handleTag = edge.targetHandle ? `{{${edge.targetHandle}}}` : `{{input_${index + 1}}}`;
    return {
      id: edge.id,
      handleTag,
      label: parentLabel,
      type: parent?.type || 'node',
    };
  });

  // History management
  const history = nodeData.outputHistory || (nodeData.output ? [nodeData.output] : []);
  const currentIndex =
    nodeData.historyIndex !== undefined && nodeData.historyIndex < history.length
      ? nodeData.historyIndex
      : Math.max(0, history.length - 1);

  const handleInsertVariable = (tag: string) => {
    const textarea = promptTextareaRef.current;
    if (!textarea) {
      const current = nodeData.systemPrompt || nodeData.prompt || '';
      const next = `${current} ${tag}`.trim();
      handleUpdate({
        systemPrompt: next,
        prompt: next,
      });
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = textarea.value;
    const nextValue = current.substring(0, start) + tag + current.substring(end);

    handleUpdate({
      systemPrompt: nextValue,
      prompt: nextValue,
    });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 50);
  };

  const handleCopy = () => {
    if (nodeData.output) {
      navigator.clipboard.writeText(nodeData.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleSaveOutputEdit = () => {
    handleUpdate({
      output: editableOutput,
    });
    setOutputEditMode(false);
  };

  const handleSelectHistoryVersion = (idx: number) => {
    if (idx >= 0 && idx < history.length) {
      handleUpdate({
        output: history[idx],
        historyIndex: idx,
      });
      setEditableOutput(history[idx]);
    }
  };

  const handleSelectLibraryPrompt = (selected: PromptTemplate | string) => {
    const text = typeof selected === 'string' ? selected : selected.systemPrompt;
    const promptTitle = typeof selected === 'object' ? selected.title : undefined;
    handleUpdate({
      systemPrompt: text,
      prompt: text,
      ...(promptTitle ? { label: `${(nodeData.label || 'توليد نص').split('(')[0].trim()} (${promptTitle})` } : {}),
    });
    if (promptTextareaRef.current) {
      promptTextareaRef.current.value = text;
    }
    showToast(`تم تطبيق الأمر [${promptTitle || 'المحدد'}] بنجاح 🎯`, undefined, 'success');
  };

  const wordCount = (nodeData.output || '').split(/\s+/).filter(Boolean).length;
  const charCount = (nodeData.output || '').length;
  const approxTokens = nodeData.tokensUsed || Math.round(charCount / 3.5);

  const isAINode = [
    'textAI',
    'toneRewriter',
    'jsonExtractor',
    'structuredOutput',
    'imageAI',
  ].includes(selectedNode.type || '');

  return (
    <>
      <aside
        className="fixed top-16 left-0 bottom-0 w-[460px] max-w-[90vw] bg-[#0E1017]/95 backdrop-blur-2xl border-r border-zinc-800 z-40 flex flex-col shadow-2xl transition-transform animate-in slide-in-from-left duration-250 select-none text-zinc-100"
        dir="rtl"
      >
        {/* Drawer Header */}
        <div className="px-5 py-3.5 border-b border-zinc-800 bg-[#090B10] flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="p-1.5 rounded-lg bg-indigo-950/50 border border-indigo-800/40 text-indigo-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-zinc-100 truncate">
                {nodeData.label || 'تفاصيل وفحص العقدة'}
              </div>
              <div className="text-[10px] text-zinc-400 flex items-center gap-1.5 font-mono">
                <span className="uppercase text-indigo-400 font-semibold">{selectedNode.type}</span>
                <span>•</span>
                <span className="text-zinc-500">{selectedNode.id}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onRunSingleNode(selectedNode.id)}
              disabled={isRunning || nodeData.status === 'running'}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-[11px] font-bold transition shadow-sm"
              title="تشغيل هذه العقدة فوراً بالمدخلات الحالية"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>تشغيل</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              title="إغلاق اللوحة الجانبية"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center px-4 border-b border-zinc-800/80 bg-[#0C0E14] text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('prompt')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition flex items-center gap-1 ${
              activeTab === 'prompt'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>الموجه (Prompt)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('filters')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition flex items-center gap-1 ${
              activeTab === 'filters'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>الفلاتر والأسلوب</span>
            {(nodeData.targetTone || nodeData.lengthPreference) && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('output')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'output'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>المخرجات</span>
            {nodeData.output && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('advanced')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition ${
              activeTab === 'advanced'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            إعدادات
          </button>
        </div>

        {/* Tab 1: Prompt & Upstream Variables */}
        {activeTab === 'prompt' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 select-text">
            {/* Prompt Library Quick Trigger */}
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300">
                محرر الأمر الموسّع (System Prompt):
              </label>

              <button
                type="button"
                onClick={() => setIsLibraryOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 text-[11px] font-medium border border-zinc-700/60 transition shadow-sm hover:border-amber-500/50"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>📚 مكتبة الأوامر (+20)</span>
              </button>
            </div>

            {/* Upstream Variables Chips */}
            {upstreamVariables.length > 0 && (
              <div className="p-3 rounded-xl bg-[#12141C] border border-zinc-800 space-y-1.5">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                  المتغيرات المتاحة من العقد السابقة (انقر للإدراج فوراً):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {upstreamVariables.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleInsertVariable(v.handleTag)}
                      className="px-2 py-1 rounded-md bg-zinc-900 hover:bg-indigo-950/70 border border-zinc-700 hover:border-indigo-500/60 text-zinc-200 hover:text-indigo-300 text-[11px] font-mono transition flex items-center gap-1"
                      title={`إدراج ${v.handleTag} من [${v.label}]`}
                    >
                      <span className="text-indigo-400">{v.handleTag}</span>
                      <span className="text-zinc-500 text-[9px]">({v.label})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Large Prompt Textarea with Instant Two-Way Sync */}
            <textarea
              ref={promptTextareaRef}
              rows={11}
              value={
                selectedNode.type === 'imageAI'
                  ? (nodeData.imagePrompt ?? nodeData.prompt ?? '')
                  : (nodeData.systemPrompt ?? nodeData.prompt ?? '')
              }
              onChange={(e) =>
                handleUpdate(
                  selectedNode.type === 'imageAI'
                    ? {
                        imagePrompt: e.target.value,
                        prompt: e.target.value,
                      }
                    : {
                        systemPrompt: e.target.value,
                        prompt: e.target.value,
                      }
                )
              }
              placeholder={
                selectedNode.type === 'imageAI'
                  ? 'اكتب وصف ونمط الصورة (Prompt) هنا بحرية...'
                  : 'اكتب التعليمات والأوامر الموجهة للنموذج هنا براحة تامة وبدون قيود...'
              }
              className="w-full bg-[#121316] border border-zinc-800 rounded-xl p-3.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 leading-relaxed font-sans resize-y min-h-[200px]"
              dir="auto"
            />

            {/* Model & Drawing Engine Selector */}
            {selectedNode.type === 'imageAI' ? (
              <div className="pt-1">
                <label className="text-[11px] font-medium text-pink-400 block mb-1">
                  النموذج ومحرك الرسم:
                </label>
                <select
                  value={nodeData.model || 'google-imagen-3'}
                  onChange={(e) => handleUpdate({ model: e.target.value })}
                  className="w-full bg-[#121316] border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-pink-500 cursor-pointer"
                >
                  <option value="google-imagen-3" className="bg-[#11131A] text-white">
                    Google Imagen 3 (فائق الدقة - موصى به ⭐)
                  </option>
                  <option value="flux-1-schnell" className="bg-[#11131A] text-white">
                    Flux.1 Schnell (سريع)
                  </option>
                  <option value="flux-1-dev" className="bg-[#11131A] text-white">
                    Flux.1 Pro (احترافي)
                  </option>
                  <option value="dall-e-3" className="bg-[#11131A] text-white">
                    DALL-E 3 (OpenAI)
                  </option>
                  <option value="midjourney-v6-1" className="bg-[#11131A] text-white">
                    Midjourney v6.1
                  </option>
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                    النموذج الذكي:
                  </label>
                  <select
                    value={nodeData.model || DEFAULT_TEXT_MODEL}
                    onChange={(e) => handleUpdate({ model: e.target.value })}
                    className="w-full bg-[#121316] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 font-sans"
                  >
                    <optgroup label="Google AI (متصل تلقائياً 🟢)" className="bg-[#11131A] text-zinc-300">
                      {TEXT_MODELS.filter((m) => m.provider === 'google').map((m) => (
                        <option key={m.id} value={m.id} className="bg-[#11131A] text-white">
                          {m.name} {m.badge ? `— ${m.badge}` : ''}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Groq Cloud (فائق السرعة 🦙)" className="bg-[#11131A] text-zinc-300">
                      {TEXT_MODELS.filter((m) => m.provider === 'groq').map((m) => (
                        <option key={m.id} value={m.id} className="bg-[#11131A] text-white">
                          {m.name} {m.badge ? `— ${m.badge}` : ''}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="OpenAI (🔑 للمشتركين / BYOK)" className="bg-[#11131A] text-zinc-300">
                      {TEXT_MODELS.filter((m) => m.provider === 'openai').map((m) => (
                        <option key={m.id} value={m.id} className="bg-[#11131A] text-white">
                          {m.name} {m.badge ? `— ${m.badge}` : ''}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Anthropic (🔑 للمشتركين / BYOK)" className="bg-[#11131A] text-zinc-300">
                      {TEXT_MODELS.filter((m) => m.provider === 'anthropic').map((m) => (
                        <option key={m.id} value={m.id} className="bg-[#11131A] text-white">
                          {m.name} {m.badge ? `— ${m.badge}` : ''}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                    درجة الإبداع (Temperature):
                  </label>
                  <div className="flex items-center gap-2 bg-[#121316] border border-zinc-800 rounded-lg px-2.5 py-1.5">
                    <input
                      type="range"
                      min="0"
                      max="1.2"
                      step="0.1"
                      value={nodeData.temperature ?? 0.7}
                      onChange={(e) =>
                        handleUpdate({
                          temperature: parseFloat(e.target.value),
                        })
                      }
                      className="w-full h-1 bg-zinc-700 accent-indigo-500 cursor-pointer"
                    />
                    <span className="font-mono text-xs text-zinc-300">
                      {nodeData.temperature ?? 0.7}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Filters, Tone & Node-Specific Controls */}
        {activeTab === 'filters' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-5 select-text">
            {/* Tone Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                <span>فلتر النبرة والأسلوب (Target Tone):</span>
                <span className="text-[10px] text-indigo-400 font-mono">
                  {nodeData.targetTone || 'saudi'}
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TONES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleUpdate({ targetTone: t.id as any })}
                    className={`p-2.5 rounded-xl border text-right transition-all flex flex-col ${
                      (nodeData.targetTone || 'saudi') === t.id
                        ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/40'
                        : 'bg-[#121316] border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-xs font-bold">{t.label}</span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Length Preference */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                <span>فلتر الطول والتفصيل (Length Preference):</span>
                <span className="text-[10px] text-indigo-400 font-mono">
                  {nodeData.lengthPreference || 'balanced'}
                </span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {LENGTHS.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => handleUpdate({ lengthPreference: l.id as any })}
                    className={`py-2 px-2.5 rounded-xl border text-center transition-all text-xs font-medium ${
                      (nodeData.lengthPreference || 'balanced') === l.id
                        ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/40'
                        : 'bg-[#121316] border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Node-Specific Dynamic Fields */}
            {selectedNode.type === 'jsonExtractor' && (
              <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                <label className="text-xs font-semibold text-zinc-300 block">
                  الحقول المطلوب استخراجها (مفصولة بفواصل):
                </label>
                <input
                  type="text"
                  value={nodeData.fields || ''}
                  onChange={(e) => handleUpdate({ fields: e.target.value })}
                  placeholder="العنوان, الملخص_التنفيذي, التصنيف, الكلمات_المفتاحية"
                  className="w-full bg-[#121316] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {selectedNode.type === 'structuredOutput' && (
              <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                <label className="text-xs font-semibold text-zinc-300 block">
                  مخطط الـ JSON الإلزامي (Schema):
                </label>
                <textarea
                  rows={6}
                  value={nodeData.jsonSchema || ''}
                  onChange={(e) => handleUpdate({ jsonSchema: e.target.value })}
                  className="w-full bg-[#121316] border border-zinc-800 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-indigo-500"
                  dir="ltr"
                />
              </div>
            )}

            {selectedNode.type === 'httpRequest' && (
              <div className="space-y-3 pt-2 border-t border-zinc-800">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    طريقة الطلب (Method) و الرابط (URL):
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={nodeData.httpMethod || 'GET'}
                      onChange={(e) => handleUpdate({ httpMethod: e.target.value as any })}
                      className="bg-[#121316] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none font-mono"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                    <input
                      type="text"
                      value={nodeData.httpUrl || ''}
                      onChange={(e) => handleUpdate({ httpUrl: e.target.value })}
                      placeholder="https://api.example.com/endpoint"
                      className="flex-1 bg-[#121316] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-indigo-500"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    ترويسات الطلب (Headers JSON):
                  </label>
                  <textarea
                    rows={4}
                    value={
                      typeof nodeData.httpHeaders === 'string'
                        ? nodeData.httpHeaders
                        : JSON.stringify(nodeData.httpHeaders || {}, null, 2)
                    }
                    onChange={(e) => handleUpdate({ httpHeaders: e.target.value })}
                    className="w-full bg-[#121316] border border-zinc-800 rounded-xl p-2.5 text-xs font-mono text-zinc-300 focus:outline-none focus:border-indigo-500"
                    dir="ltr"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Output Viewer & Manual Editor */}
        {activeTab === 'output' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 select-text">
            {/* Output Bar & Version History */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-300">النتيجة:</span>
                {history.length > 1 && (
                  <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-0.5 text-xs text-zinc-400">
                    <History className="w-3 h-3 text-zinc-400" />
                    <button
                      type="button"
                      disabled={currentIndex === 0}
                      onClick={() => handleSelectHistoryVersion(currentIndex - 1)}
                      className="hover:text-white disabled:opacity-30"
                      title="النسخة السابقة"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                    <span className="font-mono text-[11px] text-zinc-200">
                      {currentIndex + 1} / {history.length}
                    </span>
                    <button
                      type="button"
                      disabled={currentIndex === history.length - 1}
                      onClick={() => handleSelectHistoryVersion(currentIndex + 1)}
                      className="hover:text-white disabled:opacity-30"
                      title="النسخة التالية"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (outputEditMode) {
                      handleSaveOutputEdit();
                    } else {
                      setOutputEditMode(true);
                    }
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] border border-zinc-700/60 transition"
                >
                  {outputEditMode ? (
                    <>
                      <Save className="w-3 h-3 text-emerald-400" />
                      <span>حفظ التعديل</span>
                    </>
                  ) : (
                    <span>تعديل يدوي ✏️</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition border border-zinc-700/60"
                  title="نسخ النتيجة"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message Display if any */}
            {(nodeData.status === 'error' && (nodeData.missingKey || nodeData.errorMessage?.includes('مفتاح'))) ? (
              <div className="p-4 rounded-xl bg-gradient-to-b from-amber-950/40 to-rose-950/30 border border-amber-500/40 text-amber-200 text-xs space-y-3 animate-fadeIn shadow-lg shadow-black/40">
                <div className="flex items-start gap-2.5">
                  <span className="text-xl leading-none">🔑</span>
                  <div className="flex-1 space-y-1">
                    <span className="font-bold text-amber-100 block text-xs">
                      مفتاح الـ API غير متوفر لهذا النموذج
                    </span>
                    <span className="text-amber-200/80 leading-relaxed block text-[11px]">
                      {nodeData.errorMessage || 'يرجى إدخال مفتاح الـ API في الإعدادات لتشغيل هذا النموذج'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent('promptflow:open-settings', {
                        detail: { tab: 'keys', focusKey: nodeData.requiredProvider || 'openai' },
                      })
                    );
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-100 text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95 shadow-sm"
                >
                  <Key className="w-3.5 h-3.5 text-amber-300" />
                  <span>فتح الإعدادات وإدخال المفتاح ⚙️</span>
                </button>

                <div className="pt-2 border-t border-amber-500/20 space-y-1.5">
                  <span className="text-[10px] text-zinc-400 block font-semibold">
                    أو بدّل فورياً إلى نموذج مجاني (Free Tier):
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleUpdate({
                          model: 'gemini-1.5-flash',
                          status: 'idle',
                          errorMessage: undefined,
                          missingKey: false,
                        });
                      }}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sky-300 border border-zinc-700 text-[11px] font-medium transition text-center"
                    >
                      Gemini Flash ⚡
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleUpdate({
                          model: 'llama-3.3-70b-versatile',
                          status: 'idle',
                          errorMessage: undefined,
                          missingKey: false,
                        });
                      }}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-zinc-700 text-[11px] font-medium transition text-center"
                    >
                      Llama 3.3 (Groq) 🦙
                    </button>
                  </div>
                </div>
              </div>
            ) : (nodeData.status === 'error' || nodeData.errorMessage) ? (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-rose-200 block">خطأ في التنفيذ</span>
                  <span className="text-rose-300/90 leading-relaxed block text-[11px]">
                    {nodeData.errorMessage || 'حدث خطأ أثناء الاتصال بالنموذج'}
                  </span>
                </div>
              </div>
            ) : null}

            {/* Output View / Textarea / Loading State */}
            {nodeData.status === 'running' || isRunning ? (
              <div
                className="bg-[#121316] border border-indigo-500/30 rounded-xl p-6 text-center text-xs text-indigo-300 font-sans space-y-3"
                dir="auto"
              >
                <Loader2 className="w-6 h-6 animate-spin text-indigo-400 mx-auto" />
                <div>
                  <p className="font-semibold text-zinc-200">جارٍ التوليد الفعلي من الذكاء الاصطناعي...</p>
                  <p className="text-[11px] text-zinc-400 mt-1">يتم إرسال الطلب للنموذج مباشرة بدون أي محاكاة وهمية</p>
                </div>
                {nodeData.output && (
                  <div className="mt-3 text-right bg-zinc-900/80 p-3 rounded-lg border border-zinc-800 text-zinc-200 font-mono text-[11px] whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {nodeData.output}
                    <span className="inline-block w-1.5 h-3 bg-indigo-400 ml-1 animate-pulse" />
                  </div>
                )}
              </div>
            ) : outputEditMode ? (
              <textarea
                rows={14}
                value={editableOutput}
                onChange={(e) => setEditableOutput(e.target.value)}
                className="w-full bg-[#121316] border border-indigo-500/50 rounded-xl p-3.5 text-xs text-zinc-100 focus:outline-none leading-relaxed font-sans resize-y min-h-[260px]"
                dir="auto"
              />
            ) : (
              <div
                className="bg-[#121316] border border-zinc-800 rounded-xl p-4 text-xs text-zinc-200 leading-relaxed max-h-[400px] overflow-y-auto font-sans"
                dir="auto"
              >
                {nodeData.output ? (
                  <div className="prose prose-invert prose-xs max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {nodeData.output}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <span className="text-zinc-500 italic">
                    لا توجد مخرجات بعد. اضغط &quot;تشغيل&quot; لتنفيذ العقدة.
                  </span>
                )}
              </div>
            )}

            {/* Detailed Node Stats */}
            <div className="p-3.5 rounded-xl bg-[#12141C] border border-zinc-800 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="text-[10px] text-zinc-400">الكلمات</div>
                <div className="font-mono font-bold text-zinc-200 mt-0.5">
                  {wordCount}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-zinc-400">التوكنز التقديرية</div>
                <div className="font-mono font-bold text-amber-400 mt-0.5">
                  ~{approxTokens}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-zinc-400">مدة التنفيذ</div>
                <div className="font-mono font-bold text-emerald-400 mt-0.5">
                  {nodeData.executionDuration
                    ? `${nodeData.executionDuration.toFixed(1)}s`
                    : '—'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Advanced Options */}
        {activeTab === 'advanced' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            <div>
              <label className="text-zinc-400 block mb-1">تسمية العقدة:</label>
              <input
                type="text"
                value={nodeData.label || ''}
                onChange={(e) => handleUpdate({ label: e.target.value })}
                className="w-full bg-[#121316] border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-zinc-400 block mb-1">المعرف الفريد (ID):</label>
              <input
                type="text"
                readOnly
                value={selectedNode.id}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-400 font-mono"
              />
            </div>

            <div className="pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  handleUpdate({
                    output: '',
                    status: 'idle',
                    executionDuration: undefined,
                    tokensUsed: undefined,
                    _cachedFingerprint: undefined,
                  });
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة تعيين مخرجات هذه العقدة</span>
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Built-in Prompt Library Modal */}
      <PromptLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        targetNodeTitle={nodeData.label}
        onSelectPrompt={handleSelectLibraryPrompt}
      />
    </>
  );
};
