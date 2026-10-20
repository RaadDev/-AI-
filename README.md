# ⚡ PF Studio — Visual AI Workflow Builder & Prompt Engineering IDE

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.4-black.svg?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19.3-61dafb.svg?style=for-the-badge&logo=react)](https://react.dev)
[![React Flow v12](https://img.shields.io/badge/@xyflow/react-12.12-ff0072.svg?style=for-the-badge)](https://reactflow.dev)
[![Architecture: 100% Local-First](https://img.shields.io/badge/Architecture-Local--First%20100%25-059669.svg?style=for-the-badge)](#-local-first-architecture)
[![Zero-Cloud Privacy](https://img.shields.io/badge/Zero--Cloud-Total%20Privacy-success.svg?style=for-the-badge)](#-local-first-architecture)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.0-3178c6.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](https://github.com/RaadDev/pf-studio/pulls)

<br/>

<p align="center">
  <b>The open-source visual IDE for designing, chaining, executing, and automating production-grade AI prompt pipelines.</b><br/>
  Engineered with a <b>100% Local-First Architecture</b> — Zero Cloud Databases, Zero Mandatory Logins, Instant Plug & Play.
</p>

<p align="center">
  <a href="#-quick-start"><b>🚀 Quick Start</b></a> •
  <a href="#-key-capabilities"><b>✨ Key Capabilities</b></a> •
  <a href="#-local-first-architecture"><b>🏛️ Architecture</b></a> •
  <a href="#-complete-20-nodes-catalog"><b>🧩 20 Nodes Catalog</b></a> •
  <a href="#-supported-ai-models-matrix"><b>🧠 Models Matrix</b></a> •
  <a href="#-دليل-الاستخدام-والتوثيق-الشامل-بالعربية"><b>🇸🇦 الدليل بالعربية</b></a> •
  <a href="#-developer-guide-create-a-custom-node"><b>🛠️ Developer Guide</b></a> •
  <a href="#-frequently-asked-questions-faq"><b>❓ FAQ</b></a>
</p>

</div>

---

> [!NOTE]
> **Total Privacy Guaranteed:** All workflows, prompts, credentials, and outputs reside exclusively inside your browser's `localStorage` and local JSON exports. No database setup, no account creation, and no cloud vendor lock-in.

---

## ✨ Key Capabilities

| Capability | Technical Highlight | Value Proposition |
| :--- | :--- | :--- |
| 🔒 **100% Local-First** | `localStorage` + Pure JSON Exporter | Zero tracking, zero cloud database costs, total workflow ownership. |
| ⚡ **Instant Plug & Play** | `git clone` ➔ `npm run dev` | Up and running in under 60 seconds with zero backend provisioning. |
| 🤖 **Multi-Provider Hub** | Gemini 3.8 Flash, Imagen 3, Groq Llama 3.3, GPT-4o, Claude 3.5 | Mix and match text, vision, and code models in a single visual canvas. |
| 🧩 **20 Modular Nodes** | Full DAG input, logic, AI, testing, and HTTP nodes | Build sophisticated, production-grade automated prompt chains. |
| 📱 **Instant "App Mode"** | 1-Click Form & Output Web Interface | Transform complex node graphs into clean web apps for non-technical users. |
| 🧪 **Regression Test Lab** | Assertion Runner (Regex, JSON, Strict Match) | Continuously test and benchmark model latency and deterministic outputs. |
| 🌐 **Native RTL & LTR** | Dagre Auto-Layout with Arabic RTL priority | Optimized visual hierarchy for both Arabic and English workflows. |
| 🛡️ **SSRF Guardrails** | Private IP, localhost, and metadata blocker | Enterprise-grade network defense on all HTTP scraping and webhook nodes. |
| 📊 **5-Tab Observability** | Logs, Outputs, Diagnostics, Inputs, Latency | Full real-time execution telemetry right beneath the visual canvas. |

---

## 🏛️ Visual Studio Interface Layout

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [PF] PF Studio / [المسار الرئيسي ▼]   [💾 حفظ محلي] [📥 تصدير JSON] [📤 استيراد مسار]  │  ◄── Header & Storage
├────────────────────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐              │
│ │  TextInput   │──►│   TextAI     │──►│ ToneRewriter │──►│ FinalResult  │              │  ◄── Visual Canvas
│ │ (Raw Topic)  │   │(Gemini Flash)│   │ (Saudi Voice)│   │ (MD Preview) │              │      (React Flow v12)
│ └──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘              │
│                                                                                        │
│                                [ ✨ اسأل مهندس المسارات الذكي... ]                     │  ◄── Copilot Ask Bar
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [📊 السجلات (Logs)]  [📄 المخرجات (Outputs)]  [🩺 التشخيص]  [📥 المدخلات]  [⏱️ الأداء]  │  ◄── 5-Tab Console
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
* **Node.js** v20.x or v22.x+
* **npm**, **pnpm**, or **yarn**

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
Edit `.env.local` to provide your Google Gemini API key:
```env
# Get your free key at: https://aistudio.google.com/app/apikey
GEMINI_API_KEY="your_gemini_api_key_here"
```
*(You can also configure API keys directly inside the Studio in your browser via the **Keys 🔑** modal).*

### 3. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser. The canvas is ready immediately!

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 🏛️ Local-First Architecture

PF Studio is designed following the architectural principles of **Excalidraw**, **ComfyUI**, and **Draw.io**:

```mermaid
graph TD
    subgraph Browser ["Client Browser (100% Private Execution & Storage)"]
        UI["Visual Canvas (React Flow v12)"]
        Storage["Browser Storage (localStorage)"]
        Exporter["File System (.json Export / Import)"]
        Keys["Client-Side BYOK Encrypted Keys"]
        
        UI <--> Storage
        UI <--> Exporter
        UI <--> Keys
    end

    subgraph Server ["Next.js Lightweight Proxy Engine"]
        StaticData["Static Templates (src/data/sampleWorkflows.ts)"]
        ProxyRouter["AI Streaming Proxy (/api/execute)"]
        SSRF["SSRF Guardrail Validator (/utils/security.ts)"]
    end

    subgraph Providers ["Direct External AI APIs"]
        Gemini["Google Gemini (Flash / Pro / Imagen 3)"]
        Groq["Groq Cloud LPUs (Llama 3.3 70B)"]
        OpenAI["OpenAI (GPT-4o / DALL-E 3)"]
        Anthropic["Anthropic (Claude 3.5 Sonnet)"]
    end

    UI --> ProxyRouter
    ProxyRouter --> SSRF
    SSRF --> Providers
    UI --> StaticData
```

---

## 📁 Project Structure

```text
pf-studio/
├── src/
│   ├── app/                         # Next.js 16 App Router
│   │   ├── api/execute/route.ts     # High-performance AI Streaming & Execution Proxy
│   │   ├── api/workflows/route.ts   # Static workflow template endpoints
│   │   ├── layout.tsx               # Root layout, Google Fonts & theme providers
│   │   └── page.tsx                 # Main Studio Entry Point
│   ├── components/
│   │   ├── canvas/                  # React Flow Canvas, Minimap & Custom Controls
│   │   ├── nodes/                   # 20 Specialized Visual Workflow Nodes
│   │   │   ├── NodeContainer.tsx    # Unified card layout, handles, and status badges
│   │   │   ├── TextAINode.tsx       # Core LLM node with streaming & magic wand
│   │   │   ├── ToneRewriterNode.tsx # Dialect and voice adapter (Saudi, Khaleeji, etc.)
│   │   │   ├── ImageAINode.tsx      # Imagen 3 & Flux image generator
│   │   │   └── ...                  # 16 other modular node components
│   │   ├── modals/                  # Settings, Templates, Keyboard Shortcuts, App Mode
│   │   ├── testing/                 # Regression Testing Lab & A/B Assertion Matrix
│   │   └── toolbar/                 # Header, Node Library, Output Console, User Badge
│   ├── engine/
│   │   └── executionEngine.ts       # Topological sorting (DAG) & Node execution engine
│   ├── data/
│   │   └── sampleWorkflows.ts       # 25 Pre-built Production Workflow Templates
│   ├── types/
│   │   └── workflow.ts              # Core TypeScript interfaces & state schemas
│   └── utils/
│       ├── localWorkflowStorage.ts  # Local-first localStorage & JSON file manager
│       ├── security.ts              # SSRF guardrails & private IP address blocker
│       ├── dagreLayout.ts           # Native RTL & LTR topological auto-layout
│       └── tts.ts                   # Web Speech API Arabic voice synthesizer
├── public/                          # Static assets, branding, and icons
├── AGENTS.md                        # AI Agent architectural invariants & guidelines
├── LICENSE                          # MIT License (Copyright 2026 RaadDev)
├── .env.example                     # Sample environment variable template
├── package.json                     # Project manifest and script commands
└── tailwind.config.ts               # Custom color tokens and design system
```

---

## 🧩 Complete 20-Nodes Catalog

PF Studio ships with **20 modular nodes** organized across 5 functional domains:

### 📥 1. Input & Data Acquisition
| Node | Category | Functionality | Key Features |
| :--- | :--- | :--- | :--- |
| **`TextInputNode`** | Input | Entry point for raw prompts and seed data. | Word/character counters, quick presets (Code, Marketing, JSON), paste button. |
| **`WebSearchNode`** | Input | Live internet search intelligence gathering. | Engine selector, result count limits, URL & snippet extraction. |
| **`FileUploadNode`** | Input | In-browser document loader (`TXT`, `MD`, `CSV`, `JSON`, `PY`). | Drag-and-drop file inspection with byte-accurate size metrics. |
| **`UrlScraperNode`** | Input | Web scraper & **YouTube Transcript Extractor**. | Cheerio HTML cleaner, video oEmbed transcript parsing, SSRF shielded. |

### 🟣 2. AI Intelligence & Generation
| Node | Category | Functionality | Key Features |
| :--- | :--- | :--- | :--- |
| **`TextAINode`** | AI Text | Core multi-provider LLM generation node. | Real-time streaming, prompt presets, AI Magic Wand, temperature slider. |
| **`ToneRewriterNode`** | AI Voice | Dialect and brand voice adapter. | Saudi White (`سعودية بيضاء`), Khaleeji, Formal Arabic, Storytelling, Sales. |
| **`ImageAINode`** | AI Vision | High-resolution digital imagery synthesis. | Google Imagen 3, Flux.1 Schnell/Pro, DALL-E 3 with aspect ratio controls. |
| **`StructuredOutputNode`** | AI JSON | Strict `JSON Schema` conformity validator. | Enforces deterministic, machine-readable output objects. |

### ⚙️ 3. Logic, Batch & Flow Control
| Node | Category | Functionality | Key Features |
| :--- | :--- | :--- | :--- |
| **`JsonExtractorNode`** | Logic | Schema-based structured parser. | Extracts target fields from unstructured text into syntax-highlighted JSON. |
| **`SplitterNode`** | Logic | Dataset and text chunking utility. | Splits by line (`\n`), paragraph (`\n\n`), comma, or custom regex. |
| **`BatchLoopNode`** | Logic | Iterative sequence executor. | Steps through list elements sequentially with index tracking. |
| **`ConditionalNode`** | Logic | Branching router (`If / Else`). | Evaluates substring containment, word counts, or character thresholds. |
| **`TemplateMergeNode`** | Logic | Variable interpolation engine. | Injects upstream outputs using reactive `{{input_1}}` & `{{input_2}}` tags. |
| **`DelayNode`** | Logic | Flow rate regulator. | Interactive countdown timer (1s, 2s, 5s, 10s, 30s) to prevent rate limits. |

### 🧪 4. Testing, Documentation & Media
| Node | Category | Functionality | Key Features |
| :--- | :--- | :--- | :--- |
| **`TestAssertionNode`** | Testing | Automated test condition validator. | Not Empty, Strict Equals, Regex Match, Valid JSON with pass/fail badges. |
| **`NoteNode`** | Docs | Visual canvas sticky notes. | 4 vibrant color themes (Yellow, Purple, Cyan, Emerald) for team notes. |
| **`AudioVoiceNode`** | Audio | Text-to-Speech (TTS) synthesizer. | Web Speech API with automatic Arabic voice detection, speed & pitch modulation. |

### 🟢 5. Outputs & External Integrations
| Node | Category | Functionality | Key Features |
| :--- | :--- | :--- | :--- |
| **`FinalResultNode`** | Output | Presentation Markdown preview. | Image gallery, export to Markdown `.md`, PDF, JSON, and PNG canvas snapshot. |
| **`WebhookOutputNode`** | Output | HTTP automated payload dispatcher. | Sends data to Zapier, Make, n8n, Slack, Discord, Telegram with live ping. |
| **`HttpRequestNode`** | HTTP | Full REST API client. | Executes `GET`, `POST`, `PUT`, `DELETE`, `PATCH` with custom headers & SSRF guard. |

---

## 🧠 Supported AI Models Matrix

| Model | Provider | Category | Speed / Latency | Context Window | Recommended Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Gemini 3.8 Flash** | Google AI | Text / LLM | ⚡ Ultra-fast (~200ms) | 1,000,000 tokens | **Default Model:** Real-time reasoning, summarizing, Arabic content. |
| **Gemini 3.1 Pro** | Google AI | Text / LLM | 🧠 Deep reasoning | 2,000,000 tokens | Complex code architectures, long-form document synthesis. |
| **Google Imagen 3** | Google AI | Vision / Image | 🎨 Balanced (~3s) | 4K Photorealistic | Cinematic commercial advertising and product photography. |
| **Llama 3.3 70B** | Meta / Groq | Text / LLM | ⚡ 250+ tokens/sec | 128,000 tokens | Open-source inference with near-instantaneous generation. |
| **GPT-4o** | OpenAI | Multimodal | 🚀 Fast (~1s) | 128,000 tokens | Flagship cross-modal logic, creative prose, and translation. |
| **GPT-4o Mini** | OpenAI | Text / LLM | ⚡ Ultra-fast (~300ms) | 128,000 tokens | Lightweight parsing, classification, and cost efficiency. |
| **Claude 3.5 Sonnet** | Anthropic | Text / Code | 👑 Balanced | 200,000 tokens | Benchmark leader in software engineering and nuanced analysis. |
| **Flux.1 Schnell** | Black Forest Labs | Vision / Image | ⚡ Instant (~2s) | 1024x1024 HD | Fast concept visualization and accurate English in-image text. |

---

## 📚 25 Pre-Built Workflow Templates

The studio includes **25 ready-to-run templates** across 7 real-world domains:

1. **📣 Marketing & Advertising:** AIDA Ad Copy + Imagen 3 Visual, Cold B2B Outreach Sequences, 3-Phase Product Launch, A/B Testing Campaign Angle Generator.
2. **📱 Social Media & Virality:** Viral X/Twitter 7-Tweet Thread, Short Video Scripts (Reels/TikTok/Shorts), 5-Slide Instagram Educational Carousel, LinkedIn Thought Leadership Article.
3. **🔍 SEO & Content Production:** Google E-E-A-T Pillar Article, Semantic Keyword Clustering, FAQPage Schema JSON-LD Generator, Long-form Webpage Summarizer.
4. **💼 Business Intelligence:** Executive Meeting Minutes & Action Items, CSV Data Analysis & Executive Summary, Customer Feedback Sentiment Analyzer, B2B RFP Proposal Generator.
5. **⚙️ Logic & Autonomous Automation:** YouTube Video to Blog & Social Posts, Batch Loop List Processor, Conditional Lead Qualification Router, REST API Data Fetch & Enrichment, Delay & Webhook Dispatch Pipeline.
6. **🎙️ Media & Audio Storytelling:** Full Audio Podcast Episode (Script + Saudi Tone + Voice), Narrative Audio Drama (Script + Voice + Ambient Cover Image).
7. **💻 Software & Developer Tools:** OpenAPI / Swagger Documentation Generator, Mock JSON Endpoint Data Synthesizer, Unit Tests Generator (Jest/Vitest/PyTest).

---

## 🛠️ Developer Guide: Create a Custom Node

Adding a new node to PF Studio requires only 3 simple steps:

### 1. Define the Node Component (`src/components/nodes/CustomNode.tsx`):
```tsx
'use client';
import React, { memo } from 'react';
import { Handle, NodeProps, useReactFlow } from '@xyflow/react';
import { Sparkles } from 'lucide-react';
import { NodeContainer } from './NodeContainer';
import { WorkflowNodeData } from '@/types/workflow';
import { useHandlePositions } from '@/utils/useHandlePositions';

export const CustomNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as WorkflowNodeData;
  const { updateNodeData } = useReactFlow();
  const { targetPosition, sourcePosition } = useHandlePositions();

  return (
    <div className="relative group">
      <Handle type="target" position={targetPosition} id="input" />
      <NodeContainer
        nodeId={id}
        title={nodeData.label || 'عقدة مخصصة'}
        category="Custom"
        icon={<Sparkles className="w-4 h-4 text-emerald-400" />}
        status={nodeData.status || 'idle'}
        accentColor="emerald"
        selected={selected}
      >
        <p className="text-xs text-zinc-300">محتوى العقدة المخصصة هنا...</p>
      </NodeContainer>
      <Handle type="source" position={sourcePosition} id="output" />
    </div>
  );
});
CustomNode.displayName = 'CustomNode';
```

### 2. Register in `src/components/nodes/index.ts`:
```ts
import { CustomNode } from './CustomNode';

export const nodeTypes = {
  // ... existing nodes
  customNode: CustomNode,
};
```

### 3. Handle in `src/engine/executionEngine.ts`:
Add a case branch inside `runSingleNode()` to execute your node logic and emit outputs downstream!

---

## ⌨️ Complete Keyboard Shortcuts

| Shortcut | Action | Shortcut | Action |
| :--- | :--- | :--- | :--- |
| `Ctrl + Enter` | Run Entire Workflow | `Ctrl + K` | Open Command Palette |
| `Ctrl + Z` | Undo Canvas Change | `Ctrl + Y` / `Ctrl+Shift+Z` | Redo Canvas Change |
| `Ctrl + C` | Copy Selected Node | `Ctrl + V` | Paste Node at Cursor |
| `Ctrl + D` | Duplicate Selected Node | `Delete` / `Backspace` | Delete Node or Edge |
| `Right Click` | 3-Tier Context Menu | `Space + Drag` | Pan Around Canvas |
| `?` | Open Shortcuts Cheatsheet | `ESC` | Close Active Modal |

---

<div dir="rtl">

## 🇸🇦 دليل الاستخدام والتوثيق الشامل بالعربية

### ما هو PF Studio؟
**PF Studio** هو بيئة تطوير وتصميم مرئية متقدمة ومفتوحة المصدر (Visual AI Workflow IDE) تتيح للمطورين، مهندسي الأوامر (Prompt Engineers)، وصناع المحتوى بناء وتصميم واختبار سلاسل ذكاء اصطناعي تفاعلية معقدة برقعة عمل لا نهائية (Infinite Node Canvas).

### لماذا المعمارية المحلية المستقلة (100% Local-First)؟
1. **خصوصية وأمان مطلق:** كافة المسارات، الأوامر، المفاتيح، والنتائج تُحفظ وتُعالج حصرياً داخل متصفح المستخدم عبر `localStorage`. لا توجد قواعد بيانات سحابية مركزية تطلع على بياناتك أو تسجل أنشطتك.
2. **تشغيل فوري (Zero-Setup):** يستطيع أي مبرمج كتابة `git clone` ثم `npm run dev` ليبدأ العمل فوراً دون الحاجة لتسجيل حسابات في Supabase أو إنشاء مشاريع في Google Cloud Console.
3. **تصدير ومشاركة حرة:** إمكانية تنزيل أي مسار عمل كملف `workflow.json` على جهازك ومشاركته مع فريق العمل لفتحه بضغطة زر دون أي ارتباط بأي خادم.

### 🧩 تصنيف العقد العشرين (20 Specialized Nodes)
* **عقد المدخلات:** إدخال نصي (`TextInput`)، بحث حي على الويب (`WebSearch`)، رفع مستندات محلي (`FileUpload`)، سحب محتوى المواقع وتفريغ فيديوهات يوتيوب (`UrlScraper`).
* **عقد الذكاء الاصطناعي:** المعالجة النصية المتقدمة (`TextAI`)، محول اللهجات والأصوات التسويقية (`ToneRewriter`)، توليد الصور (`ImageAI`)، استخراج كائنات JSON صارمة (`StructuredOutput`).
* **عقد المنطق والتحكم:** استخراج البيانات (`JsonExtractor`)، تجزئة النصوص (`Splitter`)، حلقات المعالجة التكرارية (`BatchLoop`)، التفريع الشرطي (`Conditional`)، دمج القوالب (`TemplateMerge`)، ومؤقت الانتظار (`Delay`).
* **عقد الاختبار والتسجيل الصوتي:** فحص وتأكيد الشروط آلياً (`TestAssertion`)، البطاقات التوثيقية الملونة (`Note`)، تحويل النص إلى صوت طبيعي ناطق بالعربية (`AudioVoice`).
* **عقد المخرجات والتكامل:** بطاقة النتيجة النهائية بصيغ متعددة (`FinalResult`)، إرسال خطافات الويب للأنظمة الخارجية (`WebhookOutput`)، وتنفيذ طلبات REST API الحية (`HttpRequest`).

### 📱 ميزة "وضع التطبيق" (App Mode)
بضغطة زر واحدة على أيقونة التطبيق في الشريط العلوي، يتحول المخطط المرئي المعقد إلى **واجهة مستخدم ويب بسيطة للعميل النهائي**:
* جمع كافة عقد الإدخال في بطاقات نموذج أنيقة على اليمين.
* زر تشغيل رئيسي ينفذ السلسلة كاملة في الخلفية.
* عرض النتيجة المكتملة بصيغة Markdown وصور تفاعلية على اليسار دون إظهار أي أسلاك أو عقد تقنية.

### 🧪 معمل الاختبارات والتقييم (Testing Lab)
أداة مدمجة لإنشاء اختبارات انحدار آلية (Regression Test Suites) لمسار العمل:
* تحديد حالات اختبار متعددة بمدخلات مختلفة.
* فحص شروط التحقق التلقائية: (غير فارغ، تطابق تام، احتواء كلمة، تعبير نمطي Regex، كائن JSON صالح).
* تقرير فوري بنسب النجاح وزمن التنفيذ لكل حالة بالمللي ثانية ومقارنة زمن استجابة النماذج.

</div>

---

## ❓ Frequently Asked Questions (FAQ)

<details>
<summary><b>1. Do I need paid API keys to use PF Studio?</b></summary>
No. PF Studio defaults to <b>Google Gemini 3.8 Flash</b> which has a generous free tier directly from Google AI Studio. You can also test and design workflows offline using local input and logic nodes.
</details>

<details>
<summary><b>2. Where are my workflows stored?</b></summary>
All workflows are stored client-side in your browser's <code>localStorage</code>. You can also download them as standalone <code>.json</code> files using the <b>[📥 Export JSON]</b> button and restore them anytime with <b>[📤 Import]</b>.
</details>

<details>
<summary><b>3. How are API keys secured?</b></summary>
API keys entered via the Studio Settings are stored strictly in client-side browser storage and sent via ephemeral request headers directly to the proxy endpoints. They are never written to any database.
</details>

<details>
<summary><b>4. Does PF Studio support running local models (like Ollama)?</b></summary>
Yes. You can route HTTP requests using the <code>HttpRequestNode</code> to <code>http://localhost:11434/api/generate</code> for Ollama or LM Studio endpoints. Native Ollama node support is planned on our roadmap.
</details>

---

## 🗺️ Roadmap

- [x] 100% Local-First Architecture & Zero Cloud Dependencies.
- [x] 20 Modular Nodes & 25 Production-Ready Templates.
- [x] Dagre Native RTL (Arabic) & LTR Auto-Layout.
- [x] Automated Testing Lab with assertion verification.
- [x] Fullscreen Consumer App Mode.
- [ ] Native Ollama & Local LLM node integration.
- [ ] In-browser Vector Database (Chroma / MemoryVectorStore) for local RAG.
- [ ] Export workflow to standalone Python / TypeScript execution scripts.

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**!

1. Fork the Project (`https://github.com/RaadDev/pf-studio/fork`)
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

<div align="center">
  <sub>Built with ❤️ for AI Engineers and Creators worldwide.</sub>
</div>