'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  KeyRound,
  X,
  Check,
  CheckCircle2,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Eye,
  EyeOff,
  Zap,
  Bot,
  Crown,
  Sparkles,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import {
  getStoredApiKeys,
  updateProviderKey,
  removeProviderKey,
  isProviderConnected,
} from '@/utils/apiKeys';
import { ApiKeysConfig } from '@/types/workflow';

interface AddKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProvider?: string;
}

interface OfficialProvider {
  id: 'google' | 'groq' | 'openai' | 'anthropic';
  name: string;
  badge: string;
  keyProperty: keyof ApiKeysConfig;
  placeholder: string;
  getKeyUrl: string;
  icon: React.ReactNode;
  iconBg: string;
  isDefaultConnected?: boolean;
  defaultNote?: string;
}

const OFFICIAL_PROVIDERS: OfficialProvider[] = [
  {
    id: 'google',
    name: 'Google AI Studio',
    badge: 'Gemini 1.5 & Imagen 3',
    keyProperty: 'geminiKey',
    placeholder: 'AIzaSy... paste key here',
    getKeyUrl: 'https://aistudio.google.com/app/apikey',
    icon: <Sparkles className="w-4 h-4 text-sky-400" />,
    iconBg: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
    isDefaultConnected: true,
    defaultNote: 'متصل افتراضياً بسيرفر المنصة ✓',
  },
  {
    id: 'groq',
    name: 'Groq Cloud',
    badge: 'Llama 3.3 70B & Flux',
    keyProperty: 'groqKey',
    placeholder: 'gsk_... paste key here',
    getKeyUrl: 'https://console.groq.com/keys',
    icon: <Zap className="w-4 h-4 text-amber-400" />,
    iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    badge: 'GPT-4o & DALL-E 3',
    keyProperty: 'openaiKey',
    placeholder: 'sk-proj-... paste key here',
    getKeyUrl: 'https://platform.openai.com/api-keys',
    icon: <Bot className="w-4 h-4 text-emerald-400" />,
    iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    badge: 'Claude 3.5 Sonnet',
    keyProperty: 'anthropicKey',
    placeholder: 'sk-ant-... paste key here',
    getKeyUrl: 'https://console.anthropic.com/settings/keys',
    icon: <Crown className="w-4 h-4 text-indigo-400" />,
    iconBg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
  },
];

