'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  Loader2,
  X,
} from 'lucide-react';

interface AICopilotBarProps {
  onGenerateWorkflow: (prompt: string) => Promise<void> | void;
  isGenerating?: boolean;
}

export const AICopilotBar: React.FC<AICopilotBarProps> = ({
  onGenerateWorkflow,
  isGenerating = false,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onGenerateWorkflow(prompt.trim());
    setPrompt('');
    setIsFocused(false);
  };

  const handleChipClick = (suggestion: string) => {
    if (isGenerating) return;
    onGenerateWorkflow(suggestion);
    setIsFocused(false);
  };

  const quickChips = [
    {
      label: '⚡ بناء أداة تلخيص يوتيوب لمنشورات سوشيال ميديا',
      query: 'بناء أداة تلخيص فيديو يوتيوب وتحويله إلى ثريد تويتر ومقال مدونة متكامل',
      accent: 'hover:border-sky-500/50 hover:bg-sky-500/10 text-sky-400',
    },
    {
      label: '🛍️ بناء مولد حملات إعلانية وصور للمتاجر',
      query: 'بناء مولد حملات إعلانية لمتجر إلكتروني مع كاتب نصوص وتوليد صورة إعلانية',
      accent: 'hover:border-pink-500/50 hover:bg-pink-500/10 text-pink-400',
    },
    {
      label: '➕ أضف عقدة تدقيق لغوي وتحسين لهجة للسلسلة الحالية',
      query: 'أضف عقدة تدقيق لغوي وتحسين لهجة للسلسلة الحالية',
      accent: 'hover:border-violet-500/50 hover:bg-violet-500/10 text-violet-400',
    },
  ];

  return (
    <div
      className="w-[620px] max-w-[92vw] flex flex-col items-center gap-1.5 font-sans select-none animate-in fade-in slide-in-from-bottom-2 duration-200"
      dir="rtl"
    >
      {/* Main Glass Floating Ask Bar */}
      <form
        onSubmit={handleSubmit}
        className="w-full flex items-center gap-2 p-1.5 px-3 rounded-2xl border backdrop-blur-2xl shadow-2xl transition-all duration-200"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: isFocused ? 'rgba(99, 102, 241, 0.7)' : 'var(--card-border)',
          boxShadow: isFocused ? '0 0 20px rgba(99, 102, 241, 0.2)' : 'var(--card-shadow)',
          color: 'var(--text-main)',
        }}
      >
        {/* Spark Icon Badge */}
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/30">
          <Sparkles className="w-4 h-4 text-white animate-pulse" />
        </div>

        {/* Text Input */}
        <input
          type="text"
          value={prompt}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Short delay to allow chip clicks before blur
            setTimeout(() => setIsFocused(false), 250);
          }}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="اطلب من الذكاء الاصطناعي بناء أداة أو إضافة عقد... (مثال: ابني أداة تحول مقال إلى بودكاست وتغريدات)"
          className="flex-1 bg-transparent border-none text-xs focus:outline-none placeholder:text-zinc-500 text-[var(--text-main)] leading-relaxed"
          disabled={isGenerating}
        />

        {/* Clear prompt button if has input */}
        {prompt && (
          <button
            type="button"
            onClick={() => setPrompt('')}
            className="p-1 rounded-lg text-zinc-400 hover:text-white transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Build Button */}
        <button
          type="submit"
          disabled={!prompt.trim() || isGenerating}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 shrink-0 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>جاري البناء...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-3.5 h-3.5" />
              <span>بناء تلقائي</span>
            </>
          )}
        </button>
      </form>

      {/* Quick Suggestion Chips (Only appear when input is focused or has content) */}
      {(isFocused || prompt.trim().length > 0) && (
        <div className="flex items-center justify-center gap-1.5 flex-wrap w-full animate-in fade-in slide-in-from-top-1 duration-150">
          {quickChips.map((chip, idx) => (
            <button
              key={chip.label}
              type="button"
              onMouseDown={(e) => {
                // Prevent blur on mouse down
                e.preventDefault();
                handleChipClick(chip.query);
              }}
              disabled={isGenerating}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10.5px] font-medium border backdrop-blur-xl transition-all duration-150 disabled:opacity-40 cursor-pointer ${chip.accent}`}
              style={{
                backgroundColor: 'var(--card-header-bg)',
                borderColor: 'var(--card-border)',
              }}
            >
              <span>{chip.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
