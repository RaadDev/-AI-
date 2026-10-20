'use client';

import React, { useState, useMemo } from 'react';
import { 
  X, Search, Sparkles, Filter, ArrowLeft, Layers, 
  Megaphone, Mail, ShoppingBag, Video, Languages, 
  FileText, Code, ShieldAlert, BarChart3, Send, Headphones,
  Palette, ShieldCheck, CheckCircle2, Bookmark,
  GitCompare, GitFork, RefreshCw, Smile, Briefcase, Repeat, Globe, BookOpen, FileCode
} from 'lucide-react';
import { WORKFLOW_TEMPLATES, WorkflowTemplate } from '@/data/sampleWorkflows';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate?: (template: WorkflowTemplate) => void;
  onSelectTemplate?: (template: WorkflowTemplate) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'جميع القوالب' },
  { id: 'marketing', label: 'التسويق والإعلانات' },
  { id: 'social', label: 'السوشيال ميديا' },
  { id: 'seo', label: 'السيو والمقالات' },
  { id: 'business', label: 'الأعمال والبيانات' },
  { id: 'automation', label: 'الأتمتة والـ APIs' },
  { id: 'media', label: 'الصوتيات والوسائط' },
  { id: 'dev', label: 'البرمجة والمطورين' },
];

const YoutubeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const LinkedinIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

const getTemplateIcon = (iconName: string) => {
  switch (iconName) {
    case 'Megaphone': return <Megaphone className="w-5 h-5" />;
    case 'Mail': return <Mail className="w-5 h-5" />;
    case 'ShoppingBag': return <ShoppingBag className="w-5 h-5" />;
    case 'GitCompare': return <GitCompare className="w-5 h-5" />;
    case 'Youtube': return <YoutubeIcon className="w-5 h-5" />;
    case 'Video': return <Video className="w-5 h-5" />;
    case 'Languages': return <Languages className="w-5 h-5" />;
    case 'Linkedin': return <LinkedinIcon className="w-5 h-5" />;
    case 'FileText': return <FileText className="w-5 h-5" />;
    case 'Search': return <Search className="w-5 h-5" />;
    case 'Code': return <Code className="w-5 h-5" />;
    case 'RefreshCw': return <RefreshCw className="w-5 h-5" />;
    case 'ShieldAlert': return <ShieldAlert className="w-5 h-5" />;
    case 'BarChart3': return <BarChart3 className="w-5 h-5" />;
    case 'Smile': return <Smile className="w-5 h-5" />;
    case 'Briefcase': return <Briefcase className="w-5 h-5" />;
    case 'Send': return <Send className="w-5 h-5" />;
    case 'Repeat': return <Repeat className="w-5 h-5" />;
    case 'GitFork': return <GitFork className="w-5 h-5" />;
    case 'Globe': return <Globe className="w-5 h-5" />;
    case 'Headphones': return <Headphones className="w-5 h-5" />;
    case 'BookOpen': return <BookOpen className="w-5 h-5" />;
    case 'Palette': return <Palette className="w-5 h-5" />;
    case 'ShieldCheck': return <ShieldCheck className="w-5 h-5" />;
    case 'FileCode': return <FileCode className="w-5 h-5" />;
    case 'CheckCircle2': return <CheckCircle2 className="w-5 h-5" />;
    default: return <Layers className="w-5 h-5" />;
  }
};