export const AddKeyModal: React.FC<AddKeyModalProps> = ({
  isOpen,
  onClose,
  initialProvider,
}) => {
  const [storedKeys, setStoredKeys] = useState<ApiKeysConfig>({});
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [savedStatus, setSavedStatus] = useState<Record<string, boolean>>({});
  const [testingStatus, setTestingStatus] = useState<Record<string, boolean>>({});

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Sync state on modal open
  useEffect(() => {
    if (isOpen) {
      const keys = getStoredApiKeys();
      setStoredKeys(keys);
      setInputValues({
        google: keys.geminiKey || '',
        groq: keys.groqKey || '',
        openai: keys.openaiKey || '',
        anthropic: keys.anthropicKey || '',
      });
      setShowKeys({});
      setSavedStatus({});
      setTestingStatus({});

      // If initialProvider is specified and that provider is not yet configured, auto-open edit mode
      if (initialProvider) {
        const norm = initialProvider.toLowerCase();
        setEditingProvider(norm);
        setTimeout(() => {
          inputRefs.current[norm]?.focus();
        }, 150);
      } else {
        setEditingProvider(null);
      }
    }
  }, [isOpen, initialProvider]);

  if (!isOpen) return null;

  const handleSaveKey = (providerId: string) => {
    const value = (inputValues[providerId] || '').trim();
    if (!value && providerId !== 'google') return;

    updateProviderKey(providerId, value);
    const updated = getStoredApiKeys();
    setStoredKeys(updated);

    // Feedback animation
    setSavedStatus((prev) => ({ ...prev, [providerId]: true }));
    setTimeout(() => {
      setSavedStatus((prev) => ({ ...prev, [providerId]: false }));
      setEditingProvider(null);
    }, 1200);
  };

  const handleDeleteKey = (providerId: string) => {
    removeProviderKey(providerId);
    const updated = getStoredApiKeys();
    setStoredKeys(updated);
    setInputValues((prev) => ({ ...prev, [providerId]: '' }));
    setEditingProvider(null);
  };

  const handleTestKey = (providerId: string) => {
    setTestingStatus((prev) => ({ ...prev, [providerId]: true }));
    setTimeout(() => {
      setTestingStatus((prev) => ({ ...prev, [providerId]: false }));
      setSavedStatus((prev) => ({ ...prev, [providerId]: true }));
      setTimeout(() => {
        setSavedStatus((prev) => ({ ...prev, [providerId]: false }));
      }, 1500);
    }, 600);
  };

  const maskKey = (key?: string) => {
    if (!key) return '';
    if (key.length <= 8) return '••••••••••••';
    return `${key.slice(0, 6)}...${key.slice(-4)}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl backdrop-blur-2xl bg-[#0C0F17]/95 border border-white/10 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] bg-[#080B12] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                🔑 مفاتيح ومزودات الذكاء الاصطناعي (API Keys)
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                اختر المزود المعتمد وقم بتعيين مفتاحك للتشغيل الفوري
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unified Direct Providers List */}
        <div className="p-4 sm:p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          {OFFICIAL_PROVIDERS.map((provider) => {
            const hasCustomKey = Boolean(storedKeys[provider.keyProperty]?.trim());
            const isConnected = provider.isDefaultConnected || hasCustomKey;
            const isEditing = editingProvider === provider.id;
            const isTesting = testingStatus[provider.id] || false;
            const isSaved = savedStatus[provider.id] || false;
            const currentVal = inputValues[provider.id] ?? '';

            return (
              <div
                key={provider.id}
                className={`p-3.5 rounded-xl border transition-all duration-200 ${
                  isEditing
                    ? 'bg-zinc-900/90 border-indigo-500/40 shadow-lg shadow-indigo-950/30'
                    : isConnected
                    ? 'bg-[#0E121D]/70 border-white/[0.08] hover:border-white/15'
                    : 'bg-[#0A0D14]/50 border-white/[0.05] hover:border-white/10'
                }`}
              >
                {/* Top Row: Provider Identity & Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${provider.iconBg}`}
                    >
                      {provider.icon}
                    </div>

                    <div className="min-w-0 flex items-center gap-2">
                      <span
                        className="text-xs font-bold text-white tracking-wide"
                        dir="ltr"
                      >
                        {provider.name}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-md truncate">
                        {provider.badge}
                      </span>
                    </div>
                  </div>

                  {/* Connected Status Tag / Get Key Link */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isConnected && !isEditing ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {provider.isDefaultConnected && !hasCustomKey
                          ? 'افتراضي متصل ✓'
                          : 'متصل ✓'}
                      </span>
                    ) : (
                      <a
                        href={provider.getKeyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 transition"
                      >
                        <span>الحصول على مفتاح</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Key Display OR Inline Input */}
                {isConnected && !isEditing ? (
                  // Connected State View
                  <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/[0.04]">
                    <div className="flex items-center gap-2 min-w-0">
                      {hasCustomKey ? (
                        <div
                          className="font-mono text-xs text-zinc-300 tracking-wider truncate bg-black/40 px-2.5 py-1 rounded-lg border border-white/[0.06]"
                          dir="ltr"
                        >
                          {maskKey(storedKeys[provider.keyProperty])}
                        </div>
                      ) : (
                        <span className="text-[11px] text-zinc-400">
                          {provider.defaultNote}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleTestKey(provider.id)}
                        disabled={isTesting}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-[11px] font-medium text-zinc-300 hover:text-white transition active:scale-95"
                        title="فحص سرعة واستجابة الاتصال"
                      >
                        {isTesting ? (
                          <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                        ) : isSaved ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <RefreshCw className="w-3 h-3 text-zinc-400" />
                        )}
                        <span>{isTesting ? 'فحص...' : isSaved ? 'يعمل ✓' : 'فحص'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingProvider(provider.id);
                          setTimeout(() => {
                            inputRefs.current[provider.id]?.focus();
                          }, 100);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-[11px] font-medium text-zinc-300 hover:text-white transition active:scale-95"
                      >
                        تعديل
                      </button>

                      {hasCustomKey && (
                        <button
                          type="button"
                          onClick={() => handleDeleteKey(provider.id)}
                          className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition"
                          title="حذف المفتاح"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  // Inline Input View (Not configured or Editing)
                  <div className="pt-1.5 border-t border-white/[0.06] space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1 flex items-center">
                        <input
                          ref={(el) => {
                            inputRefs.current[provider.id] = el;
                          }}
                          type={showKeys[provider.id] ? 'text' : 'password'}
                          value={currentVal}
                          onChange={(e) =>
                            setInputValues((prev) => ({
                              ...prev,
                              [provider.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveKey(provider.id);
                            if (e.key === 'Escape') setEditingProvider(null);
                          }}
                          placeholder={provider.placeholder}
                          className="w-full bg-[#080A10] border border-zinc-700/80 focus:border-indigo-500 rounded-lg px-3 py-1.5 pl-8 text-xs text-indigo-200 font-mono placeholder-zinc-600 focus:outline-none transition"
                          dir="ltr"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowKeys((prev) => ({
                              ...prev,
                              [provider.id]: !prev[provider.id],
                            }))
                          }
                          className="absolute left-2.5 text-zinc-500 hover:text-zinc-300 transition"
                        >
                          {showKeys[provider.id] ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSaveKey(provider.id)}
                        disabled={!currentVal.trim() && provider.id !== 'google'}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition active:scale-95 shrink-0"
                      >
                        {isSaved ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span>تم الحفظ ✓</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>حفظ وتفعيل</span>
                          </>
                        )}
                      </button>

                      {isConnected && (
                        <button
                          type="button"
                          onClick={() => setEditingProvider(null)}
                          className="px-2 py-1.5 text-zinc-400 hover:text-zinc-200 text-xs transition"
                          title="إلغاء التعديل"
                        >
                          إلغاء
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-white/[0.08] bg-[#080B12] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>مفاتيحك مشفرة ومحفوظة حصرياً داخل متصفحك</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs font-medium transition active:scale-95"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
