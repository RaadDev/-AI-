import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PF Studio — Visual AI Workflow & Prompt Engineering IDE',
  description: 'منصة بصرية متقدمة ومفتوحة المصدر لبناء وتنفيذ سلاسل المطالبات والذكاء الاصطناعي (PF Studio) عبر محرر العقد التفاعلي بنظام محلي مستقل (Local-First).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="dark h-full">
      <body className="h-full bg-[#070a12] text-slate-100 antialiased overflow-hidden">
        {children}
      </body>
    </html>
  );
}
