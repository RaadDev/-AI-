import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, model: requestedModel = 'gpt-4o' } = body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { error: 'يرجى إرسال نص الطلب' },
        { status: 400 }
      );
    }

    const headerOpenai = req.headers.get('x-openai-key');
    const headerGemini = req.headers.get('x-gemini-key');

    const openaiKey = headerOpenai || process.env.OPENAI_API_KEY;
    const geminiKey =
      headerGemini ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    // Check if we have an API key to call the real AI model
    const hasKeys = Boolean(openaiKey || geminiKey);
    if (!hasKeys) {
      // Signal to client to run the local smart fallback matcher
      return NextResponse.json({
        fallback: true,
        message: 'No API key provided, use local smart fallback matcher',
      });
    }

    const systemPrompt = `
You are the Lead Workflow Architect for "PF Studio", a visual node-based prompt chaining platform.
Your task is to analyze ANY user request (in Arabic, English, colloquial slang, or formal dialects) and transform it into a logical, connected workflow pipeline.

SUPPORTED NODE TYPES:
1. "textInput": User input for ideas, raw text, topics, initial parameters.
   data: { label: string, text?: string }
2. "urlScraper": For scraping blogs, web articles, or YouTube video transcript URLs.
   data: { label: string, url?: string }
3. "fileUpload": For file analysis, documents, TXT, CSV, PDF, MD.
   data: { label: string }
4. "webSearch": Real-time web search and live internet news/intelligence.
   data: { label: string, query?: string }
5. "textAI": LLM generation (summaries, blog posts, tweets, marketing copy, translation, analysis).
   data: { label: string, systemPrompt: string (rich Arabic prompt instructions tailored to user request), model: "gpt-4o" | "gemini-1.5-pro" | "claude-3-5-sonnet" }
6. "imageAI": AI image generation (Flux.1, DALL-E 3).
   data: { label: string, imagePrompt?: string, aspectRatio?: "1:1" | "16:9" | "9:16" }
7. "toneRewriter": Rephrase or adapt style/dialect.
   data: { label: string, targetTone: "saudi" | "formal" | "khaleeji" | "story" | "executive", lengthPreference: "concise" | "balanced" | "detailed" }
8. "jsonExtractor": Extract structured data into JSON fields.
   data: { label: string, fields: string (comma-separated), format: "json" }
9. "splitter": Split text or lists into individual items.
   data: { label: string, delimiter: "newline" | "comma" }
10. "batchLoop": Process items iteratively step-by-step.
   data: { label: string }
11. "templateMerge": Merge multiple inputs using a template {{input_1}} and {{input_2}}.
   data: { label: string, template: string }
12. "audioVoice": Text-to-speech commentary, voice-over, podcast reading.
   data: { label: string, voiceRate?: number, voicePitch?: number }
13. "finalResult": Terminal output viewer and export station. EVERY workflow must end with this.
   data: { label: string }

TOPOLOGY RULES:
- The workflow MUST start with an input node (textInput, urlScraper, fileUpload, or webSearch).
- Connect nodes in logical sequential order using "edges" with { id: "e1-2", source: "1", target: "2" }.
- If the user asks for multi-task generation (e.g. blog + tweets), generate parallel textAI nodes and merge them with templateMerge or finalResult.
- If images are needed, add an imageAI node.
- If audio/podcast is requested, add an audioVoice node.
- The pipeline MUST end in a "finalResult" node.
- Write articulate, production-ready Arabic prompts inside the "systemPrompt" of textAI nodes.

CRITICAL: Return ONLY a raw JSON object with this exact structure (NO Markdown fences, NO other words):
{
  "summary": "ملخص باللغة العربية لما تم بناؤه",
  "nodes": [
    {
      "id": "1",
      "type": "textInput",
      "data": {
        "label": "المدخل النصي",
        "text": "..."
      }
    },
    {
      "id": "2",
      "type": "textAI",
      "data": {
        "label": "كتابة المقال",
        "systemPrompt": "...",
        "model": "gpt-4o"
      }
    },
    {
      "id": "3",
      "type": "finalResult",
      "data": {
        "label": "المخرجات النهائية"
      }
    }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2" },
    { "id": "e2-3", "source": "2", "target": "3" }
  ]
}
`.trim();

    let rawOutput = '';
    let providerUsed = '';

    // Try Gemini if geminiKey available
    if (geminiKey && (!openaiKey || requestedModel.startsWith('gemini'))) {
      try {
        const google = createGoogleGenerativeAI({ apiKey: geminiKey });
        const result = await generateText({
          model: google('gemini-1.5-flash'),
          system: systemPrompt,
          prompt: `User Request: "${prompt.trim()}"`,
          temperature: 0.2,
        });
        rawOutput = result.text;
        providerUsed = 'gemini';
      } catch (err: any) {
        console.warn('Gemini workflow generation error:', err.message);
      }
    }

    // Try OpenAI if rawOutput is empty and openaiKey available
    if (!rawOutput && openaiKey) {
      try {
        const openai = createOpenAI({ apiKey: openaiKey });
        const result = await generateText({
          model: openai('gpt-4o-mini'),
          system: systemPrompt,
          prompt: `User Request: "${prompt.trim()}"`,
          temperature: 0.2,
        });
        rawOutput = result.text;
        providerUsed = 'openai';
      } catch (err: any) {
        console.warn('OpenAI workflow generation error:', err.message);
      }
    }

    if (!rawOutput) {
      return NextResponse.json({
        fallback: true,
        message: 'Could not generate with AI models, fallback to smart local matcher',
      });
    }

    // Clean JSON response (strip markdown fences if model included them)
    const cleaned = rawOutput
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    if (!parsed || !Array.isArray(parsed.nodes) || parsed.nodes.length === 0) {
      return NextResponse.json({
        fallback: true,
        message: 'Invalid AI JSON format, fallback to smart local matcher',
      });
    }

    return NextResponse.json({
      success: true,
      provider: providerUsed,
      summary: parsed.summary || 'تم بناء مسار العمل بنجاح عبر الذكاء الاصطناعي ✨',
      nodes: parsed.nodes,
      edges: Array.isArray(parsed.edges) ? parsed.edges : [],
    });
  } catch (err: any) {
    console.error('AI Copilot Route Error:', err);
    return NextResponse.json({
      fallback: true,
      error: err?.message || 'حدث خطأ غير متوقع',
    });
  }
}
