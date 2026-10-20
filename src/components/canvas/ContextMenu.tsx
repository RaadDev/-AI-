'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Globe,
  Upload,
  Sparkles,
  Wand2,
  ImageIcon,
  GitMerge,
  FileJson,
  GitBranch,
  StickyNote,
  Award,
  LayoutGrid,
  Trash2,
  Search,
  Play,
  FastForward,
  Copy,
  CopyPlus,
  RotateCcw,
  Minimize2,
  Maximize2,
  Unlink,
  ClipboardPaste,
  Eraser,
  Scissors,
  PlusCircle,
  Split,
  Send,
  Radio,
  Mic,
  Repeat,
} from 'lucide-react';

export interface ContextMenuState {
  type: 'pane' | 'node' | 'edge';
  x: number;
  y: number;
  flowPosition?: { x: number; y: number };
  nodeId?: string;
  nodeData?: any;
  edgeId?: string;
  edge?: any;
}

export interface ContextMenuProps {
  state: ContextMenuState;
  onClose: () => void;
  // Pane Actions
  onAddNode: (type: string, position: { x: number; y: number }) => void;
  onAutoLayout: () => void;
  onFitView: () => void;
  onRunAll: () => void;
  onClearAllOutputs: () => void;
  onPasteNode: (position: { x: number; y: number }) => void;
  hasClipboardNode: boolean;
  // Node Actions
  onRunSingleNode: (nodeId: string) => void;
  onRunFromNode: (nodeId: string) => void;
  onCopyNode: (nodeId: string) => void;
  onDuplicateNode: (nodeId: string) => void;
  onResetNodeOutput: (nodeId: string) => void;
  onToggleCollapseNode: (nodeId: string) => void;
  onDisconnectNodeEdges: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  // Edge Actions
  onInsertNodeOnEdge: (edgeId: string, nodeType: string) => void;
  onDeleteEdge: (edgeId: string) => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  state,
  onClose,
  onAddNode,
  onAutoLayout,
  onFitView,
  onRunAll,
  onClearAllOutputs,
  onPasteNode,
  hasClipboardNode,
  onRunSingleNode,
  onRunFromNode,
  onCopyNode,
  onDuplicateNode,
  onResetNodeOutput,
  onToggleCollapseNode,
  onDisconnectNodeEdges,
  onDeleteNode,
  onInsertNodeOnEdge,
  onDeleteEdge,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInsertSubmenu, setShowInsertSubmenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const allNodesList = [
    {
      category: 'مدخلات (Inputs)',
      options: [
        {
          type: 'textInput',
          label: 'مدخل نصي',
          desc: 'نص حر أو فكرة أولية',
          icon: <FileText className="w-3.5 h-3.5 text-sky-400" />,
        },
        {
          type: 'fileUpload',
          label: 'رفع ملف أو مستند',
          desc: 'استخراج TXT, MD, CSV, JSON',
          icon: <Upload className="w-3.5 h-3.5 text-emerald-400" />,
        },
        {
          type: 'urlScraper',
          label: 'سحب يوتيوب / رابط',
          desc: 'استخراج نصوص المقالات والفيديو',
          icon: <Globe className="w-3.5 h-3.5 text-cyan-400" />,
        },
        {
          type: 'webSearch',
          label: 'بحث ويب مباشر (Web Search)',
          desc: 'جلب معلومات وأخبار حديثة',
          icon: <Radio className="w-3.5 h-3.5 text-blue-400" />,
        },
      ],
    },
    {
      category: 'معالجة ذكية (AI)',
      options: [
        {
          type: 'textAI',
          label: 'توليد نص (Text AI)',
          desc: 'GPT-4o, Gemini 1.5/2.0',
          icon: <Sparkles className="w-3.5 h-3.5 text-purple-400" />,
        },
        {
          type: 'toneRewriter',
          label: 'محول اللهجة والأسلوب',
          desc: 'سعودية، خليجية، فصحى، تنفيذي',
          icon: <Wand2 className="w-3.5 h-3.5 text-violet-400" />,
        },
        {
          type: 'imageAI',
          label: 'توليد صور (Image AI)',
          desc: 'Flux.1, DALL-E 3',
          icon: <ImageIcon className="w-3.5 h-3.5 text-pink-400" />,
        },
      ],
    },
    {
      category: 'أدوات ومنطق (Utility & Logic)',
      options: [
        {
          type: 'splitter',
          label: 'مقسم النصوص (Splitter)',
          desc: 'تقسيم ومعالجة دفعية للنصوص',
          icon: <Split className="w-3.5 h-3.5 text-orange-400" />,
        },
        {
          type: 'batchLoop',
          label: 'تكرار دفعي (Batch Loop)',
          desc: 'معالجة قائمة عناصر خطوة بخطوة',
          icon: <Repeat className="w-3.5 h-3.5 text-orange-400" />,
        },
        {
          type: 'conditional',
          label: 'عقدة شرطية (If / Else)',
          desc: 'توجيه المسار حسب الشروط',
          icon: <GitBranch className="w-3.5 h-3.5 text-amber-400" />,
        },
        {
          type: 'jsonExtractor',
          label: 'استخراج بيانات (JSON)',
          desc: 'تحويل النص إلى جدول أو JSON',
          icon: <FileJson className="w-3.5 h-3.5 text-cyan-400" />,
        },
        {
          type: 'templateMerge',
          label: 'دمج قوالب (Merge)',
          desc: 'دمج متغيرات بنموذج {{input}}',
          icon: <GitMerge className="w-3.5 h-3.5 text-amber-400" />,
        },
        {
          type: 'webhookOutput',
          label: 'إرسال Webhook خارجي',
          desc: 'ربط خارجي بـ Make / Zapier',
          icon: <Send className="w-3.5 h-3.5 text-indigo-400" />,
        },
        {
          type: 'audioVoice',
          label: 'تعليق صوتي (TTS Voice)',
          desc: 'تحويل النص إلى نطق صوتي مسموع',
          icon: <Mic className="w-3.5 h-3.5 text-teal-400" />,
        },
        {
          type: 'note',
          label: 'ملاحظة لاصقة (Sticky Note)',
          desc: 'شرح وتوثيق اللوحة',
          icon: <StickyNote className="w-3.5 h-3.5 text-yellow-400" />,
        },
        {
          type: 'finalResult',
          label: 'النتيجة النهائية',
          desc: 'شاشة النتيجة والتصدير',
          icon: <Award className="w-3.5 h-3.5 text-emerald-400" />,
        },
      ],
    },
  ];

