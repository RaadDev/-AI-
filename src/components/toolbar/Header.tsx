'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  FolderOpen,
  Download,
  Trash2,
  Sparkles,
  KeyRound,
  RotateCcw,
  CloudUpload,
  Undo2,
  Redo2,
  Target,
  FolderGit2,
  Camera,
  Search,
  HelpCircle,
  ChevronDown,
  Settings,
  Split,
  Smartphone,
  Cpu,
  Square,
  CheckCircle2,
  FlaskConical,
} from 'lucide-react';
import { UserMenu } from './UserMenu';
import { ExecutionMetrics, WorkflowValidationResult } from '@/types/workflow';

interface HeaderProps {
  onRun: () => void;
  onStop?: () => void;
  isRunning: boolean;
  onOpenTemplates: () => void;
  onOpenApiKeys: () => void;
  hasApiKeys: boolean;
  onAutoLayout: (direction?: 'TB' | 'LR') => void;
  onResetDefault: () => void;
  onClear: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  nodeCount: number;
  edgeCount: number;
  saveStatus?: 'saved' | 'saving' | 'idle' | 'cloud-saving' | 'cloud-saved';
  isCloudSync?: boolean;
  onManualSave?: () => void;
  metrics?: ExecutionMetrics;
  validationResult?: WorkflowValidationResult;
  onOpenDiagnostics?: () => void;
  onOpenTestingLab?: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
  onRedo?: () => void;
  canRedo?: boolean;
  onOpenBrandVoice?: () => void;
  isBrandVoiceActive?: boolean;
  onOpenWorkspaces?: () => void;
  onOpenCommandPalette?: () => void;
  onExportPng?: () => void;
  onOpenSettings?: () => void;
  onOpenABTester?: () => void;
  onOpenAppMode?: () => void;
  onOpenModelsHub?: () => void;
  onOpenShortcuts?: () => void;
  onOpenPricing?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onRun,
  onStop,
  isRunning,
  onOpenTemplates,
  onOpenApiKeys,
  hasApiKeys,
  onAutoLayout,
  onResetDefault,
  onClear,
  onExport,
  onImport,
  nodeCount,
  edgeCount,
  saveStatus = 'saved',
  isCloudSync = false,
  onManualSave,
  metrics,
  validationResult,
  onOpenDiagnostics,
  onOpenTestingLab,
  onUndo,
  canUndo = false,
  onRedo,
  canRedo = false,
  onOpenBrandVoice,
  isBrandVoiceActive = false,
  onOpenWorkspaces,
  onOpenCommandPalette,
  onExportPng,
  onOpenSettings,
  onOpenABTester,
  onOpenAppMode,
  onOpenModelsHub,
  onOpenShortcuts,
  onOpenPricing,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workspacesMenuRef = useRef<HTMLDivElement>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);

  const [isWorkspacesOpen, setIsWorkspacesOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        workspacesMenuRef.current &&
        !workspacesMenuRef.current.contains(target)
      ) {
        setIsWorkspacesOpen(false);
      }
      if (
        toolsMenuRef.current &&
        !toolsMenuRef.current.contains(target)
      ) {
        setIsToolsOpen(false);
      }
    };

    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <header
      className="h-12 backdrop-blur-xl border-b border-white/[0.08] px-4 flex items-center justify-between z-30 select-none shadow-sm relative transition-colors duration-150 bg-[#0B0D13]/95"
      dir="rtl"
    >
      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onImport}
        accept=".json"
        className="hidden"
      />

      {/* ============================================================ */}
      {/* 1. ZONE RIGHT (اليمين): Logo + Name + Workspace + Save Status */}
      {/* ============================================================ */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-200 font-bold text-[11px] tracking-tight shrink-0">
            PF
          </div>
          <span className="text-xs font-semibold text-zinc-100 tracking-tight whitespace-nowrap">
            PF Studio
          </span>
          <span className="text-[10px] text-zinc-600 font-mono">/</span>
        </div>

        {/* Workspace / Templates Selector Dropdown */}
        <div className="relative" ref={workspacesMenuRef}>
          <button
            type="button"
            onClick={() => setIsWorkspacesOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-zinc-800/60 text-zinc-300 hover:text-white text-xs font-medium whitespace-nowrap transition"
          >
            <span>المسار الرئيسي</span>
            <ChevronDown
              className={`w-3 h-3 text-zinc-500 transition-transform duration-150 ${
                isWorkspacesOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isWorkspacesOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-52 backdrop-blur-2xl bg-[#0F1117] border border-zinc-800 shadow-2xl rounded-xl p-1 z-50 text-xs text-zinc-200 animate-in fade-in duration-100 select-none">
              {onOpenWorkspaces && (
                <button
                  type="button"
                  onClick={() => {
                    setIsWorkspacesOpen(false);
                    onOpenWorkspaces();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-right text-zinc-300 hover:text-white transition whitespace-nowrap"
                >
                  <FolderGit2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>مساحات العمل المحفوظة</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsWorkspacesOpen(false);
                  onOpenTemplates();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-right text-zinc-300 hover:text-white transition whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                <span>مكتبة القوالب الجاهزة</span>
              </button>
            </div>
          )}
        </div>

        {/* Save Local Button */}
        <button
          type="button"
          onClick={onManualSave}
          title="حفظ المخطط محلياً في متصفحك"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 transition text-xs font-medium select-none active:scale-95"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>حفظ محلي</span>
        </button>

        {/* Export JSON Button */}
        <button
          type="button"
          onClick={onExport}
          title="تصدير المسار كملف JSON"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 text-zinc-200 transition text-xs font-medium select-none active:scale-95"
        >
          <Download className="w-3.5 h-3.5 text-sky-400" />
          <span>تصدير JSON</span>
        </button>

        {/* Import JSON Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="استيراد مسار عمل من ملف JSON"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 text-zinc-200 transition text-xs font-medium select-none active:scale-95"
        >
          <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>استيراد مسار</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* 2. ZONE CENTER (الوسط): Unified Run Button + Undo / Redo */}
      {/* ============================================================ */}
      <div className="flex items-center gap-1.5">
        {/* Undo Button */}
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/70 disabled:opacity-20 transition"
          title="تراجع (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>

        {/* Primary Run / Stop Button */}
        {isRunning ? (
          <button
            type="button"
            onClick={onStop}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/25 transition active:scale-95 whitespace-nowrap animate-pulse"
            title="إلغاء التنفيذ فوراً وحفظ الرصيد (Stop)"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span className="font-bold">⏹️ إلغاء التنفيذ</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onRun}
            disabled={nodeCount === 0}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold shadow-sm transition active:scale-95 whitespace-nowrap"
            title="تشغيل السلسلة بالكامل (⌘ Enter)"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>تشغيل</span>
            <kbd className="text-[10px] font-mono bg-indigo-700/60 text-indigo-200 px-1 py-0.2 rounded border border-indigo-400/20">
              ⌘↵
            </kbd>
          </button>
        )}

        {/* Redo Button */}
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/70 disabled:opacity-20 transition"
          title="إعادة (Ctrl+Y)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ============================================================ */}
      {/* 3. ZONE LEFT (اليسار): Search, Tools & Settings, User Profile */}
      {/* ============================================================ */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Quick Search Trigger (⌘K) */}
        {onOpenCommandPalette && (
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition"
            title="البحث والأوامر (Ctrl+K)"
          >
            <Search className="w-3 h-3 text-zinc-400" />
            <span>بحث</span>
            <kbd className="text-[9px] font-mono bg-zinc-800 px-1 py-0.2 rounded text-zinc-400 border border-zinc-700">
              ⌘K
            </kbd>
          </button>
        )}

        {/* Direct API Keys Quick Trigger */}
        <button
          type="button"
          onClick={onOpenApiKeys}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/25 hover:border-indigo-500/40 transition active:scale-95"
          title="مفاتيح ومزودات الذكاء الاصطناعي (API Keys)"
        >
          <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden md:inline">مفاتيح الـ AI</span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              hasApiKeys ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' : 'bg-zinc-600'
            }`}
          />
        </button>

        {/* Consolidated Tools & Settings Dropdown */}
        <div className="relative" ref={toolsMenuRef}>
          <button
            type="button"
            onClick={() => setIsToolsOpen((prev) => !prev)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition"
            title="الأدوات والإعدادات"
          >
            <Settings className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden md:inline">الأدوات</span>
            <ChevronDown
              className={`w-3 h-3 text-zinc-500 transition-transform duration-150 ${
                isToolsOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isToolsOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-56 backdrop-blur-2xl bg-[#0F1117] border border-zinc-800 shadow-2xl rounded-xl p-1 z-50 text-xs text-zinc-200 animate-in fade-in duration-100 select-none">
              {/* API Keys */}
              <button
                type="button"
                onClick={() => {
                  setIsToolsOpen(false);
                  onOpenApiKeys();
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-right text-zinc-300 hover:text-white transition whitespace-nowrap"
              >
                <div className="flex items-center gap-2">
                  <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
                  <span>مفاتيح الـ AI (API Keys)</span>
                </div>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    hasApiKeys ? 'bg-emerald-400' : 'bg-zinc-600'
                  }`}
                />
              </button>

              {/* General Settings */}
              {onOpenSettings && (
                <button
                  type="button"
                  onClick={() => {
                    setIsToolsOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-right text-zinc-300 hover:text-white transition whitespace-nowrap"
                >
                  <Settings className="w-3.5 h-3.5 text-zinc-400" />
                  <span>مركز الإعدادات الشامل</span>
                </button>
              )}

              {/* Testing Lab */}
              {onOpenTestingLab && (
                <button
                  type="button"
                  onClick={() => {
                    setIsToolsOpen(false);
                    onOpenTestingLab();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-right text-zinc-300 hover:text-white transition whitespace-nowrap"
                >
                  <FlaskConical className="w-3.5 h-3.5 text-zinc-400" />
                  <span>معمل الفحص والتقييم 🧪</span>
                </button>
              )}

              {/* A/B Tester */}
              {onOpenABTester && (
                <button
                  type="button"
                  onClick={() => {
                    setIsToolsOpen(false);
                    onOpenABTester();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-right text-zinc-300 hover:text-white transition whitespace-nowrap"
                >
                  <Split className="w-3.5 h-3.5 text-zinc-400" />
                  <span>مقارنة النماذج (A/B Test) ⚖️</span>
                </button>
              )}

              {/* Models Hub */}
              {onOpenModelsHub && (
                <button
                  type="button"
                  onClick={() => {
                    setIsToolsOpen(false);
                    onOpenModelsHub();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-right text-zinc-300 hover:text-white transition whitespace-nowrap"
                >
                  <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                  <span>دليل النماذج (Models Hub)</span>
                </button>
              )}

              {/* Brand Voice */}
              {onOpenBrandVoice && (
                <button
                  type="button"
                  onClick={() => {
                    setIsToolsOpen(false);
                    onOpenBrandVoice();
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-right text-zinc-300 hover:text-white transition whitespace-nowrap"
                >
                  <div className="flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-zinc-400" />
                    <span>هوية البرند وصوت العلامة 🎯</span>
                  </div>
                  {isBrandVoiceActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  )}
                </button>
              )}

              {/* App Mode */}
              {onOpenAppMode && (
                <button
                  type="button"
                  onClick={() => {
                    setIsToolsOpen(false);
                    onOpenAppMode();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-right text-zinc-300 hover:text-white transition whitespace-nowrap"
                >
                  <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
                  <span>تشغيل كنموذج ويب (App Mode)</span>
                </button>
              )}

              <div className="h-px bg-zinc-800 my-1" />

              {/* Export JSON */}
              <button
                type="button"
                onClick={() => {
                  setIsToolsOpen(false);
                  onExport();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-right text-zinc-300 hover:text-white transition whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5 text-zinc-400" />
                <span>تصدير السلسلة (JSON)</span>
              </button>

              {/* Import JSON */}
              <button
                type="button"
                onClick={() => {
                  setIsToolsOpen(false);
                  fileInputRef.current?.click();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-right text-zinc-300 hover:text-white transition whitespace-nowrap"
              >
                <FolderOpen className="w-3.5 h-3.5 text-zinc-400" />
                <span>استيراد مسار عمل (JSON)</span>
              </button>

              {/* Export PNG */}
              {onExportPng && (
                <button
                  type="button"
                  onClick={() => {
                    setIsToolsOpen(false);
                    onExportPng();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-right text-zinc-300 hover:text-white transition whitespace-nowrap"
                >
                  <Camera className="w-3.5 h-3.5 text-zinc-400" />
                  <span>حفظ صورة الكانفاس (PNG)</span>
                </button>
              )}

              {/* Shortcuts */}
              {onOpenShortcuts && (
                <button
                  type="button"
                  onClick={() => {
                    setIsToolsOpen(false);
                    onOpenShortcuts();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-right text-zinc-300 hover:text-white transition whitespace-nowrap"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
                  <span>اختصارات لوحة المفاتيح (?)</span>
                </button>
              )}

              <div className="h-px bg-zinc-800 my-1" />

              {/* Restore Default */}
              <button
                type="button"
                onClick={() => {
                  setIsToolsOpen(false);
                  onResetDefault();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-right text-zinc-400 hover:text-zinc-200 transition whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
                <span>استعادة المسار الافتراضي</span>
              </button>

              {/* Clear Canvas */}
              <button
                type="button"
                onClick={() => {
                  setIsToolsOpen(false);
                  onClear();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-rose-950/30 text-right text-rose-400 transition whitespace-nowrap"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>تفريغ الكانفاس بالكامل</span>
              </button>
            </div>
          )}
        </div>

        {/* User Account / Google Auth & Credits Menu */}
        <UserMenu onOpenPricing={onOpenPricing} />
      </div>
    </header>
  );
};
