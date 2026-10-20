'use client';

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Globe,
  Sparkles,
  ImageIcon,
  GitMerge,
  Award,
  GripVertical,
  Plus,
  FileJson,
  Wand2,
  GitBranch,
  UploadCloud,
  StickyNote,
  ChevronRight,
  ChevronLeft,
  Radio,
  Scissors,
  Search,
  Mic,
  Repeat,
  X,
  Braces,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface NodeToolbarProps {
  onAddNode: (type: string) => void;
}

export const NodeToolbar: React.FC<NodeToolbarProps> = ({ onAddNode }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const nodeCategories = useMemo(
    () => [
      {
        category: 'المدخلات ومصادر البيانات',
        color: 'text-sky-400',
        nodes: [
          {
            type: 'textInput',
            label: 'مدخل نصي',
            desc: 'نص حر، فكرة، أو مسودة أولية',
            icon: <FileText className="w-4 h-4 text-sky-400" />,
            border: 'hover:border-sky-500/50',
            badge: 'Input',
          },
          {
            type: 'webSearch',
            label: 'بحث ويب مباشر',
            desc: 'استخراج نتائج ومعلومات حية من محركات البحث',
            icon: <Search className="w-4 h-4 text-cyan-400" />,
            border: 'hover:border-cyan-500/50',
            badge: 'Live',
          },
          {
            type: 'fileUpload',
            label: 'رفع مستند أو ملف',
            desc: 'استيراد TXT, MD, CSV, JSON',
            icon: <UploadCloud className="w-4 h-4 text-emerald-400" />,
            border: 'hover:border-emerald-500/50',
            badge: 'File',
          },
          {
            type: 'urlScraper',
            label: 'سحب رابط / يوتيوب',
            desc: 'استخراج وتفريغ محتوى المقالات والفيديو',
            icon: <Globe className="w-4 h-4 text-cyan-400" />,
            border: 'hover:border-cyan-500/50',
            badge: 'URL',
          },
          {
            type: 'httpRequest',
            label: 'طلب HTTP (API)',
            desc: 'استدعاء REST APIs بـ GET, POST, PUT, DELETE',
            icon: <Globe className="w-4 h-4 text-cyan-400" />,
            border: 'hover:border-cyan-500/50',
            badge: 'HTTP',
          },
        ],
      },
      {
        category: 'الذكاء الاصطناعي والتوليد',
        color: 'text-indigo-400',
        nodes: [
          {
            type: 'textAI',
            label: 'توليد نص ذكي (AI)',
            desc: 'نماذج GPT-4o, Claude 3.5, Gemini Pro',
            icon: <Sparkles className="w-4 h-4 text-indigo-400" />,
            border: 'hover:border-indigo-500/50',
            badge: 'LLM',
          },
          {
            type: 'toneRewriter',
            label: 'محول اللهجة والأسلوب',
            desc: 'إعادة صياغة بسعودية، فصحى، تسويقية',
            icon: <Wand2 className="w-4 h-4 text-violet-400" />,
            border: 'hover:border-violet-500/50',
            badge: 'Tone',
          },
          {
            type: 'imageAI',
            label: 'توليد الصور (Image AI)',
            desc: 'توليد صور فنية عبر Flux.1 و DALL-E 3',
            icon: <ImageIcon className="w-4 h-4 text-pink-400" />,
            border: 'hover:border-pink-500/50',
            badge: 'Image',
          },
        ],
      },
      {
        category: 'المنطق والعمليات التحويلية',
        color: 'text-amber-400',
        nodes: [
          {
            type: 'templateMerge',
            label: 'قالب دمج المتغيرات',
            desc: 'دمج قنوات متعددة في قالب واحد',
            icon: <GitMerge className="w-4 h-4 text-amber-400" />,
            border: 'hover:border-amber-500/50',
            badge: 'Merge',
          },
          {
            type: 'conditional',
            label: 'عقدة شرطية (If / Else)',
            desc: 'توجيه التدفق بحسب مطابقة الشروط',
            icon: <GitBranch className="w-4 h-4 text-amber-400" />,
            border: 'hover:border-amber-500/50',
            badge: 'Logic',
          },
          {
            type: 'structuredOutput',
            label: 'مخرجات مهيكلة (JSON Schema)',
            desc: 'تحويل البيانات لمخطط JSON Schema محكم',
            icon: <Braces className="w-4 h-4 text-violet-400" />,
            border: 'hover:border-violet-500/50',
            badge: 'Schema',
          },
          {
            type: 'jsonExtractor',
            label: 'استخراج بيانات منظمة (JSON)',
            desc: 'تحويل النص إلى مخرجات هيكلية نظيفة',
            icon: <FileJson className="w-4 h-4 text-cyan-400" />,
            border: 'hover:border-cyan-500/50',
            badge: 'JSON',
          },
          {
            type: 'delay',
            label: 'مؤقت تأخير (Delay)',
            desc: 'إيقاف مؤقت للتدفق (1-60 ثانية)',
            icon: <Clock className="w-4 h-4 text-amber-400" />,
            border: 'hover:border-amber-500/50',
            badge: 'Timer',
          },
          {
            type: 'splitter',
            label: 'تقسيم النصوص (Splitter)',
            desc: 'تجزئة النصوص والقوائم لعناصر مستقلة',
            icon: <Scissors className="w-4 h-4 text-amber-400" />,
            border: 'hover:border-amber-500/50',
            badge: 'Batch',
          },
          {
            type: 'batchLoop',
            label: 'تكرار دفعي (Batch Loop)',
            desc: 'معالجة قائمة عناصر خطوة تلو الأخرى',
            icon: <Repeat className="w-4 h-4 text-orange-400" />,
            border: 'hover:border-orange-500/50',
            badge: 'Loop',
          },
          {
            type: 'note',
            label: 'ملاحظة توثيقية (Sticky Note)',
            desc: 'ملاحظة لاصقة لتوثيق خطوات الكانفاس',
            icon: <StickyNote className="w-4 h-4 text-yellow-400" />,
            border: 'hover:border-yellow-500/50',
            badge: 'Note',
          },
        ],
      },
      {
        category: 'المخرجات والاختبار والتكامل',
        color: 'text-emerald-400',
        nodes: [
          {
            type: 'finalResult',
            label: 'النتيجة النهائية (Final Result)',
            desc: 'عرض وتصدير النصوص والصور المولدة',
            icon: <Award className="w-4 h-4 text-emerald-400" />,
            border: 'hover:border-emerald-500/50',
            badge: 'Output',
          },
          {
            type: 'testAssertion',
            label: 'فحص واختبار (Assertion)',
            desc: 'فحص جودة ومطابقة المخرجات آلياً (QA)',
            icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
            border: 'hover:border-emerald-500/50',
            badge: 'Assert',
          },
          {
            type: 'audioVoice',
            label: 'تعليق صوتي (TTS)',
            desc: 'تحويل النص إلى نطق صوتي مسموع',
            icon: <Mic className="w-4 h-4 text-teal-400" />,
            border: 'hover:border-teal-500/50',
            badge: 'Audio',
          },
          {
            type: 'webhookOutput',
            label: 'إرسال Webhook خارجي',
            desc: 'ربط المخرجات مع Zapier, Make, Slack',
            icon: <Radio className="w-4 h-4 text-emerald-400" />,
            border: 'hover:border-emerald-500/50',
            badge: 'Webhook',
          },
        ],
      },
    ],
    []
  );

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return nodeCategories;

    return nodeCategories
      .map((cat) => ({
        ...cat,
        nodes: cat.nodes.filter(
          (n) =>
            n.label.toLowerCase().includes(q) ||
            n.desc.toLowerCase().includes(q) ||
            n.type.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.nodes.length > 0);
  }, [nodeCategories, searchQuery]);

  return (
    <aside
      className={`${
        isCollapsed ? 'w-16' : 'w-72'
      } backdrop-blur-2xl border-l flex flex-col h-full z-20 select-none shadow-2xl transition-all duration-300 relative font-sans`}
      style={{
        backgroundColor: 'var(--sidebar-bg)',
        borderColor: 'var(--card-border)',
        color: 'var(--text-main)',
      }}
      dir="rtl"
    >
      {/* Sidebar Header */}
      <div
        className="p-3 border-b flex items-center justify-between"
        style={{ borderColor: 'var(--card-border)' }}
      >
        {!isCollapsed && (
          <div className="overflow-hidden">
            <h2 className="text-xs font-bold truncate" style={{ color: 'var(--text-main)' }}>
              مكتبة العقد (18 عقدة)
            </h2>
            <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
              اسحب أو انقر (+) للإضافة
            </p>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-xl hover:bg-[var(--card-header-bg)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition mx-auto"
          title={isCollapsed ? 'توسيع القائمة الجانبية' : 'طي القائمة الجانبية'}
        >
          {isCollapsed ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Quick Search Bar */}
      {!isCollapsed && (
        <div className="p-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute right-2.5 text-[var(--text-muted)] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث سريع عن عقدة..."
              className="w-full bg-[var(--card-header-bg)] border rounded-xl pr-8 pl-7 py-1.5 text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--card-border)] transition"
              style={{ borderColor: 'var(--card-border)' }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-2 p-0.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-main)] transition"
                title="مسح البحث"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Node Items List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-4">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-8 text-xs text-[var(--text-muted)]">
            لا توجد عقد مطابقة لـ &ldquo;{searchQuery}&rdquo;
          </div>
        ) : (
          filteredCategories.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-2">
              {!isCollapsed && (
                <span
                  className={`text-[10px] font-bold tracking-wider uppercase ${group.color} px-1 block truncate`}
                >
                  {group.category}
                </span>
              )}

              <div className="space-y-1.5">
                {group.nodes.map((node) => (
                  <div
                    key={node.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, node.type)}
                    onClick={() => {
                      if (isCollapsed) onAddNode(node.type);
                    }}
                    title={`${node.label} — ${node.desc}`}
                    className={`group relative rounded-xl border ${
                      isCollapsed ? 'p-2 justify-center' : 'p-2.5 justify-between'
                    } cursor-grab active:cursor-grabbing transition-all duration-150 shadow-sm flex items-center`}
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--card-border)',
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="p-1.5 rounded-lg border text-[var(--text-main)] group-hover:scale-105 transition-all shrink-0 shadow-sm"
                        style={{
                          backgroundColor: 'var(--card-header-bg)',
                          borderColor: 'var(--card-border)',
                        }}
                      >
                        {node.icon}
                      </div>
                      {!isCollapsed && (
                        <div className="overflow-hidden min-w-0">
                          <div className="text-xs font-semibold text-[var(--text-main)] group-hover:text-sky-300 transition-colors truncate">
                            {node.label}
                          </div>
                          <div className="text-[10px] text-[var(--text-muted)] leading-tight truncate">
                            {node.desc}
                          </div>
                        </div>
                      )}
                    </div>

                    {!isCollapsed && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddNode(node.type);
                          }}
                          className="p-1 rounded-lg bg-[var(--card-header-bg)] hover:bg-sky-500 hover:text-white text-[var(--text-muted)] transition-colors border border-[var(--card-border)]"
                          title="إضافة للكانفاس"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <GripVertical className="w-3.5 h-3.5 text-[var(--text-muted)] opacity-40 group-hover:opacity-100 transition" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div
          className="p-2.5 border-t text-[10px] text-center"
          style={{
            backgroundColor: 'var(--card-header-bg)',
            borderColor: 'var(--card-border)',
            color: 'var(--text-muted)',
          }}
        >
          💡 <span className="font-medium text-[var(--text-main)]">Ctrl + K</span> للبحث السريع وإضافة أي عقدة
        </div>
      )}
    </aside>
  );
};
