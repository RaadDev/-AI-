'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Cpu,
  Sparkles,
  Zap,
  Code2,
  Image as ImageIcon,
  Mic,
  ExternalLink,
  Check,
  CheckCircle2,
  Sliders,
  Layers,
  Flame,
} from 'lucide-react';
import { AI_MODELS, AIModel, ModelCategory } from '@/types/aiModels';
import { getStudioSettings, saveStudioSettings } from '@/utils/studioSettings';

interface ModelsHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModelAsDefault?: (modelId: string) => void;
  onAddNodeForModel?: (model: AIModel) => void;
}

export const ModelsHubModal: React.FC<ModelsHubModalProps> = ({
  isOpen,
  onClose,
  onSelectModelAsDefault,
  onAddNodeForModel,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [defaultModel, setDefaultModel] = useState<string>(() => {
    return getStudioSettings()?.defaultModel || 'gemini-1.5-flash';
  });

  const categories = [
    { id: 'all', label: 'كافة النماذج (22+)', icon: Layers },
    { id: 'llm', label: 'النصوص والمحادثة (LLMs)', icon: Cpu },
    { id: 'image', label: 'توليد الصور والرؤية', icon: ImageIcon },
    { id: 'code', label: 'البرمجة والاستدلال', icon: Code2 },
    { id: 'audio', label: 'الصوتيات والكلام', icon: Mic },
  ];

  const filteredModels = useMemo(() => {
    return AI_MODELS.filter((model) => {
      const matchesCategory =
        selectedCategory === 'all' || model.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        model.name.toLowerCase().includes(q) ||
        model.provider.toLowerCase().includes(q) ||
        model.description.toLowerCase().includes(q) ||
        model.badge.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  if (!isOpen) return null;

  const handleSetDefault = (modelId: string) => {
    setDefaultModel(modelId);
    const settings = getStudioSettings();
    saveStudioSettings({ ...settings, defaultModel: modelId });
    onSelectModelAsDefault?.(modelId);
    setCopiedId(modelId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'openai':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50';
      case 'anthropic':
        return 'text-amber-400 bg-amber-950/40 border-amber-800/50';
      case 'google':
        return 'text-sky-400 bg-sky-950/40 border-sky-800/50';
      case 'deepseek':
        return 'text-indigo-400 bg-indigo-950/40 border-indigo-800/50';
      case 'mistral ai':
        return 'text-rose-400 bg-rose-950/40 border-rose-800/50';
      case 'meta':
        return 'text-blue-400 bg-blue-950/40 border-blue-800/50';
      case 'alibaba':
        return 'text-purple-400 bg-purple-950/40 border-purple-800/50';
      case 'black forest labs':
      case 'midjourney':
      case 'stability ai':
        return 'text-pink-400 bg-pink-950/40 border-pink-800/50';
      case 'elevenlabs':
      case 'suno':
        return 'text-teal-400 bg-teal-950/40 border-teal-800/50';
      default:
        return 'text-zinc-400 bg-zinc-900 border-zinc-800';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      dir="rtl"
    >
      <div
        className="w-full max-w-5xl max-h-[90vh] bg-[#0C0E14] border border-zinc-800 rounded-3xl shadow-2xl shadow-black/90 flex flex-col overflow-hidden font-sans select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-zinc-800/80 bg-[#08090D] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-bold text-white">
                  دليل وموسوعة نماذج الذكاء الاصطناعي (AI Models Hub)
                </h2>
                <span className="text-[10px] bg-indigo-950/80 text-indigo-300 border border-indigo-800/50 px-2 py-0.5 rounded-full font-mono">
                  {AI_MODELS.length} نموذج رائد
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                تصفح واستخدم نماذج الذكاء الاصطناعي المعتمدة (Google AI Studio, Groq Cloud, OpenAI, Anthropic)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search & Categories */}
        <div className="p-4 md:px-6 border-b border-zinc-800/60 bg-[#0A0C11] flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Categories Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="ابحث بالاسم، المزود، أو الميزة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#12141C] border border-zinc-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Models Grid */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 select-text">
          {filteredModels.map((model) => {
            const isCurrentDefault = defaultModel === model.id;
            const providerColorClass = getProviderColor(model.provider);

            return (
              <div
                key={model.id}
                className="group p-4 rounded-2xl bg-[#11131A] border border-zinc-800/90 hover:border-zinc-700/80 transition-all duration-200 flex flex-col justify-between space-y-3 relative overflow-hidden"
              >
                {/* Top Row: Provider & Category Badges */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border ${providerColorClass}`}
                    >
                      {model.provider}
                    </span>
                    {model.isPro && (
                      <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/25 px-1.5 py-0.5 rounded-md font-mono flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5" /> Pro
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono">
                    {model.contextWindow && (
                      <span className="bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                        {model.contextWindow}
                      </span>
                    )}
                  </div>
                </div>

                {/* Model Title & Description */}
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                      {model.name}
                    </h3>
                    {isCurrentDefault && (
                      <span className="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> افتراضي
                      </span>
                    )}
                  </div>

                  <div className="mt-1">
                    <span className="text-[10px] inline-block font-medium text-indigo-400 bg-indigo-950/40 border border-indigo-900/40 px-2 py-0.5 rounded-md mb-1.5">
                      {model.badge}
                    </span>
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3 select-text">
                      {model.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-2 border-t border-zinc-800/70 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-zinc-500">
                    السرعة:{' '}
                    <span className="text-zinc-300 font-medium">
                      {model.speed === 'ultra-fast'
                        ? 'فائقة ⚡'
                        : model.speed === 'deep-reasoning'
                        ? 'تفكير عميق 🧠'
                        : model.speed === 'fast'
                        ? 'سريعة 🚀'
                        : 'متوازنة ⚖️'}
                    </span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    {model.category === 'llm' || model.category === 'code' ? (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(model.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 ${
                          isCurrentDefault
                            ? 'bg-zinc-800 text-zinc-400 cursor-default'
                            : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/60'
                        }`}
                      >
                        {copiedId === model.id ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>تم التعيين!</span>
                          </>
                        ) : isCurrentDefault ? (
                          <span>النموذج النشط</span>
                        ) : (
                          <span>تعيين كافتراضي</span>
                        )}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Summary */}
        <div className="p-4 border-t border-zinc-800/80 bg-[#08090D] flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>
              كافة النماذج مجهزة للعمل مع السلاسل المتشعبة ووضع المحاكاة الفورية أو عبر مفاتيحك الخاصة (BYOK).
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
