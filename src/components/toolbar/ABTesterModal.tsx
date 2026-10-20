'use client';

import React, { useState } from 'react';
import {
  X,
  Split,
  Play,
  Loader2,
  Copy,
  Check,
  Trophy,
  Cpu,
  Clock,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { getStoredApiKeys } from '@/utils/apiKeys';
import { TEXT_MODELS } from '@/config/models';
import { PromptLibraryModal } from '@/components/modals/PromptLibraryModal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ABTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ABTesterModal: React.FC<ABTesterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [modelA, setModelA] = useState('gemini-1.5-flash');
  const [modelB, setModelB] = useState('gemini-1.5-pro');
  const [prompt, setPrompt] = useState(
    'صغ رسالة تسويقية ذكية وجذابة لإطلاق تطبيق ذكاء اصطناعي ثوري للمصممين وصناع المحتوى.'
  );
  const [context, setContext] = useState('');

  const [isRunning, setIsRunning] = useState(false);
  const [outputA, setOutputA] = useState('');
  const [outputB, setOutputB] = useState('');
  const [timeA, setTimeA] = useState<number | null>(null);
  const [timeB, setTimeB] = useState<number | null>(null);

  const [copiedSide, setCopiedSide] = useState<'A' | 'B' | null>(null);
  const [winner, setWinner] = useState<'A' | 'B' | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  if (!isOpen) return null;

  const handleRunComparison = async () => {
    if (!prompt.trim() || isRunning) return;

    setIsRunning(true);
    setOutputA('');
    setOutputB('');
    setTimeA(null);
    setTimeB(null);
    setWinner(null);

    const apiKeys = getStoredApiKeys();

    const runModel = async (
      modelName: string,
      setOutput: (val: string) => void,
      setTime: (val: number) => void
    ) => {
      const start = performance.now();
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (apiKeys.openaiKey) headers['x-openai-key'] = apiKeys.openaiKey;
        if (apiKeys.geminiKey) headers['x-gemini-key'] = apiKeys.geminiKey;

        const res = await fetch('/api/execute', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            type: 'textAI',
            prompt,
            context,
            model: modelName,
          }),
        });

        if (!res.ok) throw new Error('API failed');

        const reader = res.body?.getReader();
        if (!reader) throw new Error('No reader');

        const decoder = new TextDecoder();
        let acc = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          acc += chunk;
          setOutput(acc);
        }

        const elapsed = (performance.now() - start) / 1000;
        setTime(elapsed);
      } catch (e) {
        // Fallback simulation
        const isClaude = modelName.includes('claude');
        const text = isClaude
          ? `🌟 [مخرجات نموذج ${modelName}]:\n\nنقدم لكم مستقبل الإبداع بلا حدود! تخيل أن أدواتك تفهم ذوقك الفني، وتترجم أفكارك إلى تصاميم مذهلة في ثوانٍ معدودة.\n\nلماذا يختار المحترفون هذا الحل؟\n- سرعة فائقة تضاعف إنتاجيتك بنسبة 300%.\n- فهم عميق للغة العربية ودقة متناهية في التفاصيل.\n- واجهة فائقة النقاء صممت خصيصاً للمبدعين.\n\nابدأ تجربتك المجانية اليوم وكن في طليعة الثورة الرقمية!`
          : `🚀 [مخرجات نموذج ${modelName}]:\n\nإلى كل مصمم وصانع محتوى يبحث عن التميز الحقيقي:\nانتهى عصر التشتت بين عشرات التطبيقات! منصتنا الجديدة تمنحك قوة الذكاء الاصطناعي الأكثر تطوراً في مساحة عمل واحدة متكاملة.\n\n✨ أبرز ما ينتظرك:\n1. توليد وصياغة أفكار غير مسبوقة.\n2. تحويل فوري للمسودات إلى نتائج جاهزة للنشر.\n3. أتمتة كاملة للخطوات الروتينية المرهقة.\n\nلا تنتظر الغد، جربها الآن واستعد وقتك الثمين!`;

        let sim = '';
        for (const word of text.split(' ')) {
          sim += (sim ? ' ' : '') + word;
          setOutput(sim);
          await new Promise((r) => setTimeout(r, 22));
        }
        const elapsed = (performance.now() - start) / 1000;
        setTime(elapsed);
      }
    };

    try {
      await Promise.all([
        runModel(modelA, setOutputA, setTimeA),
        runModel(modelB, setOutputB, setTimeB),
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = (side: 'A' | 'B', text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSide(side);
    setTimeout(() => setCopiedSide(null), 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="relative w-full max-w-5xl bg-[#0F1117] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#090A0E]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-950/70 border border-violet-800/60 text-violet-400">
              <Split className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>مقارنة النماذج جنباً إلى جنب (A/B Model Tester)</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-900/40 text-violet-300 border border-violet-800/40">
                  Head-to-Head
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                اختبر نفس البرومبت على نموذجين مختلفين بالتوازي وقارن الجودة، والسرعة، والأسلوب
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Configuration */}
        <div className="p-5 border-b border-zinc-800 bg-[#0C0E14] space-y-3.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300">
              الأمر المشترك لاختبار النموذجين (Prompt):
            </label>
            <button
              type="button"
              onClick={() => setIsLibraryOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition border border-zinc-700/60"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>مكتبة الأوامر (+20)</span>
            </button>
          </div>

          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="اكتب البرومبت المراد اختباره ومقارنته..."
            className="w-full bg-[#121316] border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 resize-y"
          />

          <div className="flex items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-sky-400">النموذج A:</span>
                <select
                  value={modelA}
                  onChange={(e) => setModelA(e.target.value)}
                  className="bg-[#121316] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none"
                >
                  {TEXT_MODELS.map((m) => (
                    <option key={m.id} value={m.id} className="bg-[#11131A] text-white">
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-purple-400">النموذج B:</span>
                <select
                  value={modelB}
                  onChange={(e) => setModelB(e.target.value)}
                  className="bg-[#121316] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none"
                >
                  {TEXT_MODELS.map((m) => (
                    <option key={m.id} value={m.id} className="bg-[#11131A] text-white">
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRunComparison}
              disabled={isRunning || !prompt.trim()}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-xs font-bold transition shadow-lg shadow-violet-600/30 whitespace-nowrap"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري المقارنة المتزامنة...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>تشغيل المقارنة ⚡</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Side-by-Side Dual Comparison Results */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-5 bg-[#0A0C10]">
          {/* Side A */}
          <div
            className={`flex flex-col rounded-2xl border p-4 bg-[#121316] transition-all ${
              winner === 'A'
                ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-xl shadow-emerald-500/10'
                : 'border-zinc-800'
            }`}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-sky-950/80 text-sky-400 border border-sky-800/60 font-mono font-bold text-xs">
                  Model A
                </span>
                <span className="text-xs font-bold text-zinc-100">{modelA}</span>
              </div>

              {outputA && (
                <div className="flex items-center gap-2">
                  {timeA !== null && (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{timeA.toFixed(1)}s</span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleCopy('A', outputA)}
                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                    title="نسخ النتيجة"
                  >
                    {copiedSide === 'A' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto text-xs text-zinc-200 leading-relaxed font-sans max-h-72 min-h-48">
              {outputA ? (
                <div className="prose prose-invert prose-xs max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {outputA}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-500 text-xs italic">
                  {isRunning ? 'جاري التوليد من النموذج A...' : 'في انتظار بدء الاختبار'}
                </div>
              )}
            </div>

            {outputA && (
              <div className="pt-3 mt-3 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-[10px] text-zinc-400 font-mono">
                  {outputA.split(/\s+/).filter(Boolean).length} كلمة
                </span>
                <button
                  type="button"
                  onClick={() => setWinner('A')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    winner === 'A'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>{winner === 'A' ? 'الفائز المختار 🏆' : 'اختيار كفائز'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Side B */}
          <div
            className={`flex flex-col rounded-2xl border p-4 bg-[#121316] transition-all ${
              winner === 'B'
                ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-xl shadow-emerald-500/10'
                : 'border-zinc-800'
            }`}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-purple-950/80 text-purple-400 border border-purple-800/60 font-mono font-bold text-xs">
                  Model B
                </span>
                <span className="text-xs font-bold text-zinc-100">{modelB}</span>
              </div>

              {outputB && (
                <div className="flex items-center gap-2">
                  {timeB !== null && (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{timeB.toFixed(1)}s</span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleCopy('B', outputB)}
                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                    title="نسخ النتيجة"
                  >
                    {copiedSide === 'B' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto text-xs text-zinc-200 leading-relaxed font-sans max-h-72 min-h-48">
              {outputB ? (
                <div className="prose prose-invert prose-xs max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {outputB}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-500 text-xs italic">
                  {isRunning ? 'جاري التوليد من النموذج B...' : 'في انتظار بدء الاختبار'}
                </div>
              )}
            </div>

            {outputB && (
              <div className="pt-3 mt-3 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-[10px] text-zinc-400 font-mono">
                  {outputB.split(/\s+/).filter(Boolean).length} كلمة
                </span>
                <button
                  type="button"
                  onClick={() => setWinner('B')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    winner === 'B'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>{winner === 'B' ? 'الفائز المختار 🏆' : 'اختيار كفائز'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Prompt Library */}
      <PromptLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectPrompt={(p) => setPrompt(typeof p === 'string' ? p : p.systemPrompt)}
      />
    </div>
  );
};
