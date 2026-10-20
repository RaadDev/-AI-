'use client';

import React, { memo, useState, useRef } from 'react';
import { Handle, NodeProps, useReactFlow } from '@xyflow/react';
import {
  FileText,
  ClipboardPaste,
  Upload,
  Trash2,
  Sparkles,
  Check,
  AlertCircle,
  Braces,
  Type,
} from 'lucide-react';
import { NodeContainer } from './NodeContainer';
import { WorkflowNodeData } from '@/types/workflow';
import { useHandlePositions } from '@/utils/useHandlePositions';

const INPUT_PRESETS = [
  {
    name: '💻 كود للمراجعة (SQL/TS)',
    text: `export async function getUserProfile(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  // فحص أمني: استعلام SQL مباشر وثغرة حقن (SQL Injection):
  const user = await db.query(\`SELECT * FROM users WHERE id = \${id}\`);
  return Response.json(user);
}`,
  },
  {
    name: '💡 فكرة إعلان',
    text: 'إطلاق تطبيق ذكي جديد لأتمتة سير العمل اليومي للشركات الناشئة، مع خصم 30% لأول 100 مشترك وضمان استرجاع الأموال خلال 14 يوماً.',
  },
  {
    name: '📝 مسودة مقال',
    text: 'كيف تعيد نماذج الذكاء الاصطناعي التوليدي وهندسة الأوامر (Prompt Engineering) تشكيل مستقبل إنتاجية المطورين وصناع المحتوى في 2026.',
  },
  {
    name: '📊 أرقام للتحليل',
    text: 'نتائج الربع الأول: الإيرادات 145,000 ريال، تكلفة الاستحواذ على العميل 45 ريال، معدل التحويل 4.2%، مع ملاحظة زيادة بنسبة 25% في المبيعات عبر الجوال.',
  },
  {
    name: '🗂️ بيانات JSON',
    text: JSON.stringify(
      {
        campaignName: 'حملة الصيف التقنية',
        targetAudience: 'المطورون ورواد الأعمال',
        budgetSar: 25000,
        channels: ['Twitter', 'LinkedIn', 'Google Ads'],
      },
      null,
      2
    ),
  },
];

