'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  FileText,
  Eye,
  Edit3,
  Maximize2,
  Save,
  Printer,
  Code,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialContent: string;
  onSave?: (updatedContent: string) => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  initialContent,
  onSave,
}) => {
  const [content, setContent] = useState(initialContent);
  const [mode, setMode] = useState<'preview' | 'edit'>('preview');
  const [copied, setCopied] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent, isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSave = () => {
    onSave?.(content);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 1200);
  };

  const handleDownload = (ext: 'md' | 'txt' | 'json') => {
    let payload = content;
    let mimeType = 'text/plain;charset=utf-8';

    if (ext === 'json') {
      try {
        // If content is already valid JSON string, pretty print it
        const parsed = JSON.parse(content);
        payload = JSON.stringify(parsed, null, 2);
      } catch {
        payload = JSON.stringify(
          {
            title,
            content,
            exportedAt: new Date().toISOString(),
          },
          null,
          2
        );
      }
      mimeType = 'application/json;charset=utf-8';
    }

    const blob = new Blob([payload], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `content-${Date.now()}.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <title>${title || 'مستند PF Studio'}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.8; color: #111; max-width: 800px; margin: 40px auto; padding: 0 20px; }
            h1, h2, h3 { color: #1e3a8a; }
            pre { background: #f1f5f9; padding: 15px; border-radius: 8px; font-family: monospace; }
            blockquote { border-right: 4px solid #3b82f6; padding-right: 12px; margin: 20px 0; color: #475569; }
          </style>
        </head>
        <body>
          <h2>${title || 'مخرجات السلسلة الذكية'}</h2>
          <hr />
          <div style="white-space: pre-wrap; font-size: 15px;">${content}</div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      dir="rtl"
    >
      <div
        className="w-full max-w-4xl h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
              <Maximize2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                <span>{title || 'معاينة النتيجة'}</span>
                <span className="text-[10px] bg-sky-950 text-sky-400 border border-sky-800/60 px-2 py-0.5 rounded-full font-mono">
                  Full Preview
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {wordCount} كلمة • {charCount} حرف
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-950/80 border border-slate-800 p-0.5 rounded-xl text-xs">
              <button
                onClick={() => setMode('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition font-medium ${
                  mode === 'preview'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>منسق</span>
              </button>
              <button
                onClick={() => setMode('edit')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition font-medium ${
                  mode === 'edit'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>تعديل</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/40 select-text">
          {mode === 'preview' ? (
            <div className="max-w-none text-slate-100 text-sm leading-relaxed space-y-4 font-sans prose prose-invert prose-headings:text-sky-300 prose-a:text-sky-400 prose-code:text-amber-300 prose-pre:bg-slate-900">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content || '*لا يوجد نص متاح حالياً*'}
              </ReactMarkdown>
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full min-h-[400px] bg-slate-950/90 border border-slate-800 rounded-2xl p-4 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono resize-none leading-relaxed"
              placeholder="اكتب أو عدل النص هنا..."
              dir="auto"
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {onSave && (
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition active:scale-95 shadow-sm shadow-emerald-900/30"
              >
                {savedFeedback ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>تم حفظ التعديل!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>حفظ في العقدة</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-medium transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintPdf}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs transition"
              title="طباعة أو تصدير PDF"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-400" />
              <span>طباعة / PDF</span>
            </button>
            <button
              onClick={() => handleDownload('md')}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs transition"
              title="تصدير كملف Markdown"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.md</span>
            </button>
            <button
              onClick={() => handleDownload('json')}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs transition"
              title="تصدير كملف JSON"
            >
              <Code className="w-3.5 h-3.5 text-cyan-400" />
              <span>JSON</span>
            </button>
            <button
              onClick={() => handleDownload('txt')}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs transition"
              title="تصدير كملف نصي"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>.txt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
