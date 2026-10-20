'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Sparkles,
  Wand2,
  FileCode,
  Image as ImageIcon,
  Braces,
  Merge,
  Split,
  GitBranch,
  Globe,
  Clock,
  Repeat,
  CheckCircle,
  FileText,
  Upload,
  Link2,
  CheckSquare,
  Send,
  Volume2,
  X,
} from 'lucide-react';

interface QuickNodeItem {
  type: string;
  label: string;
  category: 'ai' | 'utility' | 'input' | 'output';
  description: string;
  icon: React.ReactNode;
  accent: string;
}

const QUICK_NODES: QuickNodeItem[] = [
  // AI
  {
    type: 'textAI',
    label: 'توليد نص ذكي (Text AI)',
    category: 'ai',
    description: 'توليد ومخاطبة نماذج الذكاء الاصطناعي بدقة عالية',
    icon: <Sparkles className="w-4 h-4 text-indigo-400" />,
    accent: 'border-indigo-500/40 bg-indigo-950/20',
  },
  {
    type: 'toneRewriter',
    label: 'محول اللهجة والأسلوب (Tone)',
    category: 'ai',
    description: 'إعادة الصياغة باللهجة السعودية أو الخليجية أو الفصحى',
    icon: <Wand2 className="w-4 h-4 text-violet-400" />,
    accent: 'border-violet-500/40 bg-violet-950/20',
  },
  {
    type: 'structuredOutput',
    label: 'مخرجات مهيكلة (JSON Schema)',
    category: 'ai',
    description: 'فرض بنية JSON صارمة ومطابقة للمخطط',
    icon: <FileCode className="w-4 h-4 text-cyan-400" />,
    accent: 'border-cyan-500/40 bg-cyan-950/20',
  },
  {
    type: 'imageAI',
    label: 'توليد صور ذكية (Image AI)',
    category: 'ai',
    description: 'تحويل النص إلى صور عالية الدقة عبر الانتشار',
    icon: <ImageIcon className="w-4 h-4 text-pink-400" />,
    accent: 'border-pink-500/40 bg-pink-950/20',
  },
  {
    type: 'jsonExtractor',
    label: 'استخراج حقول JSON',
    category: 'ai',
    description: 'استخلاص حقول ومفاتيح محددة من النص',
    icon: <Braces className="w-4 h-4 text-teal-400" />,
    accent: 'border-teal-500/40 bg-teal-950/20',
  },

  // Utilities
  {
    type: 'templateMerge',
    label: 'دمج وتنسيق (Template Merge)',
    category: 'utility',
    description: 'دمج مدخلات متعددة داخل قالب موحد',
    icon: <Merge className="w-4 h-4 text-amber-400" />,
    accent: 'border-amber-500/40 bg-amber-950/20',
  },
  {
    type: 'splitter',
    label: 'مقسم نصوص (Splitter)',
    category: 'utility',
    description: 'تقسيم المحتوى لأسطر أو فقرات أو فواصل',
    icon: <Split className="w-4 h-4 text-orange-400" />,
    accent: 'border-orange-500/40 bg-orange-950/20',
  },
  {
    type: 'conditional',
    label: 'شرطي وتفرع (Branch)',
    category: 'utility',
    description: 'توجيه المسار بناءً على الشروط والقيم',
    icon: <GitBranch className="w-4 h-4 text-yellow-400" />,
    accent: 'border-yellow-500/40 bg-yellow-950/20',
  },
  {
    type: 'httpRequest',
    label: 'طلب HTTP (API)',
    category: 'utility',
    description: 'الاتصال بنقاط نهاية REST الخارجية',
    icon: <Globe className="w-4 h-4 text-blue-400" />,
    accent: 'border-blue-500/40 bg-blue-950/20',
  },
  {
    type: 'delay',
    label: 'مؤقت تأخير (Delay)',
    category: 'utility',
    description: 'إيقاف مؤقت للسلسلة بالثواني',
    icon: <Clock className="w-4 h-4 text-zinc-400" />,
    accent: 'border-zinc-700 bg-zinc-900/40',
  },
  {
    type: 'batchLoop',
    label: 'تكرار دفعي (Loop)',
    category: 'utility',
    description: 'معالجة عناصر القائمة تباعاً',
    icon: <Repeat className="w-4 h-4 text-purple-400" />,
    accent: 'border-purple-500/40 bg-purple-950/20',
  },
  {
    type: 'testAssertion',
    label: 'فحص واختبار (Assertion)',
    category: 'utility',
    description: 'التأكد من سلامة وصحة النتائج السابقة',
    icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
    accent: 'border-emerald-500/40 bg-emerald-950/20',
  },

  // Inputs
  {
    type: 'textInput',
    label: 'مدخل نصي (Text Input)',
    category: 'input',
    description: 'كتابة نصوص أو مدخلات أولية',
    icon: <FileText className="w-4 h-4 text-sky-400" />,
    accent: 'border-sky-500/40 bg-sky-950/20',
  },
  {
    type: 'webSearch',
    label: 'بحث ويب مباشر (Web Search)',
    category: 'input',
    description: 'البحث المباشر وجلب مقتطفات من الإنترنت',
    icon: <Globe className="w-4 h-4 text-emerald-400" />,
    accent: 'border-emerald-500/40 bg-emerald-950/20',
  },
  {
    type: 'urlScraper',
    label: 'جلب محتوى رابط (Scraper)',
    category: 'input',
    description: 'استخراج النصوص من صفحات الويب والمقالات',
    icon: <Link2 className="w-4 h-4 text-blue-400" />,
    accent: 'border-blue-500/40 bg-blue-950/20',
  },
  {
    type: 'fileUpload',
    label: 'رفع ملفات ومستندات',
    category: 'input',
    description: 'تحميل ملفات نصوص وPDF وبيانات',
    icon: <Upload className="w-4 h-4 text-indigo-400" />,
    accent: 'border-indigo-500/40 bg-indigo-950/20',
  },

  // Outputs
  {
    type: 'finalResult',
    label: 'النتيجة النهائية (Output)',
    category: 'output',
    description: 'عرض وحفظ وتصدير الحزمة النهائية',
    icon: <CheckSquare className="w-4 h-4 text-emerald-400" />,
    accent: 'border-emerald-500/40 bg-emerald-950/20',
  },
  {
    type: 'webhookOutput',
    label: 'إرسال Webhook خارجي',
    category: 'output',
    description: 'إرسال المخرجات لنظام CRM أو Make/Zapier',
    icon: <Send className="w-4 h-4 text-cyan-400" />,
    accent: 'border-cyan-500/40 bg-cyan-950/20',
  },
  {
    type: 'audioVoice',
    label: 'تعليق صوتي (TTS Voice)',
    category: 'output',
    description: 'نطق المخرجات صوتياً عبر محرك TTS',
    icon: <Volume2 className="w-4 h-4 text-violet-400" />,
    accent: 'border-violet-500/40 bg-violet-950/20',
  },
];