export function TemplatesModal({ isOpen, onClose, onApplyTemplate, onSelectTemplate }: TemplatesModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedComplexity, setSelectedComplexity] = useState<string>('all');

  const handleApply = (template: WorkflowTemplate) => {
    if (onApplyTemplate) {
      onApplyTemplate(template);
    } else if (onSelectTemplate) {
      onSelectTemplate(template);
    }
    onClose();
  };

  const filteredTemplates = useMemo(() => {
    return WORKFLOW_TEMPLATES.filter((tpl) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = 
        !query ||
        tpl.title.toLowerCase().includes(query) ||
        tpl.description.toLowerCase().includes(query) ||
        tpl.tags.some(t => t.toLowerCase().includes(query)) ||
        tpl.pipelinePreview.some(p => p.toLowerCase().includes(query));
      
      const matchesCategory = selectedCategory === 'all' || tpl.category === selectedCategory;
      const matchesComplexity = selectedComplexity === 'all' || tpl.complexity === selectedComplexity;

      return matchesSearch && matchesCategory && matchesComplexity;
    });
  }, [searchQuery, selectedCategory, selectedComplexity]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn" dir="rtl">
      <div className="relative w-full max-w-6xl h-[88vh] bg-[#0C0F17]/95 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-lg shadow-indigo-500/20 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">مكتبة القوالب الجاهزة</h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  {WORKFLOW_TEMPLATES.length} قالب جاهز
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">اختر مسار عمل متكامل ومجرب لتشغيله أو تعديله بضغطة زر واحدة</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-6 py-3 border-b border-white/[0.06] bg-black/20 flex flex-wrap items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[260px] max-w-md">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن قالب، تقنية، أو كلمة مفتاحية..."
              className="w-full pl-12 pr-10 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.08] transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-white/10"
              >
                مسح
              </button>
            )}
          </div>

          {/* Complexity Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>المستوى:</span>
            {['all', 'مبتدئ', 'متوسط', 'متقدم'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedComplexity(lvl)}
                className={`px-2.5 py-1 rounded-lg transition-all text-xs ${
                  selectedComplexity === lvl 
                    ? 'bg-indigo-600 text-white font-medium shadow-sm' 
                    : 'bg-white/[0.04] text-slate-400 hover:text-slate-200 hover:bg-white/[0.08]'
                }`}
              >
                {lvl === 'all' ? 'الكل' : lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="px-6 py-2.5 border-b border-white/[0.06] bg-black/10 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat) => {
            const count = cat.id === 'all' 
              ? WORKFLOW_TEMPLATES.length 
              : WORKFLOW_TEMPLATES.filter(t => t.category === cat.id).length;
            
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-white/15 text-white font-semibold border border-white/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Templates Grid Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {filteredTemplates.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-500 mb-3">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-semibold text-slate-300">لم يتم العثور على قوالب مطابقة</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">جرب البحث بكلمات أخرى أو اختر فئة مختلفة من الشريط العلوي.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedComplexity('all');
                }}
                className="mt-4 px-3 py-1.5 rounded-xl bg-white/10 text-xs text-white hover:bg-white/20 transition"
              >
                إعادة ضبط الفلاتر
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <div 
                  key={template.id}
                  className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-indigo-500/40 hover:bg-white/[0.05] hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-200"
                >
                  {/* Top Row */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${template.color} text-white shadow-md group-hover:scale-105 transition-transform`}>
                        {getTemplateIcon(template.icon)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/10 font-mono">
                          {template.nodeCount} عقد
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                          template.complexity === 'مبتدئ' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : template.complexity === 'متوسط'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {template.complexity}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {template.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {template.description}
                    </p>

                    {/* Pipeline Sequence Pills */}
                    <div className="mt-3.5 p-2 rounded-xl bg-black/30 border border-white/[0.04]">
                      <div className="text-[10px] text-slate-500 mb-1.5 flex items-center gap-1 font-medium">
                        <span>مسار التدفق:</span>
                      </div>
                      <div className="flex items-center gap-1 flex-wrap">
                        {template.pipelinePreview.map((step, idx) => (
                          <React.Fragment key={idx}>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-300 whitespace-nowrap">
                              {step}
                            </span>
                            {idx < template.pipelinePreview.length - 1 && (
                              <span className="text-slate-600 text-[10px]">←</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-3">
                      {template.tags.map((tag, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.03] text-slate-400 border border-white/[0.05]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Apply Button */}
                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">جاهز للتطبيق</span>
                    <button
                      type="button"
                      onClick={() => handleApply(template)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span>تطبيق القالب</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/[0.08] bg-black/30 flex items-center justify-between text-xs text-slate-400">
          <span>💡 يمكنك أيضاً حفظ مسارات العمل الخاصة بك واستعادتها من قائمة &quot;مساحات العمل&quot; في الشريط العلوي.</span>
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/10 text-slate-300 transition-colors"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
}

export default TemplatesModal;
