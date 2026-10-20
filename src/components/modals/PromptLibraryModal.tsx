'use client';

import React, { useState, useMemo } from 'react';
import { 
  X, Search, BookOpen, Copy, Check, Sparkles, Filter, 
  ArrowLeft, Code2, Megaphone, Share2, SearchCheck, Briefcase, Palette
} from 'lucide-react';
import { PROMPT_LIBRARY, PromptTemplate } from '@/data/promptLibrary';

interface PromptLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: PromptTemplate | any) => void;
  targetNodeTitle?: string;
}

const CATEGORIES = [
  { id: 'all', label: 'جميع الأوامر', icon: Sparkles },
  { id: 'copywriting', label: 'كتابة إعلانية', icon: Megaphone },
  { id: 'social', label: 'سوشيال ميديا', icon: Share2 },
  { id: 'seo', label: 'سيو ومقالات', icon: SearchCheck },
  { id: 'dev', label: 'برمجة وتطوير', icon: Code2 },
  { id: 'business', label: 'أعمال واستراتيجية', icon: Briefcase },
  { id: 'creative', label: 'إبداع وصور', icon: Palette },
];

export function PromptLibraryModal({ 
  isOpen, 
  onClose, 
  onSelectPrompt,
  targetNodeTitle 
}: PromptLibraryModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredPrompts = useMemo(() => {
    return PROMPT_LIBRARY.filter((p) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = 
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.systemPrompt.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q));
      
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleCopy = (e: React.MouseEvent, prompt: PromptTemplate) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt.systemPrompt);
    setCopiedId(prompt.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApply = (prompt: PromptTemplate) => {
    onSelectPrompt(prompt);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn" dir="rtl">
      <div className="relative w-full max-w-4xl h-[85vh] bg-[#0C0F17]/95 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-lg shadow-indigo-500/20 text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">مكتبة الأوامر الهندسية الجاهزة</h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {PROMPT_LIBRARY.length} برومبت احترافي
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {targetNodeTitle 
                  ? `اختر أمراً لإدراجه وتطبيقه مباشرة داخل عقدة [ ${targetNodeTitle} ]` 
                  : 'أوامر هندسية مجربة ومحسنة لتشغيل نماذج الذكاء الاصطناعي بأعلى دقة'}
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div className="p-4 border-b border-white/[0.06] bg-black/20 flex flex-col gap-3">
          {/* Search Input */}
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم، الفكرة، الكلمات المفتاحية، أو نوع المحتوى..."
              className="w-full pl-12 pr-10 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.08] transition-all"
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-white/10"
              >
                مسح
              </button>
            )}
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const count = cat.id === 'all'
                ? PROMPT_LIBRARY.length
                : PROMPT_LIBRARY.filter(p => p.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/20'
                      : 'bg-white/[0.04] text-slate-400 hover:text-slate-200 hover:bg-white/[0.08]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Prompts Cards Grid */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-white/10">
          {filteredPrompts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-500 mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-300">لم يتم العثور على أوامر مطابقة</h3>
              <p className="text-xs text-slate-500 mt-1">جرب كلمات بحث أخرى أو اختر فئة مختلفة من الشريط أعلاه.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-3 px-3 py-1.5 rounded-xl bg-white/10 text-xs text-white hover:bg-white/20 transition"
              >
                إعادة ضبط الفلاتر
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredPrompts.map((prompt) => (
                <div 
                  key={prompt.id}
                  className="group relative flex flex-col justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:border-indigo-500/40 hover:bg-white/[0.05] transition-all duration-200"
                >
                  <div>
                    {/* Category & Tags */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                        {prompt.categoryLabel}
                      </span>
                      <div className="flex items-center gap-1 flex-wrap">
                        {prompt.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-400">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {prompt.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {prompt.description}
                    </p>

                    {/* System Prompt Snippet Preview */}
                    <div className="mt-2.5 p-2 rounded-lg bg-black/40 border border-white/[0.04] font-mono text-[10px] text-slate-400 line-clamp-2 leading-relaxed dir-auto">
                      {prompt.systemPrompt}
                    </div>
                  </div>

                  {/* Actions Bottom Bar */}
                  <div className="mt-3.5 pt-2.5 border-t border-white/[0.06] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleCopy(e, prompt)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                      title="نسخ نص الأمر"
                    >
                      {copiedId === prompt.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>نسخ</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApply(prompt)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span>تطبيق على العقدة</span>
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/[0.08] bg-black/30 flex items-center justify-between text-xs text-slate-400">
          <span>💡 تطبيق الأمر يقوم بتحديث حقل System Prompt وعنوان العقدة المحددة تلقائياً.</span>
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/10 text-slate-300 transition-colors"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
}

export default PromptLibraryModal;
