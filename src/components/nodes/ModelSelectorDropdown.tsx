'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Cpu,
  Layers,
  ChevronDown,
  Check,
  Plus,
  KeyRound,
  Sparkles,
  Zap,
  Star,
} from 'lucide-react';
import {
  AIModelConfig,
  TEXT_MODELS,
  IMAGE_MODELS,
  getModelById,
  DEFAULT_TEXT_MODEL,
  DEFAULT_IMAGE_MODEL,
} from '@/config/models';
import { isProviderConnected, getStoredApiKeys } from '@/utils/apiKeys';

interface ModelSelectorDropdownProps {
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
  category: 'text' | 'image';
  compact?: boolean;
}

export const ModelSelectorDropdown: React.FC<ModelSelectorDropdownProps> = ({
  selectedModelId,
  onSelectModel,
  category,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceId = useRef<string>(`msd_${Math.random().toString(36).substring(2, 9)}`);

  const defaultId = category === 'text' ? DEFAULT_TEXT_MODEL : DEFAULT_IMAGE_MODEL;
  const currentModel = getModelById(selectedModelId) || getModelById(defaultId);
  const allModels = category === 'text' ? TEXT_MODELS : IMAGE_MODELS;

  // Track connected status of each provider reactively
  const [connectedMap, setConnectedMap] = useState<Record<string, boolean>>({});

  const refreshConnected = () => {
    const map: Record<string, boolean> = {
      google: true, // Server default
      flux: true, // Free & fast generation without keys
      groq: isProviderConnected('groq'),
      openai: isProviderConnected('openai'),
      anthropic: isProviderConnected('anthropic'),
    };
    setConnectedMap(map);
  };

  useEffect(() => {
    refreshConnected();

    const handleKeysChanged = () => {
      refreshConnected();
    };

    window.addEventListener('promptflow_api_keys_changed', handleKeysChanged);
    return () => {
      window.removeEventListener('promptflow_api_keys_changed', handleKeysChanged);
    };
  }, []);

  // Listen to close event from other dropdowns so only one is open across the entire canvas
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    const handleCloseOthers = (e: Event) => {
      const customEvent = e as CustomEvent<{ senderId?: string }>;
      if (customEvent.detail?.senderId !== instanceId.current) {
        timeoutId = setTimeout(() => {
          setIsOpen(false);
        }, 0);
      }
    };
    window.addEventListener('promptflow:close-dropdowns', handleCloseOthers);
    return () => {
      window.removeEventListener('promptflow:close-dropdowns', handleCloseOthers);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Close dropdown on outside click using capture phase to catch canvas clicks
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | PointerEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('pointerdown', handleOutsideClick, true);
      document.addEventListener('mousedown', handleOutsideClick, true);
      document.addEventListener('touchstart', handleOutsideClick, true);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick, true);
      document.removeEventListener('mousedown', handleOutsideClick, true);
      document.removeEventListener('touchstart', handleOutsideClick, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        window.dispatchEvent(
          new CustomEvent('promptflow:close-dropdowns', {
            detail: { senderId: instanceId.current },
          })
        );
      }
      return next;
    });
  };

  const handleOpenAddKey = (provider: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    window.dispatchEvent(
      new CustomEvent('promptflow:open-add-key', { detail: { provider } })
    );
  };

  // Group models into connected vs requires key
  const connectedModels = allModels.filter((m) => connectedMap[m.provider] === true);
  const unconfiguredModels = allModels.filter((m) => connectedMap[m.provider] !== true);

  return (
    <div className="relative inline-block text-right" ref={containerRef} dir="rtl">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all text-xs select-none ${
          category === 'image'
            ? 'bg-slate-950/80 hover:bg-slate-900 border-pink-500/20 hover:border-pink-500/40 text-pink-200'
            : 'bg-[#0A0C10] hover:bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-200'
        }`}
        title="انقر لتغيير النموذج الذكي"
      >
        {category === 'image' ? (
          <Layers className="w-3.5 h-3.5 text-pink-400 shrink-0" />
        ) : (
          <Cpu className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        )}

        <span className="font-semibold truncate max-w-[150px]">
          {currentModel?.name.split('(')[0].trim() || 'اختر النموذج'}
        </span>

        {currentModel?.badge && (
          <span className="hidden sm:inline-block text-[9px] bg-white/[0.06] px-1.5 py-0.2 rounded font-mono text-zinc-400">
            {currentModel.badge.split(' ')[0]}
          </span>
        )}

        <ChevronDown
          className={`w-3 h-3 text-zinc-400 transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Floating Popover Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-1.5 z-50 min-w-[280px] w-max max-w-[340px] max-h-[340px] overflow-y-auto rounded-xl bg-[#0C101B]/95 border border-white/10 shadow-2xl backdrop-blur-xl p-2 select-none text-xs text-zinc-200 animate-in fade-in zoom-in-95 duration-100 shadow-black/80">
          {/* Section 1: Connected & Ready Models */}
          <div className="space-y-1">
            <div className="px-2.5 py-1 text-[10px] font-bold text-emerald-400 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                نماذج جاهزة فوراً بمفتاحك المعتمد:
              </span>
              <span className="text-[9px] text-zinc-500 font-normal">
                {connectedModels.length}
              </span>
            </div>

            {connectedModels.map((m) => {
              const isSelected = (currentModel?.id || defaultId) === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    onSelectModel(m.id);
                    setIsOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl transition flex items-center justify-between text-right cursor-pointer group gap-2 ${
                    isSelected
                      ? 'bg-indigo-950/60 border border-indigo-500/40 text-white'
                      : 'hover:bg-zinc-800/60 text-zinc-300 hover:text-white'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-1">
                    <div className="flex items-center gap-1.5 font-semibold text-xs whitespace-normal leading-snug">
                      <span>{m.name}</span>
                    </div>
                    {m.description && (
                      <div className="text-[10px] text-zinc-400 group-hover:text-zinc-300 whitespace-normal leading-snug mt-1">
                        {m.description}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0 mr-1.5">
                    {m.badge && (
                      <span className="text-[9px] bg-zinc-800/80 text-zinc-300 px-1.5 py-0.5 rounded font-mono">
                        {m.badge}
                      </span>
                    )}
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Section 2: Models Requiring Key */}
          {unconfiguredModels.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-zinc-800/80 space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-bold text-zinc-400 flex items-center justify-between">
                <span>نماذج إضافية (تتطلب تفعيل مفتاحها):</span>
                <span className="text-[9px] text-zinc-500 font-normal">
                  {unconfiguredModels.length}
                </span>
              </div>

              {unconfiguredModels.map((m) => (
                <div
                  key={m.id}
                  onClick={(e) => handleOpenAddKey(m.provider, e)}
                  className="w-full p-2.5 rounded-xl bg-zinc-950/40 hover:bg-zinc-900/60 border border-zinc-800/50 hover:border-amber-500/30 transition flex items-center justify-between text-right group cursor-pointer gap-2"
                >
                  <div className="min-w-0 flex-1 pr-1">
                    <div className="font-semibold text-xs text-zinc-300 group-hover:text-amber-200 transition whitespace-normal leading-snug">
                      {m.name}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                      {m.providerLabel}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleOpenAddKey(m.provider, e)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 hover:text-amber-200 text-[10px] font-bold transition shrink-0 active:scale-95"
                    title={`إضافة مفتاح ${m.providerLabel}`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ إضافة مفتاح</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
