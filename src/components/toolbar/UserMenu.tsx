'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  HardDrive,
  Sparkles,
  ChevronDown,
  User,
  Download,
  Trash2,
  Lock,
  Cpu,
} from 'lucide-react';
import { getLocalWorkflows, exportWorkflowToFile } from '@/utils/localWorkflowStorage';
import { calculateStorageUsage } from '@/utils/studioSettings';

interface UserMenuProps {
  onOpenSettings?: () => void;
  onOpenPricing?: () => void;
}

const LOCAL_USER_NAME_KEY = 'pf_studio_local_username';

export const UserMenu: React.FC<UserMenuProps> = ({ onOpenSettings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [userName, setUserName] = useState<string>('مطور PF Studio');
  const [isEditingName, setIsEditingName] = useState(false);
  const [storageUsage, setStorageUsage] = useState<string>('0 KB');
  const [workflowCount, setWorkflowCount] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LOCAL_USER_NAME_KEY);
      if (stored) setUserName(stored);
      setStorageUsage(calculateStorageUsage());
      setWorkflowCount(getLocalWorkflows().length);
    }
  }, [isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveName = (newName: string) => {
    const trimmed = newName.trim() || 'مطور PF Studio';
    setUserName(trimmed);
    localStorage.setItem(LOCAL_USER_NAME_KEY, trimmed);
    setIsEditingName(false);
  };

  const handleExportAll = () => {
    const workflows = getLocalWorkflows();
    if (workflows.length === 0) {
      alert('لا توجد مسارات محفوظة محلياً بعد');
      return;
    }
    const blob = new Blob([JSON.stringify(workflows, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pf_studio_all_workflows_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Privacy Badge Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition shadow-sm shadow-emerald-500/5 select-none active:scale-98"
        title="وضع محلي مستقل 100% — بياناتك ومخططاتك مشفرة ومحفوظة في متصفحك فقط"
      >
        <span className="flex h-2 w-2 relative shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span className="hidden md:inline font-semibold">
          وضع محلي مستقل (خصوصية 100%)
        </span>
        <span className="inline md:hidden font-semibold">محلي 100%</span>
        <ChevronDown className={`w-3.5 h-3.5 text-emerald-400/80 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Local-First Profile Dropdown */}
      {isOpen && (
        <div
          className="absolute left-0 mt-2 w-80 backdrop-blur-2xl bg-[#0F1117]/95 border border-white/10 rounded-2xl shadow-2xl shadow-black/80 p-4 space-y-4 font-sans text-right z-50 animate-in fade-in slide-in-from-top-2 duration-150"
          dir="rtl"
        >
          {/* Header & User Info */}
          <div className="flex items-start justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 via-sky-500/20 to-indigo-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shadow-md">
                <User className="w-5 h-5" />
              </div>
              <div>
                {isEditingName ? (
                  <input
                    type="text"
                    defaultValue={userName}
                    autoFocus
                    onBlur={(e) => handleSaveName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName((e.target as HTMLInputElement).value);
                    }}
                    className="text-xs bg-zinc-900 border border-emerald-500/50 rounded px-2 py-0.5 text-white focus:outline-none w-36"
                  />
                ) : (
                  <div
                    onClick={() => setIsEditingName(true)}
                    className="text-xs font-bold text-white hover:text-emerald-300 transition cursor-pointer flex items-center gap-1.5"
                    title="انقر لتعديل الاسم محلياً"
                  >
                    <span>{userName}</span>
                    <span className="text-[10px] text-zinc-500 font-normal">✎</span>
                  </div>
                )}
                <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>تخزين مشفر محلياً (Zero-Cloud)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Local Stats */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-2.5 space-y-1">
              <span className="text-[10px] text-zinc-400 block">المسارات المحفوظة</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white font-mono">{workflowCount}</span>
                <HardDrive className="w-3.5 h-3.5 text-sky-400" />
              </div>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-2.5 space-y-1">
              <span className="text-[10px] text-zinc-400 block">حجم الذاكرة المستهلكة</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-400 font-mono">{storageUsage}</span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Privacy Guarantee Note */}
          <div className="p-2.5 rounded-xl bg-zinc-900/40 border border-white/[0.06] text-[11px] text-zinc-400 leading-relaxed space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-200 font-medium text-xs">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>خصوصية مطلقة (Local-First):</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              لا يتم إرسال أي مخطط أو فكرة لقواعد بيانات خارجية. كافة أعمالك ومفاتيح الـ API تبقى في متصفحك فقط.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="space-y-1.5 pt-1">
            <button
              type="button"
              onClick={handleExportAll}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-white/[0.06] transition"
            >
              <div className="flex items-center gap-2">
                <Download className="w-3.5 h-3.5 text-sky-400" />
                <span>تصدير نسخة احتياطية كاملة (JSON)</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">.json</span>
            </button>

            {onOpenSettings && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenSettings();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-white/[0.06] transition"
              >
                <div className="flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                  <span>إعدادات النماذج ومفاتيح الـ API</span>
                </div>
                <span className="text-[10px] text-zinc-500">⚙️</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