interface QuickAddNodeMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onSelectNodeType: (type: string) => void;
}

export const QuickAddNodeMenu: React.FC<QuickAddNodeMenuProps> = ({
  isOpen,
  position,
  onClose,
  onSelectNodeType,
}) => {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle click outside & escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const filteredNodes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return QUICK_NODES;
    return QUICK_NODES.filter(
      (n) =>
        n.label.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.type.toLowerCase().includes(q)
    );
  }, [search]);

  if (!isOpen) return null;

  // Calculate safe window coordinates so menu doesn't overflow
  const menuWidth = 340;
  const menuHeight = 440;
  const x =
    typeof window !== 'undefined'
      ? Math.max(16, Math.min(position.x, window.innerWidth - menuWidth - 20))
      : position.x;
  const y =
    typeof window !== 'undefined'
      ? Math.max(16, Math.min(position.y, window.innerHeight - menuHeight - 20))
      : position.y;

  return (
    <div
      ref={containerRef}
      className="fixed z-50 w-[340px] bg-[#0E1017]/95 backdrop-blur-2xl border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-zinc-100 animate-in fade-in zoom-in-95 duration-150 select-none"
      style={{ left: x, top: y }}
      dir="rtl"
    >
      {/* Search Header */}
      <div className="p-3 border-b border-zinc-800 bg-[#090B10] flex items-center gap-2">
        <Search className="w-4 h-4 text-indigo-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث عن العقدة للإضافة والربط التلقائي..."
          className="w-full bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="p-1 rounded text-zinc-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Nodes List */}
      <div className="max-h-[380px] overflow-y-auto p-2 space-y-1 select-none">
        {filteredNodes.length > 0 ? (
          filteredNodes.map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => onSelectNodeType(item.type)}
              className="w-full p-2.5 rounded-xl hover:bg-zinc-800/90 text-right transition flex items-start gap-3 group border border-transparent hover:border-zinc-700/60"
            >
              <div
                className={`p-2 rounded-lg shrink-0 border transition ${item.accent} group-hover:scale-105`}
              >
                {item.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-zinc-200 group-hover:text-indigo-300 transition truncate">
                  {item.label}
                </div>
                <div className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5 leading-relaxed">
                  {item.description}
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="py-8 text-center text-xs text-zinc-500">
            لا توجد عقدة تطابق &quot;{search}&quot;
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-1.5 bg-[#08090D] border-t border-zinc-800 text-[10px] text-zinc-500 flex items-center justify-between">
        <span>اختر عقدة لربطها فورياً بالسلك ⚡</span>
        <span className="font-mono text-zinc-600">Esc للإلغاء</span>
      </div>
    </div>
  );
};
