# ⚡ PF Studio — Modern Visual AI Workflow Builder & Prompt Engineering IDE

<div align="center">

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)
![Next.js 16](https://img.shields.io/badge/Next.js-16.4-black.svg?style=for-the-badge&logo=next.js)
![React 19](https://img.shields.io/badge/React-19.3-61dafb.svg?style=for-the-badge&logo=react)
![React Flow v12](https://img.shields.io/badge/@xyflow/react-12.12-ff0072.svg?style=for-the-badge)
![Local-First](https://img.shields.io/badge/Architecture-Local--First%20100%25-emerald.svg?style=for-the-badge)
![Privacy](https://img.shields.io/badge/Zero--Cloud-Total%20Privacy-success.svg?style=for-the-badge)

<p align="center">
  <b>A production-ready, node-based visual studio for building, testing, and automating advanced AI prompt chains and multi-model workflows.</b><br>
  Built with a <b>100% Local-First Architecture</b> — Zero Cloud Dependencies, Zero Database Setup, Instant Plug & Play.
</p>

[English Overview](#-english-overview) • [دليل الاستخدام بالعربية](#-دليل-الاستخدام-بالعربية) • [Quick Start](#-quick-start) • [Nodes Catalog](#-complete-20-nodes-catalog) • [Architecture](#-local-first-architecture) • [Templates](#-25-pre-built-workflows)

</div>

---

## 🌟 Highlights

* 🔒 **100% Local-First & Private:** All workflows, nodes, connections, and credentials are saved directly in your browser (`localStorage` / JSON Export). No databases, no external auth servers, no vendor lock-in.
* ⚡ **Zero-Setup Plug & Play:** Clone the repository, run `npm run dev`, and start building workflows immediately without creating Supabase accounts or cloud consoles.
* 🤖 **Multi-Model AI Hub:** Integrated support for **Google Gemini 3.8 Flash** (Default ultra-fast), **Gemini 3.1 Pro Preview**, **Google Imagen 3**, **Meta Llama 3.3 70B via Groq**, **OpenAI GPT-4o**, **Claude 3.5 Sonnet**, and **Flux.1**.
* 🧩 **20 Specialized Visual Nodes:** Covers everything from Raw Text & Web Scraping (including YouTube transcripts) to REST APIs, Conditionals, Batch Loops, JSON Extraction, TTS Audio, and Webhooks.
* 📱 **Instant "App Mode":** Convert complex visual graphs into a clean, standalone web form dashboard for end-users with a single click.
* 🧪 **Testing Lab & A/B Benchmark:** Built-in automated regression test suites with output assertions, plus side-by-side model speed and latency comparisons.
* 🌐 **Bilingual Arabic/English RTL/LTR Engine:** Native Dagre topological auto-layout engine designed specifically for Arabic Right-to-Left (RL) flow as well as Left-to-Right (LR).

---

## 🚀 Quick Start

### Prerequisites
* **Node.js** v20.x or v22.x+
* **npm** / **pnpm** / **yarn**

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/RaadDev/pf-studio.git
cd pf-studio

# Install dependencies
npm install
```

### 2. Configure Environment (Optional but Recommended)
```bash
cp .env.example .env.local
```
Edit `.env.local` and add your Google Gemini API key:
```env
# Get a free API key at: https://aistudio.google.com/app/apikey
GEMINI_API_KEY="your_gemini_api_key_here"
```
*(You can also input your API keys directly inside the Studio Settings modal in your browser — BYOK).*

### 3. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser. The canvas is ready to use immediately!

### 4. Production Build
```bash
npm run build
npm run start
```

---

## 🏛️ Local-First Architecture

PF Studio follows the modern architectural philosophy of leading open-source tools like Excalidraw, ComfyUI, and Draw.io:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        User Browser (Client-Side)                      │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Workflows & State   ◄──►  LocalStorage (Auto-save / Instant Cache)  │
│ 2. Backup & Sharing    ◄──►  Local JSON Files (.json Export/Import)    │
│ 3. API Keys (BYOK)     ◄──►  Encrypted in client browser storage       │
├────────────────────────────────────────────────────────────────────────┤
│                        Local Next.js Backend                           │
├────────────────────────────────────────────────────────────────────────┤
│ 4. Pre-built Templates ◄──►  Static JSON (src/data/sampleWorkflows.ts) │
│ 5. AI Proxy & Scraper  ◄──►  Direct stream to Gemini / OpenAI / Groq   │
│                              (Zero logs, Zero database persistence)    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Complete 20-Nodes Catalog

| # | Node | Category | Functionality | Key Features |
| :-: | :--- | :--- | :--- | :--- |
| **1** | `TextInputNode` | 📥 Inputs | Raw prompt and parameter input. | Word/character counter, quick preset templates, fast paste. |
| **2** | `WebSearchNode` | 📥 Search | Live web intelligence and search query execution. | Configurable result count, snippet and link extraction. |
| **3** | `FileUploadNode` | 📥 Files | Local document file reader. | Supports `TXT, MD, CSV, JSON, TS, PY`, drag-and-drop. |
| **4** | `UrlScraperNode` | 📥 Scrape | Webpage reader and YouTube transcript scraper. | YouTube video transcript extraction via oEmbed, SSRF protection. |
| **5** | `HttpRequestNode` | 🌐 Network | Live `REST API` execution. | Supports `GET, POST, PUT, DELETE, PATCH`, custom headers, CORS proxy. |
| **6** | `TextAINode` | 🟣 AI & LLM | Streaming text generation with prompt intelligence. | System prompts, model selector, generation history, Magic Wand refiner. |
| **7** | `ToneRewriterNode` | 🟣 AI & Tone | Style and dialect adapter. | Saudi White, Khaleeji, Formal Modern Arabic, Story, Executive, Sales. |
| **8** | `ImageAINode` | 🟣 Vision | High-fidelity 4K/8K AI image synthesis. | Google Imagen 3, Flux.1, DALL-E 3, aspect ratio selection (1:1, 16:9, 9:16). |
| **9** | `StructuredOutputNode` | 🟣 JSON AI | Guaranteed `JSON Schema` enforcement. | Built-in schemas (Lead generation, Summary & Sentiment, Action Items). |
| **10** | `JsonExtractorNode` | ⚙️ Logic | Extracts targeted fields into clean JSON. | Field filtering, syntax highlighting, format validation. |
| **11** | `SplitterNode` | ⚙️ Batch | Splits long text into arrays of items. | Delimiters (Lines `\n`, Paragraphs `\n\n`, Comma, Custom). |
| **12** | `BatchLoopNode` | ⚙️ Flow | Step-by-step sequential item loop iterator. | Step counter, next/previous buttons, iterative execution. |
| **13** | `ConditionalNode` | ⚙️ Control | `If / Else` conditional routing branch. | Contains, word count, length checks with dual outputs (True/False). |
| **14** | `TemplateMergeNode` | ⚙️ Merge | Combines multiple upstream variables into a template. | `{{input_1}}`, `{{input_2}}` reactive auto-sync substitution. |
| **15** | `DelayNode` | ⏱️ Timing | Configurable delay timer before passing flow. | Real-time countdown clock (1s, 2s, 5s, 10s, 30s presets). |
| **16** | `TestAssertionNode` | 🧪 Testing | Automated CI/CD output assertion checker. | Not empty, strict equals, regex match, valid JSON, pass/fail badges. |
| **17** | `NoteNode` | 📝 Docs | Multi-color sticky notes for workflow documentation. | Yellow, Purple, Cyan, Emerald colors, markdown formatting. |
| **18** | `FinalResultNode` | 🟢 Output | Full markdown renderer and media gallery. | Export to Markdown `.md`, PDF/Print, JSON, and PNG canvas snapshot. |
| **19** | `WebhookOutputNode` | 🟢 Webhook | Real-time payload dispatcher. | Zapier, Make, n8n, Slack, Telegram, Discord with instant ping test. |
| **20** | `AudioVoiceNode` | 🔊 Audio | Browser Text-to-Speech (TTS) synthesizer. | Web Speech API with Arabic voice auto-preference, pitch, and rate control. |

---

## 📚 25 Pre-Built Workflows

The studio includes **25 ready-to-run templates** across 7 real-world domains:

1. **Marketing & Ads:** AIDA Campaign + Ad Image, B2B Cold Outreach, Product Launch Strategy, A/B Testing Prompts.
2. **Social Media:** Viral X/Twitter Thread, Short Video Scripts (Reels/TikTok/Shorts), 5-Slide Instagram Carousel, LinkedIn Thought Leadership.
3. **SEO & Content:** Google E-E-A-T Pillar Article, Keyword Clustering, FAQPage Schema JSON-LD, Blog Summarizer.
4. **Business & Analytics:** Executive Meeting Minutes, CSV Data Analysis, Customer Sentiment Analysis, B2B Proposal Builder.
5. **Automation & Logic:** YouTube to Blog & Tweets, Batch Loop Iterator, Conditional Lead Router, Live REST API Fetch & JSON Enrichment, Delay & Webhook Pipeline.
6. **Media & Audio:** Complete Podcast Audio Episode, Storytelling Drama (Script + Voice + Ambient Image).
7. **Dev & Engineering:** OpenAPI / Swagger Docs Generator, Mock Data Generator, Unit Tests Generator (Jest/Vitest/PyTest).

---

## 🗂️ Project Structure

```
pf-studio/
├── .github/
│   └── workflows/ci.yml       # GitHub Actions CI workflow (Build & Type Check)
├── public/                    # Static brand assets and icons
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai-copilot/    # Natural language workflow synthesizer
│   │   │   ├── execute/       # AI execution & proxy router
│   │   │   ├── http-request/  # Safe REST API caller with SSRF protection
│   │   │   ├── scrape/        # Web and YouTube transcript scraper
│   │   │   └── workflows/     # Static templates & local mode handler
│   │   ├── globals.css        # Studio design tokens & themes
│   │   ├── layout.tsx         # Root layout (Clean, zero auth dependencies)
│   │   └── page.tsx           # Main studio canvas container
│   ├── components/
│   │   ├── canvas/            # WorkflowCanvas, ExecutionPanel, AppMode, Dock
│   │   ├── modals/            # AddKeyModal, SettingsModal, TemplatesModal, PromptLibraryModal
│   │   ├── nodes/             # 20 Visual Node components
│   │   └── toolbar/           # Header, UserMenu (Privacy Badge), ABTester, TestingLab
│   ├── config/
│   │   └── models.ts          # AI Models catalog & Single Source of Truth
│   ├── data/
│   │   ├── promptLibrary.ts   # 24+ Curated prompt templates
│   │   └── sampleWorkflows.ts # 25 Pre-built workflow templates
│   ├── engine/
│   │   ├── autoLayout.ts      # Dagre topological RTL/LTR layout
│   │   ├── executionEngine.ts # Topological graph execution & caching
│   │   ├── smartArchitect.ts  # Arabic NLP workflow synthesis
│   │   └── workflowValidator.ts # Cycle detection & graph diagnostics
│   ├── types/
│   │   └── workflow.ts        # TypeScript schemas and definitions
│   └── utils/
│       ├── apiKeys.ts         # Browser localStorage API keys manager
│       ├── localWorkflowStorage.ts # Local workflow storage & JSON import/export
│       ├── security.ts        # Enterprise SSRF validation
│       └── soundEffects.ts    # Web Audio sound effects
├── .env.example               # Clean environment variable template
├── .gitignore                 # Strict secret & build exclusion rules
├── LICENSE                    # MIT License
├── package.json
└── tsconfig.json
```

---

<div dir="rtl">

## 🇸🇦 دليل الاستخدام بالعربية

### ما هو PF Studio؟
**PF Studio** هو بيئة تطوير مرئية مفتوحة المصدر من الجيل التالي مصممة لتمكين المطورين وصناع المحتوى والشركات من بناء وهندسة سلاسل الذكاء الاصطناعي المعقدة وتوصيل الأسلاك بين النماذج والبيانات بسلاسة وسرعة فائقة.

### لماذا يعتبر المشروع محلياً مستقلاً (Local-First) بنسبة 100%؟
* **خصوصية تامة للبيانات:** لا يتم إرسال أي مخطط أو فكرة أو برومبت لأي خوادم خارجية أو قواعد بيانات سحابية.
* **تشغيل فوري (Zero-Setup):** يستطيع أي شخص في العالم استنساخ المستودع (`git clone`) وكتابة `npm run dev` ليبدأ الكانفاس فوراً بدون الحاجة لإنشاء حسابات في Supabase أو إعداد Google Cloud Console.
* **تصدير واستيراد مرن:** حفظ ومشاركة مسارات العمل بنقرة واحدة كملفات `JSON` مستقلة، أو أخذ لقطة عالية الدقة للكانفاس كصورة `PNG`.

### خطوات الاستخدام المحلي السريع:
```bash
# 1. استنساخ المستودع
git clone https://github.com/RaadDev/pf-studio.git
cd pf-studio

# 2. تثبيت الحزم
npm install

# 3. نسخ ملف المتغيرات البيئية (اختياري)
cp .env.example .env.local

# 4. تشغيل خادم التطوير
npm run dev
```

### اختصارات لوحة المفاتيح:
* `Ctrl + Enter`: تشغيل مسار العمل بالكامل.
* `Ctrl + K`: فتح لوحة الأوامر السريعة (Command Palette).
* `Ctrl + Z`: تراجع عن آخر خطوة (Undo).
* `Ctrl + Y` أو `Ctrl + Shift + Z`: إعادة الخطوة السابقة (Redo).
* `Ctrl + C` / `Ctrl + V`: نسخ ولصق العقدة المحددة.
* `Delete` أو `Backspace`: حذف العقدة أو السلك المحدد.
* `زر الفأرة الأيمن`: فتح القائمة السياقية الذكية (Context Menu).
* `Space + سحب`: تحريك الكانفاس بحرية.

</div>

---

## 🛡️ Security & Privacy

* **Zero Cloud Data Leakage:** Workflows and custom prompts are stored strictly in client-side browser storage.
* **Enterprise SSRF Protection:** The internal HTTP and scraping proxies strictly block private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), localhost (`127.0.0.1`, `::1`), and cloud metadata IP ranges (`169.254.169.254`).

---

## 📄 License

This project is open-source and released under the **[MIT License](LICENSE)**. Feel free to use, modify, distribute, and integrate it into your own applications.