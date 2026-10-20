'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Play,
  LayoutGrid,
  Camera,
  Download,
  Trash2,
  FolderGit2,
  Target,
  KeyRound,
  FileText,
  Upload,
  Globe,
  Sparkles,
  Wand2,
  ImageIcon,
  GitBranch,
  FileJson,
  GitMerge,
  StickyNote,
  Award,
  Maximize2,
  Eraser,
  HelpCircle,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNode: (type: string) => void;
  onRunAll: () => void;
  onAutoLayout: () => void;
  onExportPng: () => void;
  onExportJson: () => void;
  onFitView: () => void;
  onClearOutputs: () => void;
  onOpenBrandVoice: () => void;
  onOpenWorkspaces: () => void;
  onOpenApiKeys: () => void;
  onOpenShortcuts: () => void;
  onOpenTemplates?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onAddNode,
  onRunAll,
  onAutoLayout,
  onExportPng,
  onExportJson,
  onFitView,
  onClearOutputs,
  onOpenBrandVoice,
  onOpenWorkspaces,
  onOpenApiKeys,
  onOpenShortcuts,
  onOpenTemplates,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    // Execution & Layout
    {
      id: 'run-all',
      title: 'تشغيل السلسلة بالكامل (Run All)',
      category: 'إجراءات الكانفاس',
      icon: <Play className="w-4 h-4 text-emerald-400" />,
      hotkey: 'Ctrl + Enter',
      action: onRunAll,
    },
    {
      id: 'auto-layout',
      title: 'ترتيب تلقائي للعقد (Auto-Layout)',
      category: 'إجراءات الكانفاس',
      icon: <LayoutGrid className="w-4 h-4 text-sky-400" />,
      hotkey: 'Layout',
      action: onAutoLayout,
    },
    {
      id: 'fit-view',
      title: 'توسيط وملاءمة الشاشة (Fit View)',
      category: 'إجراءات الكانفاس',
      icon: <Maximize2 className="w-4 h-4 text-indigo-400" />,
      hotkey: 'Fit',
      action: onFitView,
    },
    {
      id: 'export-png',
      title: 'تصدير الكانفاس كصورة (Export PNG)',
      category: 'تصدير ومشاركة',
      icon: <Camera className="w-4 h-4 text-amber-400" />,
      hotkey: 'PNG',
      action: onExportPng,
    },
    {
      id: 'export-json',
      title: 'تصدير المخطط كملف (Export JSON)',
      category: 'تصدير ومشاركة',
      icon: <Download className="w-4 h-4 text-slate-300" />,
      hotkey: 'JSON',
      action: onExportJson,
    },
    {
      id: 'brand-voice',
      title: 'إعدادات هوية البرند (Brand Voice)',
      category: 'إعدادات وأدوات',
      icon: <Target className="w-4 h-4 text-rose-400" />,
      action: onOpenBrandVoice,
    },
    {
      id: 'workspaces',
      title: 'إدارة مساحات العمل (Workspaces)',
      category: 'إعدادات وأدوات',
      icon: <FolderGit2 className="w-4 h-4 text-sky-400" />,
      action: onOpenWorkspaces,
    },
    ...(onOpenTemplates
      ? [
          {
            id: 'templates-hub',
            title: 'مكتبة القوالب الجاهزة (26+ Templates Hub)',
            category: 'إعدادات وأدوات',
            icon: <Sparkles className="w-4 h-4 text-violet-400" />,
            action: onOpenTemplates,
          },
        ]
      : []),
    {
      id: 'api-keys',
      title: 'مفاتيح الـ AI (API Keys)',
      category: 'إعدادات وأدوات',
      icon: <KeyRound className="w-4 h-4 text-amber-400" />,
      action: onOpenApiKeys,
    },
    {
      id: 'shortcuts',
      title: 'جدول اختصارات الكيبورد (Shortcuts)',
      category: 'إعدادات وأدوات',
      icon: <HelpCircle className="w-4 h-4 text-purple-400" />,
      hotkey: '?',
      action: onOpenShortcuts,
    },
    {
      id: 'clear-outputs',
      title: 'مسح جميع المخرجات السابقة (Clear Outputs)',
      category: 'إجراءات الكانفاس',
      icon: <Eraser className="w-4 h-4 text-slate-400" />,
      action: onClearOutputs,
    },

    // Add Nodes
    {
      id: 'add-textAI',
      title: 'إضافة: توليد نص (Text AI)',
      category: 'إضافة عقدة',
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
      action: () => onAddNode('textAI'),
    },
    {
      id: 'add-toneRewriter',
      title: 'إضافة: محول اللهجة والأسلوب (Tone Rewriter)',
      category: 'إضافة عقدة',
      icon: <Wand2 className="w-4 h-4 text-violet-400" />,
      action: () => onAddNode('toneRewriter'),
    },
    {
      id: 'add-jsonExtractor',
      title: 'إضافة: استخراج بيانات مهيكلة (JSON Extractor)',
      category: 'إضافة عقدة',
      icon: <FileJson className="w-4 h-4 text-cyan-400" />,
      action: () => onAddNode('jsonExtractor'),
    },
    {
      id: 'add-fileUpload',
      title: 'إضافة: رفع مستند أو ملف (File Upload)',
      category: 'إضافة عقدة',
      icon: <Upload className="w-4 h-4 text-emerald-400" />,
      action: () => onAddNode('fileUpload'),
    },
    {
      id: 'add-textInput',
      title: 'إضافة: مدخل نصي (Text Input)',
      category: 'إضافة عقدة',
      icon: <FileText className="w-4 h-4 text-sky-400" />,
      action: () => onAddNode('textInput'),
    },
    {
      id: 'add-urlScraper',
      title: 'إضافة: سحب رابط / تفريغ يوتيوب (URL Scraper)',
      category: 'إضافة عقدة',
      icon: <Globe className="w-4 h-4 text-cyan-400" />,
      action: () => onAddNode('urlScraper'),
    },
    {
      id: 'add-conditional',
      title: 'إضافة: عقدة شرطية (Conditional If/Else)',
      category: 'إضافة عقدة',
      icon: <GitBranch className="w-4 h-4 text-amber-400" />,
      action: () => onAddNode('conditional'),
    },
    {
      id: 'add-imageAI',
      title: 'إضافة: توليد صور (Image AI)',
      category: 'إضافة عقدة',
      icon: <ImageIcon className="w-4 h-4 text-pink-400" />,
      action: () => onAddNode('imageAI'),
    },
    {
      id: 'add-templateMerge',
      title: 'إضافة: دمج القوالب (Template Merge)',
      category: 'إضافة عقدة',
      icon: <GitMerge className="w-4 h-4 text-amber-400" />,
      action: () => onAddNode('templateMerge'),
    },
    {
      id: 'add-note',
      title: 'إضافة: ملاحظة لاصقة (Sticky Note)',
      category: 'إضافة عقدة',
      icon: <StickyNote className="w-4 h-4 text-yellow-400" />,
      action: () => onAddNode('note'),
    },
    {
      id: 'add-finalResult',
      title: 'إضافة: شاشة النتيجة النهائية (Final Result)',
      category: 'إضافة عقدة',
      icon: <Award className="w-4 h-4 text-emerald-400" />,
      action: () => onAddNode('finalResult'),
    },
  ];

  const filtered = actions.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item: typeof actions[0]) => {
    item.action();
    onClose();
  };

  const handleKeyDownList = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === 0 ? Math.max(0, filtered.length - 1) : prev - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex]);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl backdrop-blur-2xl bg-[#0F1117]/95 border border-white/10 shadow-2xl shadow-black/80 rounded-2xl overflow-hidden font-sans select-none animate-in zoom-in-95 duration-150"
        dir="rtl"
        onKeyDown={handleKeyDownList}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08] bg-[#08090D]/80">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="ابحث عن أمر، عقدة، إجراء، أو ميزة..."
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono bg-white/[0.06] text-slate-400 px-2 py-0.5 rounded-lg border border-white/[0.08]">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              لا توجد أوامر مطابقة لـ &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition ${
                    isSelected
                      ? 'bg-violet-950/60 text-white border border-violet-500/40 shadow-sm'
                      : 'hover:bg-white/[0.04] text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{item.title}</div>
                      <div className="text-[10px] text-slate-400">{item.category}</div>
                    </div>
                  </div>

                  {item.hotkey && (
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700">
                      {item.hotkey}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/80 text-[10px] text-slate-400 flex items-center justify-between">
          <span>
            استخدم <kbd className="font-mono text-slate-300">↑</kbd>{' '}
            <kbd className="font-mono text-slate-300">↓</kbd> للتنقل، و{' '}
            <kbd className="font-mono text-slate-300">Enter</kbd> للتنفيذ
          </span>
          <span className="text-slate-500">PF Studio Command Palette</span>
        </div>
      </div>
    </div>
  );
};