  // Filter nodes according to search query
  const filteredCategories = allNodesList
    .map((cat) => ({
      ...cat,
      options: cat.options.filter(
        (opt) =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          opt.desc.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((cat) => cat.options.length > 0);

  const insertableNodes = [
    {
      type: 'textAI',
      label: 'توليد نص (Text AI)',
      icon: <Sparkles className="w-3.5 h-3.5 text-purple-400" />,
    },
    {
      type: 'toneRewriter',
      label: 'محول اللهجة والأسلوب',
      icon: <Wand2 className="w-3.5 h-3.5 text-violet-400" />,
    },
    {
      type: 'jsonExtractor',
      label: 'استخراج بيانات (JSON)',
      icon: <FileJson className="w-3.5 h-3.5 text-cyan-400" />,
    },
    {
      type: 'templateMerge',
      label: 'دمج قوالب (Merge)',
      icon: <GitMerge className="w-3.5 h-3.5 text-amber-400" />,
    },
    {
      type: 'conditional',
      label: 'عقدة شرطية (If / Else)',
      icon: <GitBranch className="w-3.5 h-3.5 text-amber-400" />,
    },
  ];

  // Calculate safe window coordinates so menu doesn't overflow
  const menuWidth = state.type === 'pane' ? 260 : 220;
  const menuHeight = state.type === 'pane' ? 440 : 300;
  const left = Math.min(state.x, window.innerWidth - menuWidth - 15);
  const top = Math.min(state.y, window.innerHeight - menuHeight - 15);

  return (
    <div
      ref={menuRef}
      style={{ top, left }}
      className="fixed z-50 backdrop-blur-2xl bg-[#0F1117]/90 border border-white/10 shadow-2xl shadow-black/80 rounded-2xl p-2 font-sans text-xs text-slate-200 select-none animate-in fade-in zoom-in-95 duration-150"
      dir="rtl"
    >
      {/* ============================================================ */}
      {/* 1. BLANK PANE CONTEXT MENU */}
      {/* ============================================================ */}
      {state.type === 'pane' && (
        <div className="w-64 space-y-2">
          {/* Search Bar */}
          <div className="relative px-0.5 pt-0.5">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن عقدة سريعة..."
              className="w-full bg-[#08090D] border border-white/[0.08] rounded-xl py-2 pr-8 pl-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500/60 transition"
            />
          </div>

          {/* Node Categories List */}
          <div className="max-h-56 overflow-y-auto space-y-2 px-0.5 custom-scrollbar">
            {filteredCategories.map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="px-2 py-0.5 text-[10px] font-bold text-slate-400 tracking-wider">
                  {cat.category}
                </div>
                {cat.options.map((opt) => (
                  <button
                    key={opt.type}
                    onClick={() => {
                      if (state.flowPosition) {
                        onAddNode(opt.type, state.flowPosition);
                      }
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-white/[0.06] text-right text-slate-200 hover:text-white transition group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-white/[0.04] border border-white/[0.06] group-hover:scale-105 transition-transform">
                        {opt.icon}
                      </div>
                      <span className="text-[11px] font-medium leading-none">
                        {opt.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Canvas Quick Actions Divider */}
          <div className="border-t border-white/[0.08] pt-1.5 space-y-1">
            <button
              onClick={() => {
                onRunAll();
                onClose();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/[0.06] text-right text-emerald-400 hover:text-emerald-300 transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="text-[11px] font-medium">تشغيل السلسلة بالكامل</span>
            </button>

            <button
              onClick={() => {
                onAutoLayout();
                onClose();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/[0.06] text-right text-indigo-400 hover:text-indigo-300 transition"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">ترتيب تلقائي للعقد</span>
            </button>

            <button
              onClick={() => {
                onFitView();
                onClose();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/[0.06] text-right text-slate-300 hover:text-white transition"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">توسيط وملاءمة الشاشة</span>
            </button>

            {hasClipboardNode && state.flowPosition && (
              <button
                onClick={() => {
                  if (state.flowPosition) onPasteNode(state.flowPosition);
                  onClose();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/[0.06] text-right text-violet-300 hover:text-white transition"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">لصق العقدة المنسوخة</span>
              </button>
            )}

            <button
              onClick={() => {
                onClearAllOutputs();
                onClose();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/[0.06] text-right text-slate-400 hover:text-slate-200 transition"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">مسح المخرجات السابقة</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. NODE CONTEXT MENU */}
      {/* ============================================================ */}
      {state.type === 'node' && state.nodeId && (
        <div className="w-56 space-y-1">
          <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 border-b border-white/[0.08] mb-1 flex items-center justify-between">
            <span>خيارات العقدة</span>
            <span className="text-slate-500 font-mono text-[9px]">
              {state.nodeId.substring(0, 10)}
            </span>
          </div>

          <button
            onClick={() => {
              onRunSingleNode(state.nodeId!);
              onClose();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/[0.06] text-right text-emerald-400 hover:text-emerald-300 transition"
          >
            <Play className="w-3.5 h-3.5 fill-emerald-400" />
            <span className="text-[11px] font-medium">تشغيل هذه العقدة فقط</span>
          </button>

          <button
            onClick={() => {
              onRunFromNode(state.nodeId!);
              onClose();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/[0.06] text-right text-sky-400 hover:text-sky-300 transition"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">تشغيل من هنا حتى النهاية</span>
          </button>

          <div className="border-t border-white/[0.08] my-1" />

          <button
            onClick={() => {
              onCopyNode(state.nodeId!);
              onClose();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/[0.06] text-right text-slate-300 hover:text-white transition"
          >
            <Copy className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-medium">نسخ العقدة (Copy)</span>
          </button>

          <button
            onClick={() => {
              onDuplicateNode(state.nodeId!);
              onClose();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/[0.06] text-right text-slate-300 hover:text-white transition"
          >
            <CopyPlus className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-medium">مضاعفة العقدة (Duplicate)</span>
          </button>

          <button
            onClick={() => {
              onResetNodeOutput(state.nodeId!);
              onClose();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/[0.06] text-right text-slate-400 hover:text-slate-200 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">إعادة تعيين المخرجات</span>
          </button>

          <button
            onClick={() => {
              onToggleCollapseNode(state.nodeId!);
              onClose();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/[0.06] text-right text-slate-300 hover:text-white transition"
          >
            <Minimize2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-medium">طي / توسيع العقدة</span>
          </button>

          <button
            onClick={() => {
              onDisconnectNodeEdges(state.nodeId!);
              onClose();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-amber-950/30 text-right text-amber-400 transition"
          >
            <Unlink className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">فصل جميع الأسلاك</span>
          </button>

          <div className="border-t border-white/[0.08] my-1" />

          <button
            onClick={() => {
              onDeleteNode(state.nodeId!);
              onClose();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-rose-950/50 text-right text-rose-400 hover:text-rose-300 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">حذف العقدة</span>
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. EDGE CONTEXT MENU */}
      {/* ============================================================ */}
      {state.type === 'edge' && state.edgeId && (
        <div className="w-56 space-y-1">
          <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 border-b border-white/[0.08] mb-1">
            خيارات المسار (Edge)
          </div>

          {!showInsertSubmenu ? (
            <>
              <button
                onClick={() => setShowInsertSubmenu(true)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-white/[0.06] text-right text-sky-400 hover:text-sky-300 transition"
              >
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium">
                    إدراج عقدة في منتصف السلك
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">◀</span>
              </button>

              <button
                onClick={() => {
                  onDeleteEdge(state.edgeId!);
                  onClose();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-rose-950/50 text-right text-rose-400 hover:text-rose-300 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">حذف هذا المسار</span>
              </button>
            </>
          ) : (
            <div className="space-y-1 animate-in fade-in slide-in-from-right-2 duration-150">
              <div className="px-2 py-0.5 text-[10px] font-semibold text-slate-400 flex items-center justify-between">
                <span>اختر العقدة للإدراج:</span>
                <button
                  onClick={() => setShowInsertSubmenu(false)}
                  className="text-slate-500 hover:text-slate-300 text-[10px]"
                >
                  رجوع ▶
                </button>
              </div>

              {insertableNodes.map((item) => (
                <button
                  key={item.type}
                  onClick={() => {
                    onInsertNodeOnEdge(state.edgeId!, item.type);
                    onClose();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/[0.06] text-right text-slate-200 hover:text-white transition group"
                >
                  <div className="p-1 rounded-lg bg-white/[0.04] border border-white/[0.06] group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                  <span className="text-[11px] font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

