'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FolderKanban,
  X,
  Plus,
  Trash2,
  Calendar,
  Layers,
  ArrowUpRight,
  Download,
  Upload,
  Check,
  HardDrive,
  RefreshCw,
  Search,
  Sparkles,
  Lock,
} from 'lucide-react';
import {
  LocalWorkflow,
  getLocalWorkflows,
  saveLocalWorkflow,
  deleteLocalWorkflow,
  exportWorkflowToFile,
  importWorkflowFromFile,
} from '@/utils/localWorkflowStorage';

interface WorkspacesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNodes: any[];
  currentEdges: any[];
  onLoadWorkspace: (nodes: any[], edges: any[], name: string, id?: string) => void;
}

export const WorkspacesModal: React.FC<WorkspacesModalProps> = ({
  isOpen,
  onClose,
  currentNodes,
  currentEdges,
  onLoadWorkspace,
}) => {
  const [workspaces, setWorkspaces] = useState<LocalWorkflow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadLocalWorkspaces = () => {
    const list = getLocalWorkflows();
    setWorkspaces(list);
  };

  useEffect(() => {
    if (isOpen) {
      loadLocalWorkspaces();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveCurrent = () => {
    if (!newTitle.trim()) return;
    saveLocalWorkflow({
      name: newTitle.trim(),
      nodes: currentNodes,
      edges: currentEdges,
    });
    setNewTitle('');
    setIsCreating(false);
    loadLocalWorkspaces();
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا المسار من الذاكرة المحلية؟')) {
      deleteLocalWorkflow(id);
      loadLocalWorkspaces();
    }
  };

  const handleExport = (wf: LocalWorkflow, e: React.MouseEvent) => {
    e.stopPropagation();
    exportWorkflowToFile({
      name: wf.name,
      nodes: wf.nodes,
      edges: wf.edges,
    });
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importWorkflowFromFile(file);
      const saved = saveLocalWorkflow({
        name: imported.name,
        nodes: imported.nodes,
        edges: imported.edges,
      });
      loadLocalWorkspaces();
      const savedName = saved.name || saved.title || 'مسار عمل';
      onLoadWorkspace(saved.nodes, saved.edges, savedName, saved.id);
      onClose();
    } catch (err: any) {
      alert(err.message || 'فشل استيراد الملف');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filteredWorkspaces = workspaces.filter((wf) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = (wf.name || wf.title || '').toLowerCase();
    return name.includes(q);
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      dir="rtl"
    >
      <div
        className="w-full max-w-3xl backdrop-blur-2xl bg-[#0F1117]/95 border border-white/10 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[85vh] font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  مساحات العمل المحلية (Local Workflows)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  <span>محفوظة في متصفحك</span>
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                إدارة وحفظ مسارات العمل على جهازك مع إمكانية التصدير والاستيراد الفوري بصيغة JSON.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar: Search & Action Buttons */}
        <div className="p-4 bg-zinc-900/50 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث في المسارات المحفوظة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pr-9 pl-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Import JSON button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition"
            >
              <Upload className="w-3.5 h-3.5 text-sky-400" />
              <span>استيراد JSON</span>
            </button>

            {/* Save current canvas as new workspace */}
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition active:scale-98"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>حفظ المسار الحالي</span>
            </button>
          </div>
        </div>

        {/* Create Workspace Inline Card */}
        {isCreating && (
          <div className="p-4 bg-indigo-950/20 border-b border-indigo-500/20 flex items-center gap-3 animate-in fade-in duration-150">
            <input
              type="text"
              placeholder="اسم مسار العمل الجديد..."
              value={newTitle}
              autoFocus
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveCurrent();
                if (e.key === 'Escape') setIsCreating(false);
              }}
              className="flex-1 bg-zinc-900 border border-indigo-500/40 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSaveCurrent}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
            >
              حفظ
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-2 rounded-xl text-zinc-400 hover:text-white text-xs transition"
            >
              إلغاء
            </button>
          </div>
        )}

        {/* Workspaces List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredWorkspaces.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700/80 flex items-center justify-center mx-auto text-zinc-500">
                <HardDrive className="w-6 h-6" />
              </div>
              <p className="text-xs text-zinc-400">
                {searchQuery
                  ? 'لا توجد نتائج مطابقة لبحثك'
                  : 'لم تقم بحفظ أي مسار عمل محلياً بعد. احفظ مسارك الحالي أو استورد ملف JSON!'}
              </p>
            </div>
          ) : (
            filteredWorkspaces.map((wf) => {
              const displayName = wf.name || wf.title || 'مسار عمل';
              const updatedDate = new Date(wf.updatedAt || Date.now()).toLocaleDateString('ar-EG');
              return (
                <div
                  key={wf.id}
                  onClick={() => {
                    onLoadWorkspace(wf.nodes, wf.edges, displayName, wf.id);
                    onClose();
                  }}
                  className="group p-3.5 rounded-2xl bg-zinc-900/50 hover:bg-zinc-800/60 border border-white/[0.06] hover:border-indigo-500/40 transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition">
                      <FolderKanban className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white group-hover:text-indigo-300 transition">
                        {displayName}
                      </h3>
                      <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3 text-zinc-500" />
                          <span>{wf.nodeCount} عقدة</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono text-[10px]">
                          <Calendar className="w-3 h-3 text-zinc-500" />
                          <span>{updatedDate}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={(e) => handleExport(wf, e)}
                    className="p-2 rounded-xl text-zinc-400 hover:text-sky-300 hover:bg-sky-500/10 transition"
                    title="تنزيل كملف JSON"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(wf.id, e)}
                    className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="حذف المسار"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="px-2.5 py-1 rounded-xl bg-indigo-500/10 text-indigo-300 text-xs font-semibold group-hover:bg-indigo-600 group-hover:text-white transition flex items-center gap-1">
                    <span>فتح</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            );
          })
        )}
        </div>
      </div>
    </div>
  );
};
