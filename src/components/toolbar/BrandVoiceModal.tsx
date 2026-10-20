'use client';

import React, { useState, useEffect } from 'react';
import { Target, X, Check, Sparkles, Building2, Users, Volume2, ShieldAlert } from 'lucide-react';
import { BrandVoiceConfig } from '@/types/workflow';

interface BrandVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const BRAND_VOICE_STORAGE_KEY = 'promptflow_brand_voice';

export function getStoredBrandVoice(): BrandVoiceConfig {
  if (typeof window === 'undefined') return { enabled: false };
  try {
    const raw = localStorage.getItem(BRAND_VOICE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : { enabled: false };
  } catch {
    return { enabled: false };
  }
}

export function saveStoredBrandVoice(config: BrandVoiceConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BRAND_VOICE_STORAGE_KEY, JSON.stringify(config));
}

export const BrandVoiceModal: React.FC<BrandVoiceModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [enabled, setEnabled] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [toneOfVoice, setToneOfVoice] = useState('');
  const [avoidWords, setAvoidWords] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cfg = getStoredBrandVoice();
      setEnabled(cfg.enabled ?? false);
      setBrandName(cfg.brandName || '');
      setTargetAudience(cfg.targetAudience || '');
      setToneOfVoice(cfg.toneOfVoice || '');
      setAvoidWords(cfg.avoidWords || '');
      setIsSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const config: BrandVoiceConfig = {
      enabled,
      brandName: brandName.trim() || undefined,
      targetAudience: targetAudience.trim() || undefined,
      toneOfVoice: toneOfVoice.trim() || undefined,
      avoidWords: avoidWords.trim() || undefined,
    };
    saveStoredBrandVoice(config);
    setIsSaved(true);
    onSaved?.();
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 700);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      dir="rtl"
    >
      <div
        className="w-full max-w-lg backdrop-blur-2xl bg-[#0F1117]/95 border border-white/10 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/[0.08] bg-[#08090D]/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-500/20 text-white">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                هوية البرند العامة (Brand Voice)
              </h2>
              <p className="text-xs text-slate-400">
                تطبيق شخصية ونبرة علامتك التجارية تلقائياً في كافة مخرجات الـ AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Enable Toggle Switch */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#08090D] border border-white/[0.08]">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                تفعيل هوية البرند في السلسلة
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                إرفاق هذه القواعد كـ Context موجه تلقائياً لجميع عقد الذكاء الاصطناعي
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>

          {/* Brand Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-rose-400" />
              اسم المشروع أو الشركة:
            </label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="مثال: أكاديمية التقنية الذكية، متجر فخامة، إلخ..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Target Audience */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              الجمهور المستهدف:
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="مثال: رواد الأعمال، المطورين، جيل الشباب في الخليج..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Tone of Voice */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-purple-400" />
              نبرة الصوت وأسلوب الحديث المفضل:
            </label>
            <textarea
              rows={2}
              value={toneOfVoice}
              onChange={(e) => setToneOfVoice(e.target.value)}
              placeholder="مثال: نبرة ملهمة، واثقة، مرحة وخفيفة، استخدام لغة بيضاء مع مصطلحات موثوقة..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500 resize-none leading-relaxed"
            />
          </div>

          {/* Words / Styles to Avoid */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              كلمات أو أساليب محظورة (تجنبها):
            </label>
            <input
              type="text"
              value={avoidWords}
              onChange={(e) => setAvoidWords(e.target.value)}
              placeholder="مثال: تجنب العبارات المبتذلة، المبالغة غير الواقعية، التسويق الرخيص..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-rose-600/20 active:scale-95"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span>تم الحفظ!</span>
              </>
            ) : (
              <span>حفظ هوية البرند</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
