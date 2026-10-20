'use client';

import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + K', desc: 'فتح لوحة الأوامر السريعة (Command Palette)' },
    { key: 'Ctrl + Enter', desc: 'تشغيل مسار العمل بالكامل (Run Workflow)' },
    { key: 'Ctrl + Z', desc: 'تراجع عن آخر خطوة (Undo)' },
    { key: 'Ctrl + Y / Ctrl + Shift + Z', desc: 'إعادة الخطوة المتراجع عنها (Redo)' },
    { key: 'Ctrl + C', desc: 'نسخ العقدة المحددة (Copy Node)' },
    { key: 'Ctrl + V', desc: 'لصق العقدة في موقع الماوس (Paste Node)' },
    { key: 'Ctrl + D', desc: 'مضاعفة العقدة المحددة (Duplicate Node)' },
    { key: 'Delete / Backspace', desc: 'حذف العقدة أو السلك المحدد (Delete)' },
    { key: 'زر الفأرة الأيمن (Right-Click)', desc: 'فتح قائمة الخيارات الذكية (3-Tier Context Menu)' },
    { key: 'Space + سحب الفأرة', desc: 'تحريك الكانفاس بسلاسة (Pan Canvas)' },
    { key: '?', desc: 'إظهار نافذة الاختصارات هذه' },
    { key: 'ESC', desc: 'إغلاق أي نافذة منبثقة أو قائمة' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg backdrop-blur-2xl bg-[#0F1117]/95 border border-white/10 shadow-2xl shadow-black/80 rounded-2xl p-6 font-sans select-none animate-in zoom-in-95 duration-150"
        dir="rtl"
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">اختصارات لوحة المفاتيح</h3>
              <p className="text-xs text-slate-400">تحكم سريع وسلس في الكانفاس كالمحترفين</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/[0.08] text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-2 max-h-96 overflow-y-auto">
          {shortcuts.map((item, idx) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06] transition"
            >
              <span className="text-xs text-slate-300 font-medium">{item.desc}</span>
              <kbd className="font-mono text-[11px] bg-slate-950 text-sky-300 border border-slate-800 px-2 py-1 rounded-lg shadow-inner">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-500">
          💡 اضغط في أي مكان على الكانفاس بالزر الأيمن للحصول على خيارات سريعة إضافية.
        </div>
      </div>
    </div>
  );
};
