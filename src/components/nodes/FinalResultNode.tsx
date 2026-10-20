'use client';

import React, { memo, useState, useEffect, useMemo } from 'react';
import { Handle, NodeProps, useReactFlow, useEdges, useNodes } from '@xyflow/react';
import {
  Award,
  Copy,
  Check,
  Download,
  Trash2,
  FileDown,
  Maximize2,
  Eye,
  FileCode,
  ExternalLink,
  ImageIcon,
  Braces,
  Edit3,
  Save,
  Printer,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { NodeContainer } from './NodeContainer';
import { WorkflowNodeData } from '@/types/workflow';
import { PreviewModal } from '@/components/canvas/PreviewModal';
import { useHandlePositions } from '@/utils/useHandlePositions';
import { getNodeOutputValue } from '@/engine/executionEngine';

function parseOutputContent(raw: string) {
  if (!raw) return { text: '', imageUrls: [] };

  const urlRegex = /(https?:\/\/[^\s<>"')]+|data:image\/[a-zA-Z]+;base64,[^\s<>"')]+)/gi;
  const imageUrls: string[] = [];

  const matches = raw.match(urlRegex) || [];
  for (const match of matches) {
    const isImage =
      /\.(png|jpe?g|webp|svg|gif)(\?.*)?$/i.test(match) ||
      match.includes('images.unsplash.com') ||
      match.includes('oaidalleapiprodscus') ||
      match.includes('fal.media') ||
      match.includes('replicate.delivery') ||
      match.includes('pollinations.ai') ||
      match.startsWith('data:image/');

    if (isImage && !imageUrls.includes(match)) {
      imageUrls.push(match);
    }
  }

  // Clean raw image URLs from text if they appear as standalone links
  let cleanedText = raw;
  imageUrls.forEach((img) => {
    cleanedText = cleanedText
      .replace(new RegExp(`!\\[[^\\]]*\\]\\(${escapeRegex(img)}\\)`, 'gi'), '')
      .replace(new RegExp(`=== 🖼️ رابط الصورة الإعلانية المصممة ===\\s*${escapeRegex(img)}`, 'gi'), '')
      .replace(new RegExp(`=== 🖼️ رابط الصورة الإعلانية ===\\s*${escapeRegex(img)}`, 'gi'), '')
      .replace(img, '')
      .trim();
  });

  // Clean legacy mock wrapper prefix if present
  cleanedText = cleanedText
    .replace(/^\[تمت المعالجة عبر [^\]]+\]\s*السياق المعالج:\s*[\s\S]*?النتيجة:\s*/i, '')
    .trim();

  return { text: cleanedText, imageUrls };
}

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const FinalResultNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as WorkflowNodeData;
  const { updateNodeData } = useReactFlow();
  const { targetPosition } = useHandlePositions();

  const [copied, setCopied] = useState(false);
  const [content, setContent] = useState(nodeData.output || '');
  const [viewMode, setViewMode] = useState<'preview' | 'raw' | 'json' | 'edit'>('preview');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState<'all' | string>('all');
  const [editBuffer, setEditBuffer] = useState('');

  const edges = useEdges();
  const nodes = useNodes();

  // Find all incoming source nodes
  const incomingEdges = useMemo(() => edges.filter((e) => e.target === id), [edges, id]);

  const incomingSources = useMemo(() => {
    return incomingEdges.map((edge) => {
      const srcNode = nodes.find((n) => n.id === edge.source);
      const d = (srcNode?.data || {}) as WorkflowNodeData;
      const outputVal = getNodeOutputValue(edge.source, nodes, {}) || d.output || d.imageUrl || d.text || '';
      return {
        id: edge.source,
        label: d.label || edge.source,
        type: srcNode?.type || 'node',
        value: String(outputVal),
      };
    });
  }, [incomingEdges, nodes]);

  // Combined master output
  const upstreamJoined = useMemo(() => {
    return incomingSources
      .map((s) => s.value)
      .filter((v) => Boolean(v && v.trim()))
      .join('\n\n==============================\n\n');
  }, [incomingSources]);

  // Sync upstream joined to nodeData.output if it changed
  useEffect(() => {
    if (upstreamJoined && upstreamJoined !== nodeData.output) {
      updateNodeData(id, { output: upstreamJoined });
      setContent(upstreamJoined);
    }
  }, [upstreamJoined, id, nodeData.output, updateNodeData]);

  useEffect(() => {
    if (nodeData.output !== undefined) {
      setContent(nodeData.output);
    }
  }, [nodeData.output]);

  // Active display text depends on whether a specific source tab is selected
  const displayContent = useMemo(() => {
    if (selectedSourceId === 'all') {
      return content;
    }
    const targetSource = incomingSources.find((s) => s.id === selectedSourceId);
    return targetSource ? targetSource.value : content;
  }, [selectedSourceId, incomingSources, content]);

  const { text: cleanedText, imageUrls } = parseOutputContent(displayContent);
  const isImageOnly = imageUrls.length > 0 && !cleanedText.trim();
  const wordCount = cleanedText.trim() ? cleanedText.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = displayContent.length;
  const approxTokens = Math.round(charCount / 3.5);
  const readingTimeMin = (wordCount / 200).toFixed(1);

  // Check if content is valid JSON
  const jsonParsed = useMemo(() => {
    if (!displayContent || !displayContent.trim()) return null;
    try {
      const parsed = JSON.parse(displayContent.trim());
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
    } catch {}
    return null;
  }, [displayContent]);

  const handleCopy = () => {
    if (!displayContent) return;
    navigator.clipboard.writeText(displayContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = (ext: 'md' | 'txt' | 'json') => {
    if (!displayContent) return;
    let payload = displayContent;
    let mime = 'text/plain;charset=utf-8';

    if (ext === 'json') {
      if (jsonParsed) {
        payload = JSON.stringify(jsonParsed, null, 2);
      } else {
        payload = JSON.stringify({ result: displayContent, exportedAt: new Date().toISOString() }, null, 2);
      }
      mime = 'application/json;charset=utf-8';
    }

    const blob = new Blob([payload], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pf-studio-result-${Date.now()}.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
    setIsExportMenuOpen(false);
  };

  const handlePrint = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) return;
    printWin.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <title>${nodeData.label || 'نتيجة سير العمل - PF Studio'}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.8; color: #111; max-width: 800px; margin: 40px auto; padding: 0 20px; }
            h1, h2, h3 { color: #1e1b4b; }
            pre { background: #f4f4f5; padding: 14px; border-radius: 8px; overflow-x: auto; }
            img { max-width: 100%; border-radius: 8px; margin: 16px 0; }
          </style>
        </head>
        <body>
          <h1>${nodeData.label || 'النتيجة النهائية'}</h1>
          <hr />
          <div>${cleanedText.replace(/\n/g, '<br />')}</div>
          ${imageUrls.map((img) => `<img src="${img}" alt="Output image" />`).join('')}
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWin.document.close();
    setIsExportMenuOpen(false);
  };

  const handleClear = () => {
    updateNodeData(id, { output: '' });
    setContent('');
  };

  const handleStartEdit = () => {
    setEditBuffer(displayContent);
    setViewMode('edit');
  };

  const handleSaveEdit = () => {
    updateNodeData(id, { output: editBuffer });
    setContent(editBuffer);
    setViewMode('preview');
  };

  return (
    <div className="relative group">
      {/* Target Handle from upstream */}
      <Handle
        type="target"
        position={targetPosition}
        id="input"
        className="!bg-emerald-400 !border-slate-900 !w-3.5 !h-3.5"
      />

      <NodeContainer
        nodeId={id}
        title={nodeData.label || 'النتيجة النهائية (Final Result)'}
        category="Output"
        icon={<Award className="w-4 h-4 text-emerald-400" />}
        status={nodeData.status}
        accentColor="emerald"
        width="w-[420px]"
        selected={selected}
        isCollapsed={nodeData.isCollapsed}
      >
        <div className="space-y-2.5">
          {/* Multi-Source Input Tabs (Visible if 2+ nodes connected) */}
          {incomingSources.length > 1 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-zinc-500">
                <span className="flex items-center gap-1 font-semibold text-zinc-400">
                  <Layers className="w-3 h-3 text-emerald-400" />
                  <span>المصادر المتصلة ({incomingSources.length}):</span>
                </span>
                <span>تصفح مخرجات كل عقدة</span>
              </div>
              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedSourceId('all')}
                  className={`text-[10px] px-2.5 py-1 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                    selectedSourceId === 'all'
                      ? 'bg-emerald-600 text-white font-bold shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  الكل (المدمج)
                </button>
                {incomingSources.map((src) => (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() => setSelectedSourceId(src.id)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg font-medium transition cursor-pointer whitespace-nowrap truncate max-w-[130px] ${
                      selectedSourceId === src.id
                        ? 'bg-emerald-600 text-white font-bold shadow-sm'
                        : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                    }`}
                    title={src.label}
                  >
                    {src.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Toolbar */}
          <div className="flex items-center justify-between gap-1.5 bg-[#0A0C10] border border-zinc-800/80 rounded-xl p-1.5">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!displayContent}
                className="flex items-center gap-1 px-2.5 py-1 bg-zinc-800/80 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 border border-zinc-700/50 rounded-lg text-xs font-medium transition cursor-pointer"
                title="نسخ المخرجات"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
              </button>

              {/* Export Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsExportMenuOpen((prev) => !prev)}
                  disabled={!displayContent}
                  className="flex items-center gap-1 px-2 py-1 bg-zinc-800/80 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 rounded-lg text-xs font-medium transition border border-zinc-700/50 cursor-pointer"
                  title="تصدير بصيغ متعددة"
                >
                  <Download className="w-3.5 h-3.5 text-zinc-400" />
                  <span>تصدير</span>
                  <ChevronDown className="w-2.5 h-2.5 text-zinc-500" />
                </button>

                {isExportMenuOpen && (
                  <div className="absolute top-full right-0 mt-1.5 w-40 bg-[#0F1117] border border-zinc-800 shadow-2xl rounded-xl p-1 z-30 text-xs text-zinc-200 select-none animate-in fade-in duration-100">
                    <button
                      type="button"
                      onClick={() => handleDownload('md')}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-right transition"
                    >
                      <FileDown className="w-3.5 h-3.5 text-sky-400" />
                      <span>ملف Markdown (.md)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload('txt')}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-right transition"
                    >
                      <FileDown className="w-3.5 h-3.5 text-zinc-400" />
                      <span>نص بسيط (.txt)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload('json')}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-right transition"
                    >
                      <Braces className="w-3.5 h-3.5 text-violet-400" />
                      <span>كائن JSON (.json)</span>
                    </button>
                    <div className="h-px bg-zinc-800 my-1" />
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-right transition"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-400" />
                      <span>طباعة / حفظ PDF</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Fullscreen Expand */}
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(true)}
                disabled={!displayContent}
                className="flex items-center gap-1 px-2 py-1 bg-zinc-800/80 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 rounded-lg text-xs font-medium transition border border-zinc-700/50 cursor-pointer"
                title="تكبير العرض في نافذة كاملة"
              >
                <Maximize2 className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            </div>

            {/* View Mode Tabs (Preview / Raw / JSON / Edit) */}
            <div className="flex items-center gap-1">
              <div className="flex bg-[#11131A] border border-zinc-800/80 rounded-lg p-0.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                    viewMode === 'preview' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="عرض منسق"
                >
                  <Eye className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('raw')}
                  className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                    viewMode === 'raw' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="عرض النص الخام"
                >
                  <FileCode className="w-3 h-3" />
                </button>
                {jsonParsed && (
                  <button
                    type="button"
                    onClick={() => setViewMode('json')}
                    className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                      viewMode === 'json' ? 'bg-zinc-800 text-violet-300 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="مستكشف كائن JSON"
                  >
                    <Braces className="w-3 h-3" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => (viewMode === 'edit' ? handleSaveEdit() : handleStartEdit())}
                  className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                    viewMode === 'edit' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title={viewMode === 'edit' ? 'حفظ التعديل' : 'تعديل مباشر'}
                >
                  {viewMode === 'edit' ? <Save className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
                </button>
              </div>

              {displayContent && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 text-zinc-400 hover:text-rose-400 transition rounded cursor-pointer"
                  title="مسح النتيجة"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Result Content Box */}
          <div className="bg-black/40 border border-white/[0.08] rounded-xl p-3.5 min-h-[150px] max-h-80 overflow-y-auto select-text text-slate-100 text-sm leading-7 font-sans shadow-inner space-y-3 scrollbar-thin scrollbar-thumb-white/10">
            {displayContent ? (
              <>
                {/* 1. Edit Mode */}
                {viewMode === 'edit' && (
                  <div className="space-y-2">
                    <textarea
                      value={editBuffer}
                      onChange={(e) => setEditBuffer(e.target.value)}
                      rows={6}
                      className="w-full bg-[#0A0C10] border border-indigo-500/50 rounded-lg p-2.5 text-xs text-zinc-200 font-sans leading-relaxed focus:outline-none resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setViewMode('preview')}
                        className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 text-xs hover:bg-zinc-700"
                      >
                        إلغاء
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        className="px-3 py-1 rounded bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 flex items-center gap-1"
                      >
                        <Save className="w-3 h-3" />
                        <span>حفظ التعديلات</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Formatted Markdown View */}
                {viewMode === 'preview' && cleanedText && (
                  <div className="prose prose-invert prose-sm max-w-none text-slate-100 leading-7 font-sans" dir="auto">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {cleanedText}
                    </ReactMarkdown>
                  </div>
                )}

                {/* 3. Raw Text View */}
                {viewMode === 'raw' && cleanedText && (
                  <div className="whitespace-pre-wrap font-mono text-xs leading-6 text-slate-200" dir="auto">
                    {cleanedText}
                  </div>
                )}

                {/* 4. JSON Explorer View */}
                {viewMode === 'json' && jsonParsed && (
                  <div className="space-y-2" dir="ltr">
                    <div className="flex items-center justify-between pb-1 border-b border-zinc-800 text-[11px] font-mono">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Valid JSON</span>
                      </span>
                      <span className="text-zinc-500">
                        {Array.isArray(jsonParsed) ? `${jsonParsed.length} Items` : `${Object.keys(jsonParsed).length} Keys`}
                      </span>
                    </div>
                    <pre className="p-2.5 rounded-lg bg-[#0A0C10] border border-zinc-800 text-[11px] font-mono text-violet-300 overflow-x-auto">
                      {JSON.stringify(jsonParsed, null, 2)}
                    </pre>
                  </div>
                )}

                {/* 5. Smart Image Cards Rendering */}
                {imageUrls.map((imgUrl, idx) => (
                  <div
                    key={`${imgUrl}-${idx}`}
                    className="relative group/resimg rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-lg"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgUrl}
                      alt={`Generated Output ${idx + 1}`}
                      className="w-full max-h-56 object-cover transition-transform duration-300 group-hover/resimg:scale-102"
                    />
                    <div className="p-2.5 bg-[#090A0E]/95 border-t border-zinc-800/80 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs text-pink-400 font-medium">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>صورة مولدة بالذكاء الاصطناعي</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <a
                          href={imgUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition border border-zinc-700/60"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>فتح</span>
                        </a>
                        <a
                          href={imgUrl}
                          download={`ai-result-${Date.now()}.jpg`}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
                        >
                          <Download className="w-3 h-3" />
                          <span>تحميل</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="h-32 flex flex-col items-center justify-center text-slate-500 text-center text-xs gap-1.5">
                <Sparkles className="w-6 h-6 stroke-[1.5] text-emerald-500/60 animate-pulse" />
                <span className="font-medium text-zinc-400">في انتظار تدفق المخرجات من العقد السابقة...</span>
                <span className="text-[10px] text-zinc-600">قم بتوصيل العقد وتشغيل المسار (Run) لرؤية النتيجة النهائية</span>
              </div>
            )}
          </div>

          {/* Stats & Quality Metric Footer */}
          <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1.5 border-t border-zinc-800/60 font-mono">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">{wordCount} كلمة</span>
              <span className="text-zinc-600">•</span>
              <span>{charCount} حرف</span>
              <span className="text-zinc-600">•</span>
              <span className="text-indigo-400">~{approxTokens} توكن</span>
              {imageUrls.length > 0 && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="text-pink-400">{imageUrls.length} صورة</span>
                </>
              )}
            </div>

            <span className="text-zinc-500 font-sans">
              {wordCount > 0 ? `قراءة ~${readingTimeMin} دقيقة` : 'جاهز'}
            </span>
          </div>
        </div>
      </NodeContainer>

      {/* Full-screen Lightbox Modal */}
      <PreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title={nodeData.label || 'معاينة النتيجة النهائية'}
        initialContent={displayContent}
        onSave={(updated) => {
          updateNodeData(id, { output: updated });
          setContent(updated);
        }}
      />
    </div>
  );
});

FinalResultNode.displayName = 'FinalResultNode';