export const TextInputNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as WorkflowNodeData;
  const { updateNodeData } = useReactFlow();
  const { sourcePosition } = useHandlePositions();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pasteFeedback, setPasteFeedback] = useState(false);
  const [inputMode, setInputMode] = useState<'text' | 'json'>('text');

  const currentText = String(nodeData.text || '');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(id, {
      text: e.target.value,
      output: e.target.value,
    });
  };

  const handleApplyPreset = (presetText: string) => {
    updateNodeData(id, {
      text: presetText,
      output: presetText,
    });
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        updateNodeData(id, {
          text,
          output: text,
        });
        setPasteFeedback(true);
        setTimeout(() => setPasteFeedback(false), 1500);
      }
    } catch {
      // Fallback or permission blocked
    }
  };

  const handleFileLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const resultText = String(event.target?.result || '');
      updateNodeData(id, {
        text: resultText,
        output: resultText,
        fileName: file.name,
      });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClear = () => {
    updateNodeData(id, {
      text: '',
      output: '',
    });
  };

  // Metrics
  const trimmed = currentText.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  const charCount = currentText.length;
  const approxTokens = Math.round(charCount / 3.5);
  const readingTimeMin = (wordCount / 200).toFixed(1);

  // JSON Validation if in JSON mode
  let isJsonValid = false;
  if (inputMode === 'json' && trimmed) {
    try {
      JSON.parse(trimmed);
      isJsonValid = true;
    } catch {
      isJsonValid = false;
    }
  }

  return (
    <div className="relative group">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.json,.csv"
        className="hidden"
        onChange={handleFileLoad}
      />

      <NodeContainer
        nodeId={id}
        title={nodeData.label || 'مدخل نصي رئيسي (Input)'}
        category="Input"
        icon={<FileText className="w-4 h-4 text-sky-400" />}
        status={nodeData.status}
        accentColor="sky"
        width="w-[380px]"
        selected={selected}
        isCollapsed={nodeData.isCollapsed}
      >
        <div className="space-y-2.5">
          {/* Quick Toolbar: Presets & Tools */}
          <div className="flex items-center justify-between gap-1 text-xs">
            {/* Quick Actions (Paste, File, Clear) */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePaste}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-[11px] font-medium transition cursor-pointer"
                title="لصق مباشر من الحافظة"
              >
                {pasteFeedback ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <ClipboardPaste className="w-3 h-3 text-sky-400" />
                )}
                <span>{pasteFeedback ? 'تم اللصق' : 'لصق'}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-[11px] font-medium transition cursor-pointer"
                title="استيراد نص من ملف (TXT, MD, JSON, CSV)"
              >
                <Upload className="w-3 h-3 text-emerald-400" />
                <span>ملف</span>
              </button>

              {currentText && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition cursor-pointer"
                  title="مسح النص"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Mode Toggle (Text / JSON) */}
            <div className="flex bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 text-[10px]">
              <button
                type="button"
                onClick={() => setInputMode('text')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded transition cursor-pointer ${
                  inputMode === 'text'
                    ? 'bg-zinc-800 text-white font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Type className="w-2.5 h-2.5" />
                <span>نص</span>
              </button>
              <button
                type="button"
                onClick={() => setInputMode('json')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded transition cursor-pointer ${
                  inputMode === 'json'
                    ? 'bg-zinc-800 text-white font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Braces className="w-2.5 h-2.5" />
                <span>JSON</span>
              </button>
            </div>
          </div>

          {/* Quick Preset Pills */}
          <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none">
            {INPUT_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleApplyPreset(p.text)}
                className="text-[10px] whitespace-nowrap bg-[#0C0E14] hover:bg-sky-950/40 hover:text-sky-300 border border-zinc-800/80 px-2 py-0.5 rounded-md text-zinc-400 transition cursor-pointer"
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Main Textarea */}
          <div className="relative">
            <textarea
              className={`w-full bg-black/40 border rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none resize-y min-h-[110px] max-h-72 transition-all leading-relaxed scrollbar-thin scrollbar-thumb-white/10 ${
                inputMode === 'json'
                  ? 'font-mono text-[11px] border-white/[0.08] focus:border-violet-500/60 focus:bg-black/60'
                  : 'font-sans border-white/[0.08] focus:border-sky-500/60 focus:bg-black/60'
              }`}
              rows={5}
              placeholder={
                inputMode === 'json'
                  ? '{\n  "prompt": "اكتب محتوى JSON هنا..."\n}'
                  : 'اكتب النص، السؤال، أو الصق محتوى المسودة هنا لتدفقه إلى العقد التالية...'
              }
              value={currentText}
              onChange={handleChange}
              dir={inputMode === 'json' ? 'ltr' : 'auto'}
            />

            {inputMode === 'json' && trimmed && (
              <div className="absolute left-2.5 bottom-3 pointer-events-none">
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-md font-mono font-bold flex items-center gap-1 ${
                    isJsonValid
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {isJsonValid ? (
                    <>
                      <Check className="w-2.5 h-2.5" />
                      <span>JSON سليم</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-2.5 h-2.5" />
                      <span>خطأ في بنية الـ JSON</span>
                    </>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Stats & Metrics Footer */}
          <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1.5 border-t border-zinc-800/60 font-mono">
            <div className="flex items-center gap-2">
              <span className="text-zinc-300 font-semibold">{wordCount} كلمة</span>
              <span className="text-zinc-600">•</span>
              <span>{charCount} حرف</span>
              <span className="text-zinc-600">•</span>
              <span className="text-sky-400 font-semibold">~{approxTokens} توكن</span>
            </div>

            <span className="text-zinc-500 font-sans">
              {wordCount > 0 ? `قراءة ~${readingTimeMin} د` : 'في انتظار الإدخال'}
            </span>
          </div>
        </div>
      </NodeContainer>

      {/* Output Handle */}
      <Handle
        type="source"
        position={sourcePosition}
        id="output"
        className="!bg-sky-400 !border-slate-900 !w-3.5 !h-3.5"
      />
    </div>
  );
});

TextInputNode.displayName = 'TextInputNode';
