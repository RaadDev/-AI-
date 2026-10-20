# ⚡ PF Studio

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.4-black.svg?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19.3-61dafb.svg?style=for-the-badge&logo=react)](https://react.dev)
[![React Flow v12](https://img.shields.io/badge/@xyflow/react-12.12-ff0072.svg?style=for-the-badge)](https://reactflow.dev)
[![Local-First](https://img.shields.io/badge/Architecture-Local--First%20100%25-emerald.svg?style=for-the-badge)](#-features)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.0-blue.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)

<p align="center">
  <b>Modern, Minimalist & 100% Local-First Visual AI Workflow Canvas.</b><br>
  Build, chain, and execute multi-modal AI pipelines directly in your browser. Zero cloud logins. Zero tracking. 100% Private.
</p>

[English Overview](#-features) • [دليل الاستخدام بالعربية](#-دليل-الاستخدام-والتوثيق-الشامل-بالعربية) • [Quick Start](#-quick-start) • [Project Structure](#️-project-structure) • [API Keys (BYOK)](#-adding-your-api-keys-byok) • [License](#-license)

</div>

---

## ✨ Features

- 🔒 **Local-First & Private:** Workflows and keys are stored exclusively in your browser's local storage.
- ⚡ **Zero-Setup Required:** No databases, no Docker, and no OAuth setup needed. Just clone and run.
- 🧩 **Visual Node Graph:** Built with React Flow featuring glassmorphic glowing traces and auto-linking.
- 🤖 **Multi-Provider AI:** Built-in support for Google Gemini (Flash & Pro), Imagen 3, Groq (Llama 3.3 70B), OpenAI (GPT-4o), and Anthropic (Claude 3.5 Sonnet).
- 💾 **Portable Workflows:** Export and import complete pipelines with one click as pure `.json` files.
- 📚 **26+ Built-in Templates:** Production-ready prompt chains for marketing, coding, content, and analysis.
- 📱 **Instant App Mode:** Convert complex node pipelines into an elegant client-facing interface with a single click.
- 🧪 **Testing Lab:** Built-in regression testing and output assertion runner (Regex, JSON validation, Equality).

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/RaadDev/pf-studio.git
cd pf-studio
```

### 2. Install dependencies
```bash
npm install
```

### 3. Add your Gemini API Key
Create a `.env.local` file in the root directory:
```env
GEMINI_API_KEY="your-gemini-api-key-here"
```
*(You can get a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey)).*

### 4. Start developing
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🗂️ Project Structure

```text
├── src/
│   ├── app/           # Next.js App Router & lightweight API proxies
│   ├── components/    # Canvas, custom nodes, modals, and dock
│   ├── config/        # Central model registry (models.ts)
│   ├── data/          # Static workflows and prompt templates
│   ├── engine/        # Graph execution runner and topological sort
│   ├── types/         # TypeScript definitions
│   └── utils/         # Local JSON export/import and client storage
├── public/            # Static assets and icons
├── AGENTS.md          # AI Agent development guidelines
├── LICENSE            # MIT License
└── package.json
```

---

## 🔑 Adding Your API Keys (BYOK)

You can use the built-in server key from `.env.local` or provide your personal keys inside the app:
1. Click the **Keys 🔑** icon in the top toolbar.
2. Paste your API key (Google AI Studio, Groq, OpenAI, or Anthropic).
3. Keys are encrypted and saved solely in your browser's `localStorage`.

---

<div dir="rtl">

## 🇸🇦 دليل الاستخدام والتوثيق الشامل بالعربية

### ما هو PF Studio؟
**PF Studio** هو بيئة تطوير مرئية متقدمة ومفتوحة المصدر (Visual AI Workflow Canvas) تتيح للمطورين ومهندسي الأوامر بناء وتنفيذ سلاسل ذكاء اصطناعي تفاعلية معقدة مباشرة في المتصفح.

### لماذا المعمارية المحلية المستقلة (100% Local-First)؟
1. **خصوصية وأمان مطلق:** كافة المسارات، الأوامر، المفاتيح، والنتائج تُحفظ وتُعالج حصرياً داخل متصفح المستخدم عبر `localStorage`. لا توجد أي قواعد بيانات سحابية مركزية تطلع على بياناتك.
2. **تشغيل فوري (Zero-Setup):** يستطيع أي مطور كتابة `git clone` ثم `npm run dev` ليبدأ العمل فوراً دون الحاجة لتسجيل أي حسابات أو قواعد بيانات خارجية.
3. **تصدير ومشاركة حرة:** تنزيل أي مسار عمل كملف `workflow.json` على جهازك واستيراده بضغطة زر.

### 📱 وضع التطبيق (App Mode)
بضغطة زر واحدة على أيقونة التطبيق في الشريط العلوي، يتحول المخطط المرئي المعقد إلى **واجهة مستخدم ويب بسيطة ونظيفة للعميل النهائي** لتشغيل المسار وعرض النتائج فوراً دون إظهار الأسلاك والتعقيدات التقنية.

</div>

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

<div align="center">
  <sub>Built with ❤️ for AI Engineers and Creators worldwide.</sub>
</div>