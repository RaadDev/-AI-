'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Palette,
  Cpu,
  KeyRound,
  Zap,
  HardDrive,
  Check,
  Download,
  Upload,
  RotateCcw,
  Volume2,
  VolumeX,
  Eye,
  Sliders,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import {
  StudioSettings,
  ThemeMode,
} from '@/types/workflow';
import {
  getStudioSettings,
  saveStudioSettings,
  calculateStorageUsage,
  exportAllStudioData,
  DEFAULT_STUDIO_SETTINGS,
} from '@/utils/studioSettings';
import { playClickSound, playSuccessSound } from '@/utils/soundEffects';
import { TEXT_MODELS, DEFAULT_TEXT_MODEL } from '@/config/models';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsSaved?: (settings: StudioSettings) => void;
  initialTab?: 'appearance' | 'ai' | 'keys' | 'execution' | 'storage';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsSaved,
  initialTab,
}) => {
  const [activeTab, setActiveTab] = useState<
    'appearance' | 'ai' | 'keys' | 'execution' | 'storage'
  >(initialTab || 'appearance');

  const [settings, setSettings] = useState<StudioSettings>(DEFAULT_STUDIO_SETTINGS);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [storageUsage, setStorageUsage] = useState('0 KB');
  const [focusKeyTarget, setFocusKeyTarget] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    const handleOpenSettingsEvent = (e: Event) => {
      const custom = e as CustomEvent<{ tab?: 'appearance' | 'ai' | 'keys' | 'execution' | 'storage'; focusKey?: string }>;
      if (custom.detail?.tab) {
        setActiveTab(custom.detail.tab);
      }
      if (custom.detail?.focusKey) {
        setFocusKeyTarget(custom.detail.focusKey);
      }
    };

    window.addEventListener('promptflow:open-settings', handleOpenSettingsEvent);
    return () => {
      window.removeEventListener('promptflow:open-settings', handleOpenSettingsEvent);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      const current = getStudioSettings();
      setSettings(current);
      setStorageUsage(calculateStorageUsage());
    }
  }, [isOpen]);

  const handleUpdate = <K extends keyof StudioSettings>(key: K, value: StudioSettings[K]) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    const updated = saveStudioSettings(settings);
    if (updated.soundEffects) {
      playSuccessSound();
    }
    setSaveSuccess(true);
    onSettingsSaved?.(updated);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 600);
  };

  const handleBackupExport = () => {
    const json = exportAllStudioData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pf-studio-backup-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    if (settings.soundEffects) playClickSound();
  };

  const handleRestoreImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.settings) {
          saveStudioSettings(parsed.settings);
          setSettings(parsed.settings);
        }
        if (parsed.canvasState) {
          localStorage.setItem('promptflow_canvas_state', JSON.stringify(parsed.canvasState));
        }
        if (parsed.workspaces) {
          localStorage.setItem('promptflow_saved_workspaces', JSON.stringify(parsed.workspaces));
        }
        if (parsed.brandVoice) {
          localStorage.setItem('promptflow_brand_voice', JSON.stringify(parsed.brandVoice));
        }
        setStorageUsage(calculateStorageUsage());
        alert('تمت استعادة النسخة الاحتياطية بنجاح! سيتم تحديث الصفحة.');
        window.location.reload();
      } catch (err) {
        alert('الملف غير صالح أو تالف.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleFactoryReset = () => {
    if (
      window.confirm(
        'تحذير: هل أنت متأكد من رغبتك في مسح كافة البيانات والإعدادات ومساحات العمل وإعادة الضبط المصنعي؟ لا يمكن التراجع عن هذا الإجراء.'
      )
    ) {
      // Clear promptflow keys
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('promptflow')) keysToRemove.push(k);
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      alert('تمت إعادة الضبط المصنعي بنجاح.');
      window.location.reload();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="relative w-full max-w-3xl bg-[#0F1117] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#090A0E]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-950/70 border border-indigo-800/60 text-indigo-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>مركز الإعدادات الشامل (Studio Settings)</span>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                  Ctrl + ,
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                تخصيص المظهر، النماذج، المفاتيح، وسلوك الكانفاس بالكامل
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-zinc-800 bg-[#0B0D13] overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 font-medium text-xs whitespace-nowrap transition ${
              activeTab === 'appearance'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>المظهر والكانفاس</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 font-medium text-xs whitespace-nowrap transition ${
              activeTab === 'ai'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>الذكاء الاصطناعي</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('keys')}
            className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 font-medium text-xs whitespace-nowrap transition ${
              activeTab === 'keys'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>مفاتيح الربط والـ API</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('execution')}
            className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 font-medium text-xs whitespace-nowrap transition ${
              activeTab === 'execution'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>التنفيذ والأداء</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('storage')}
            className={`flex items-center gap-2 px-3.5 py-2.5 border-b-2 font-medium text-xs whitespace-nowrap transition ${
              activeTab === 'storage'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>البيانات والنسخ الاحتياطي</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0A0C10] text-sm">
          {/* TAB 1: Appearance & Canvas */}
          {activeTab === 'appearance' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Theme Selector - 4 Full Themes */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-2">
                  الثيم اللوني للاستوديو (Theme Engine):
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  <div
                    onClick={() => handleUpdate('theme', 'midnight')}
                    className={`p-3 rounded-xl border cursor-pointer transition flex flex-col items-center gap-1.5 text-center ${
                      settings.theme === 'midnight'
                        ? 'border-indigo-500 bg-indigo-950/20 ring-1 ring-indigo-500/50'
                        : 'border-zinc-800 bg-[#121316] hover:border-zinc-700'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#090A0D] border border-zinc-700 flex items-center justify-center text-xs font-mono text-zinc-300">
                      Z
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-200">Midnight Zinc</div>
                      <div className="text-[9px] text-zinc-400">فحمي هادئ (افتراضي)</div>
                    </div>
                  </div>

                  <div
                    onClick={() => handleUpdate('theme', 'light')}
                    className={`p-3 rounded-xl border cursor-pointer transition flex flex-col items-center gap-1.5 text-center ${
                      settings.theme === 'light'
                        ? 'border-indigo-500 bg-indigo-950/20 ring-1 ring-indigo-500/50'
                        : 'border-zinc-800 bg-[#121316] hover:border-zinc-700'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#F8FAFC] border border-slate-300 flex items-center justify-center text-xs font-mono text-slate-800">
                      L
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-200">Pure Light</div>
                      <div className="text-[9px] text-zinc-400">أبيض نقي نهاري</div>
                    </div>
                  </div>

                  <div
                    onClick={() => handleUpdate('theme', 'blueprint')}
                    className={`p-3 rounded-xl border cursor-pointer transition flex flex-col items-center gap-1.5 text-center ${
                      settings.theme === 'blueprint'
                        ? 'border-indigo-500 bg-indigo-950/20 ring-1 ring-indigo-500/50'
                        : 'border-zinc-800 bg-[#121316] hover:border-zinc-700'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#0A1128] border border-blue-600/60 flex items-center justify-center text-xs font-mono text-cyan-300">
                      B
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-200">Blueprint</div>
                      <div className="text-[9px] text-zinc-400">مخطط أزرق هندسي</div>
                    </div>
                  </div>

                  <div
                    onClick={() => handleUpdate('theme', 'oled')}
                    className={`p-3 rounded-xl border cursor-pointer transition flex flex-col items-center gap-1.5 text-center ${
                      settings.theme === 'oled'
                        ? 'border-indigo-500 bg-indigo-950/20 ring-1 ring-indigo-500/50'
                        : 'border-zinc-800 bg-[#121316] hover:border-zinc-700'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#000000] border border-zinc-700 flex items-center justify-center text-xs font-mono text-white">
                      O
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-200">OLED Black</div>
                      <div className="text-[9px] text-zinc-400">أسود نقي تباين فائق</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Background Variant & Edge Style */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    نقشة خلفية الكانفاس (Background):
                  </label>
                  <select
                    value={settings.backgroundVariant}
                    onChange={(e) => handleUpdate('backgroundVariant', e.target.value as any)}
                    className="w-full bg-[#121316] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="dots">Dots (نقاط هادئة - Sub-grid)</option>
                    <option value="blueprint">Blueprint Grid (شبكة هندسية معمارية)</option>
                    <option value="cross">Cross (تقاطعات فنية - Crosshairs)</option>
                    <option value="none">None (خلفية صامتة وخالية)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    شكل الأسلاك الرابطة (Edge Style):
                  </label>
                  <select
                    value={settings.edgeStyle}
                    onChange={(e) => handleUpdate('edgeStyle', e.target.value as any)}
                    className="w-full bg-[#121316] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="smoothstep">SmoothStep (زوايا هندسية أنيقة)</option>
                    <option value="bezier">Bezier (منحنيات ناعمة)</option>
                    <option value="straight">Straight (خطوط مستقيمة مباشرة)</option>
                  </select>
                </div>
              </div>

              {/* Background Opacity and Gap Sliders */}
              <div className="grid grid-cols-2 gap-4 p-3.5 rounded-xl bg-[#121316] border border-zinc-800">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-zinc-300 font-medium">شفافية شبكة الكانفاس:</span>
                    <span className="font-mono text-indigo-400 font-bold">
                      {Math.round((settings.backgroundOpacity ?? 0.35) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={settings.backgroundOpacity ?? 0.35}
                    onChange={(e) => handleUpdate('backgroundOpacity', parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-zinc-300 font-medium">حجم تباعد الشبكة (Grid Gap):</span>
                    <span className="font-mono text-indigo-400 font-bold">
                      {settings.backgroundGap ?? 24}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="16"
                    max="48"
                    step="4"
                    value={settings.backgroundGap ?? 24}
                    onChange={(e) => handleUpdate('backgroundGap', parseInt(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Toggles: Ambient Glow, Spotlight Cursor, Snap to Grid, MiniMap */}
              <div className="space-y-2.5 pt-2 border-t border-zinc-800/80">
                <label className="flex items-center justify-between p-3 rounded-xl bg-[#121316] border border-zinc-800 cursor-pointer">
                  <div>
                    <div className="text-xs font-semibold text-zinc-200">
                      إضاءة محيطية في عمق الكانفاس (Radial Ambient Glow)
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      تدرجات لونية ناعمة وخافتة في خلفية العمل تعطي عمقاً بصرياً فائق الأناقة
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.ambientGlow ?? true}
                    onChange={(e) => handleUpdate('ambientGlow', e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 bg-zinc-900 border-zinc-700"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-[#121316] border border-zinc-800 cursor-pointer">
                  <div>
                    <div className="text-xs font-semibold text-zinc-200">
                      إضاءة تتبع الماوس الخافتة (Subtle Spotlight Cursor)
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      شعاع ضوئي ناعم يتبع مؤشر الفأرة ويضيء شبكة الكانفاس القريبة منه
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.spotlightCursor ?? true}
                    onChange={(e) => handleUpdate('spotlightCursor', e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 bg-zinc-900 border-zinc-700"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-[#121316] border border-zinc-800 cursor-pointer">
                  <div>
                    <div className="text-xs font-semibold text-zinc-200">
                      محاذاة تلقائية على الشبكة (Snap to Grid)
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      مغناطيسية دقيقة لمحاذاة العقد والبطاقات على أبعاد الشبكة أثناء السحب
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.snapToGrid ?? false}
                    onChange={(e) => handleUpdate('snapToGrid', e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 bg-zinc-900 border-zinc-700"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-[#121316] border border-zinc-800 cursor-pointer">
                  <div>
                    <div className="text-xs font-semibold text-zinc-200">
                      الوضع المختصر للعقد (Compact Node Mode)
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      عرض العقد على الكانفاس بحجم رشيق وبدون نصوص متكدسة
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.compactNodes}
                    onChange={(e) => handleUpdate('compactNodes', e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 bg-zinc-900 border-zinc-700"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-[#121316] border border-zinc-800 cursor-pointer">
                  <div>
                    <div className="text-xs font-semibold text-zinc-200">
                      حركة تدفق الأسلاك (Animated Edges)
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      إظهار انسياب متحرك على المسارات أثناء الربط والتنفيذ
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.animatedEdges}
                    onChange={(e) => handleUpdate('animatedEdges', e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 bg-zinc-900 border-zinc-700"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-[#121316] border border-zinc-800 cursor-pointer">
                  <div>
                    <div className="text-xs font-semibold text-zinc-200">
                      إظهار الخريطة المصغرة (MiniMap)
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      رؤية عامة في أسفل الشاشة للتنقل في الكانفاسات الكبيرة
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showMiniMap}
                    onChange={(e) => handleUpdate('showMiniMap', e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 bg-zinc-900 border-zinc-700"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: AI & Models Defaults */}
          {activeTab === 'ai' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    النموذج الافتراضي للعقد الجديدة:
                  </label>
                  <select
                    value={settings.defaultModel || DEFAULT_TEXT_MODEL}
                    onChange={(e) => handleUpdate('defaultModel', e.target.value)}
                    className="w-full bg-[#121316] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 font-sans"
                  >
                    <optgroup label="Google AI (متصل تلقائياً بمفتاحك 🟢)" className="bg-[#11131A] text-zinc-300">
                      {TEXT_MODELS.filter((m) => m.provider === 'google').map((m) => (
                        <option key={m.id} value={m.id} className="bg-[#11131A] text-white">
                          {m.name} {m.badge ? `— ${m.badge}` : ''}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Groq Cloud (فائق السرعة 🦙)" className="bg-[#11131A] text-zinc-300">
                      {TEXT_MODELS.filter((m) => m.provider === 'groq').map((m) => (
                        <option key={m.id} value={m.id} className="bg-[#11131A] text-white">
                          {m.name} {m.badge ? `— ${m.badge}` : ''}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="OpenAI (🔑 للمشتركين / BYOK)" className="bg-[#11131A] text-zinc-300">
                      {TEXT_MODELS.filter((m) => m.provider === 'openai').map((m) => (
                        <option key={m.id} value={m.id} className="bg-[#11131A] text-white">
                          {m.name} {m.badge ? `— ${m.badge}` : ''}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Anthropic (🔑 للمشتركين / BYOK)" className="bg-[#11131A] text-zinc-300">
                      {TEXT_MODELS.filter((m) => m.provider === 'anthropic').map((m) => (
                        <option key={m.id} value={m.id} className="bg-[#11131A] text-white">
                          {m.name} {m.badge ? `— ${m.badge}` : ''}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    لغة المخرجات الافتراضية:
                  </label>
                  <select
                    value={settings.defaultLanguage}
                    onChange={(e) => handleUpdate('defaultLanguage', e.target.value as any)}
                    className="w-full bg-[#121316] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="العربية الفصحى">العربية الفصحى</option>
                    <option value="اللهجة السعودية">اللهجة السعودية البيضاء</option>
                    <option value="الإنجليزية">الإنجليزية (English)</option>
                    <option value="نفس لغة المدخل">نفس لغة المدخل تلقائياً</option>
                  </select>
                </div>
              </div>

              {/* Temperature Slider */}
              <div className="p-3.5 rounded-xl bg-[#121316] border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                    درجة الإبداع الافتراضية (Default Temperature):
                  </span>
                  <span className="font-mono text-indigo-300 font-bold">
                    {settings.defaultTemperature}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.2"
                  step="0.1"
                  value={settings.defaultTemperature}
                  onChange={(e) =>
                    handleUpdate('defaultTemperature', parseFloat(e.target.value))
                  }
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>0.0 (دقيق ومحدد)</span>
                  <span>0.7 (متوازن وموصى به)</span>
                  <span>1.2 (حر وإبداعي)</span>
                </div>
              </div>

              {/* Streaming Toggle */}
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#121316] border border-zinc-800 cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-zinc-200">
                    تفعيل التوليد اللحظي (Stream Output)
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    ظهور الكلمات تباعاً أثناء توليد النموذج في الوقت الفعلي
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.streamingEnabled}
                  onChange={(e) => handleUpdate('streamingEnabled', e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-zinc-900 border-zinc-700"
                />
              </label>
            </div>
          )}

          {/* TAB 3: API Keys & Integrations */}
          {activeTab === 'keys' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Quick Launch Direct Add Key Modal */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-transparent border border-indigo-500/25 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>نافذة الربط السريع المباشرة (Quick AI Keys Manager)</span>
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    فحص فوري للاتصال وحفظ مباشر بنقرة زر لكافة المزودات (Google, Groq, OpenAI, Anthropic)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    window.dispatchEvent(
                      new CustomEvent('promptflow:open-add-key', { detail: { provider: 'google' } })
                    );
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20 active:scale-95 shrink-0"
                >
                  فتح نافذة الربط السريعة ⚡
                </button>
              </div>

              <p className="text-xs text-zinc-400">
                مفاتيحك تخزن محلياً فقط في متصفحك ولا ترسل إلى أي خادم خارجي سوى واجهات مزودي الخدمة مباشرة.
              </p>

              {/* 1. Google Gemini (Free Tier) */}
              <div className={`p-3 rounded-xl transition ${focusKeyTarget === 'gemini' ? 'ring-2 ring-sky-500 bg-sky-950/20' : ''}`}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                    <span>Google Gemini API Key:</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono">
                      طبقة مجانية Free Tier 🆓
                    </span>
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <span>الحصول على مفتاح مجاني</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={settings.geminiKey || ''}
                  onChange={(e) => handleUpdate('geminiKey', e.target.value)}
                  className="w-full bg-[#121316] border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              {/* 2. Groq (Free Tier for Llama 3.3) */}
              <div className={`p-3 rounded-xl transition ${focusKeyTarget === 'groq' ? 'ring-2 ring-amber-500 bg-amber-950/20' : ''}`}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                    <span>Groq API Key (Llama 3.3 / 3.1):</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono">
                      فائق السرعة ومجاني ⚡
                    </span>
                  </label>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>الحصول على مفتاح Groq</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="gsk_..."
                  value={settings.groqKey || ''}
                  onChange={(e) => handleUpdate('groqKey', e.target.value)}
                  className="w-full bg-[#121316] border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              {/* 3. OpenAI */}
              <div className={`p-3 rounded-xl transition ${focusKeyTarget === 'openai' ? 'ring-2 ring-indigo-500 bg-indigo-950/20' : ''}`}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-zinc-200 block">
                    OpenAI API Key (GPT-4o / GPT-4o-mini):
                  </label>
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <span>منصة OpenAI</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="sk-proj-..."
                  value={settings.openaiKey || ''}
                  onChange={(e) => handleUpdate('openaiKey', e.target.value)}
                  className="w-full bg-[#121316] border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {/* 4. Anthropic Claude */}
              <div className={`p-3 rounded-xl transition ${focusKeyTarget === 'anthropic' ? 'ring-2 ring-orange-500 bg-orange-950/20' : ''}`}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-zinc-200 block">
                    Anthropic Claude API Key:
                  </label>
                  <a
                    href="https://console.anthropic.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-orange-400 hover:underline flex items-center gap-1"
                  >
                    <span>منصة Anthropic</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="sk-ant-..."
                  value={settings.anthropicKey || ''}
                  onChange={(e) => handleUpdate('anthropicKey', e.target.value)}
                  className="w-full bg-[#121316] border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>



              <div className="pt-2 border-t border-zinc-800">
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  الرابط الافتراضي للـ Webhook (Webhook URL):
                </label>
                <input
                  type="url"
                  placeholder="https://hooks.zapier.com/hooks/catch/... أو Make / Telegram"
                  value={settings.globalWebhookUrl || ''}
                  onChange={(e) => handleUpdate('globalWebhookUrl', e.target.value)}
                  className="w-full bg-[#121316] border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  يستخدم بواسطة عقدة WebhookOutput لإرسال النتائج النهائية تلقائياً.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: Execution & Behavior */}
          {activeTab === 'execution' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#121316] border border-zinc-800 cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-zinc-200">
                    التشغيل التلقائي عند التعديل (Auto-run on change)
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    إعادة تشغيل العقد المتأثرة فورياً بمجرد تعديل نصوص المدخلات أو الأوامر
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoRunOnChange}
                  onChange={(e) => handleUpdate('autoRunOnChange', e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-zinc-900 border-zinc-700"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#121316] border border-zinc-800 cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-zinc-200">
                    المؤثرات الصوتية التفاعلية (Sound Effects)
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    رنات خفيفة لطيفة عبر متصفحك عند اكتمال المسار بنجاح أو حدوث خطأ
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.soundEffects}
                  onChange={(e) => handleUpdate('soundEffects', e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-zinc-900 border-zinc-700"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#121316] border border-zinc-800 cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-zinc-200">
                    التخزين المؤقت الذكي (Smart Caching)
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    تخطي إعادة تشغيل العقدة إذا لم تتغير مدخلاتها لتوفير استهلاك التوكنز والوقت
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.smartCaching}
                  onChange={(e) => handleUpdate('smartCaching', e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-zinc-900 border-zinc-700"
                />
              </label>
            </div>
          )}

          {/* TAB 5: Data & Storage */}
          {activeTab === 'storage' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-xl bg-[#121316] border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-zinc-200">
                    حجم البيانات المخزنة محلياً (Local Storage):
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    يشمل المخططات، القوالب، مساحات العمل والإعدادات
                  </div>
                </div>
                <span className="font-mono text-sm font-bold text-indigo-400 bg-indigo-950/50 px-3 py-1 rounded-lg border border-indigo-800/50">
                  {storageUsage}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleBackupExport}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium text-xs transition border border-zinc-700/60"
                >
                  <Download className="w-4 h-4 text-sky-400" />
                  <span>تصدير نسخة احتياطية كاملة (Backup All)</span>
                </button>

                <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium text-xs transition border border-zinc-700/60 cursor-pointer">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>استعادة نسخة احتياطية (Restore)</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestoreImport}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-2 mt-4">
                <div className="text-xs font-bold text-rose-300">
                  منطقة الخطر (Danger Zone):
                </div>
                <p className="text-[11px] text-rose-200/80 leading-relaxed">
                  مسح كافة البيانات المحلية وإعادة ضبط المصنع سيمسح مساحات العمل والمخططات والمفاتيح المخزنة على هذا المتصفح.
                </p>
                <button
                  type="button"
                  onClick={handleFactoryReset}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition shadow-sm"
                >
                  مسح الذاكرة وإعادة الضبط المصنعي ⚠️
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-zinc-800 bg-[#090A0E]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>تم الحفظ بنجاح!</span>
              </>
            ) : (
              <span>حفظ الإعدادات وتطبيقها ✨</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
