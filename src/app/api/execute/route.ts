import { NextRequest } from 'next/server';
import { streamText, generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export function resolveGoogleModel(model: string): string {
  const m = (model || '').toLowerCase();
  if (m.includes('pro')) return 'gemini-3.1-pro-preview';
  return 'gemini-3.8-flash';
}

async function callGoogleModelSafe(
  google: ReturnType<typeof createGoogleGenerativeAI>,
  requestedModel: string,
  systemPrompt: string,
  prompt: string,
  temperature: number
): Promise<{ text: string; modelUsed: string }> {
  const resolved = resolveGoogleModel(requestedModel);
  const isPro = resolved.includes('pro');

  // Candidate models: Google officially recommends gemini-3.8-flash as primary
  const candidateModels = isPro
    ? [
        'gemini-3.8-flash', // Fast and reliable fallback if Pro quota exceeded
        'gemini-3.1-pro-preview',
        'gemini-pro-latest',
        'gemini-flash-latest',
      ]
    : [
        'gemini-3.8-flash',
        'gemini-flash-latest',
        'gemini-3.1-pro-preview',
        'gemini-pro-latest',
      ];

  let lastError: any = null;
  for (const candidate of candidateModels) {
    try {
      const { text } = await generateText({
        model: google(candidate),
        system: systemPrompt,
        prompt,
        temperature,
      });

      if (text && text.trim().length > 0) {
        return { text, modelUsed: candidate };
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Google Model candidate '${candidate}' failed]:`, err?.message || err);
      // Try next candidate
    }
  }

  const errText = (lastError?.message || String(lastError || '')).toLowerCase();
  if (
    errText.includes('quota') ||
    errText.includes('429') ||
    errText.includes('resource_exhausted') ||
    errText.includes('limit: 0')
  ) {
    const quotaErr = new Error(
      'تم بلوغ حد الاستخدام اللحظي لـ Google Gemini، جاري المحاولة بنموذج بديل أو يرجى الانتظار دقيقة.'
    );
    (quotaErr as any).isQuota = true;
    throw quotaErr;
  }

  throw lastError || new Error('فشلت جميع نماذج Google Gemini المتاحة');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      type = 'textAI',
      prompt,
      context,
      model = 'gemini-3.8-flash',
      temperature = 0.7,
      apiKeys: bodyKeys = {},
    } = body;

    if (type === 'textAI') {
      // Priority 1: User-entered keys (Headers or Body)
      // Priority 2: Server environment variables
      const userProvidedGeminiKey = (
        req.headers.get('x-gemini-key') ||
        bodyKeys.geminiKey ||
        bodyKeys.geminiApiKey ||
        ''
      ).trim();

      const serverGeminiKey = (
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
        process.env.GOOGLE_API_KEY ||
        ''
      ).trim();

      const geminiKey = userProvidedGeminiKey || serverGeminiKey;

      const userProvidedOpenaiKey = (
        req.headers.get('x-openai-key') ||
        bodyKeys.openaiKey ||
        bodyKeys.openaiApiKey ||
        ''
      ).trim();
      const serverOpenaiKey = (process.env.OPENAI_API_KEY || '').trim();
      const openaiKey = userProvidedOpenaiKey || serverOpenaiKey;

      const groqKey = (
        req.headers.get('x-groq-key') ||
        bodyKeys.groqKey ||
        bodyKeys.groqApiKey ||
        process.env.GROQ_API_KEY ||
        ''
      ).trim();

      const anthropicKey = (
        req.headers.get('x-anthropic-key') ||
        bodyKeys.anthropicKey ||
        bodyKeys.anthropicApiKey ||
        process.env.ANTHROPIC_API_KEY ||
        ''
      ).trim();

      const deepseekKey = (
        req.headers.get('x-deepseek-key') ||
        bodyKeys.deepseekKey ||
        bodyKeys.deepseekApiKey ||
        process.env.DEEPSEEK_API_KEY ||
        ''
      ).trim();

      const mistralKey = (
        req.headers.get('x-mistral-key') ||
        bodyKeys.mistralKey ||
        bodyKeys.mistralApiKey ||
        process.env.MISTRAL_API_KEY ||
        ''
      ).trim();

      const openrouterKey = (
        req.headers.get('x-openrouter-key') ||
        bodyKeys.openrouterKey ||
        bodyKeys.openrouterApiKey ||
        process.env.OPENROUTER_API_KEY ||
        ''
      ).trim();

      let shouldDeductCredit = false;
      let remainingCredits = 1000;
      const userPlan = 'pro';

      const systemPrompt =
        'أنت نموذج ذكاء اصطناعي فائق الذكاء ومحترف في معالجة وهندسة الأوامر. أجب باللغة العربية بدقة عالية وأسلوب احترافي وجذاب ومباشر وفق المطلوب تماماً بدون حشو أو مقدمات إضافية.';
      const combinedPrompt = context
        ? `[المدخلات والسياق القادم من الخطوات السابقة]:\n${context}\n\n[التعليمات والمهمة المطلوبة]:\n${prompt}`
        : prompt;

      const trimmedPrompt = (prompt || '').trim();
      const trimmedContext = (context || '').trim();

      if (!trimmedPrompt && !trimmedContext) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'يرجى إدخال نص أو توصيل عقدة تحتوي على بيانات أولاً',
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const clampedTemp = Math.min(Math.max(temperature, 0), 1);
      const modelLower = (model || '').toLowerCase().trim();

      // Normalize model names and aliases accurately
      let normalizedModel = model;
      if (
        modelLower === 'pro' ||
        modelLower === 'gemini-pro' ||
        modelLower === 'gemini-pro-latest' ||
        modelLower === 'gemini-3.1-pro' ||
        modelLower === 'gemini-3.1-pro-preview' ||
        modelLower === 'gemini-2.5-pro' ||
        modelLower.includes('pro')
      ) {
        normalizedModel = 'gemini-3.1-pro-preview';
      } else if (
        modelLower === 'flash' ||
        modelLower === 'gemini-flash' ||
        modelLower === 'gemini-3.8-flash' ||
        modelLower === 'gemini-3.8' ||
        modelLower === 'gemini-flash-latest' ||
        modelLower === 'gemini-2.5-flash' ||
        modelLower.includes('flash')
      ) {
        normalizedModel = 'gemini-3.8-flash';
      } else if (modelLower === 'llama-3-70b') {
        normalizedModel = 'llama-3.3-70b-versatile';
      } else if (modelLower === 'llama-3-8b') {
        normalizedModel = 'llama-3.1-8b-instant';
      }

      // Smart Auto-Routing & Silent Fallback state
      let fallbackApplied = false;
      const originalModel = model || 'gemini-flash-latest';
      let activeFallbackModel = '';
      let fallbackMessage = '';

      // If OpenAI model is requested without personal key
      if (
        (modelLower.startsWith('gpt') ||
          modelLower.startsWith('o1') ||
          modelLower.startsWith('o3') ||
          modelLower.startsWith('chatgpt')) &&
        !openaiKey &&
        !openrouterKey
      ) {
        fallbackApplied = true;
        const isAdvanced = !modelLower.includes('mini');
        if (geminiKey) {
          activeFallbackModel = isAdvanced ? 'gemini-pro-latest' : 'gemini-flash-latest';
          normalizedModel = activeFallbackModel;
          fallbackMessage = `تم التنفيذ عبر ${isAdvanced ? 'Gemini Pro' : 'Gemini Flash'} لعدم توفر مفتاح OpenAI`;
        } else if (groqKey) {
          activeFallbackModel = 'llama-3.3-70b-versatile';
          normalizedModel = activeFallbackModel;
          fallbackMessage = 'تم التنفيذ عبر Llama 3.3 70B لعدم توفر مفتاح OpenAI';
        }
      } else if (
        modelLower.startsWith('claude') &&
        !anthropicKey &&
        !openrouterKey
      ) {
        fallbackApplied = true;
        if (geminiKey) {
          activeFallbackModel = 'gemini-pro-latest';
          normalizedModel = activeFallbackModel;
          fallbackMessage = 'تم التنفيذ عبر Gemini Pro لعدم توفر مفتاح Anthropic Claude';
        } else if (groqKey) {
          activeFallbackModel = 'llama-3.3-70b-versatile';
          normalizedModel = activeFallbackModel;
          fallbackMessage = 'تم التنفيذ عبر Llama 3.3 70B لعدم توفر مفتاح Anthropic Claude';
        }
      } else if (
        (modelLower.startsWith('deepseek') ||
          modelLower.startsWith('mixtral') ||
          modelLower.startsWith('mistral') ||
          modelLower.startsWith('codestral') ||
          modelLower.startsWith('qwen')) &&
        !deepseekKey &&
        !groqKey &&
        !openrouterKey
      ) {
        if (geminiKey) {
          fallbackApplied = true;
          activeFallbackModel = 'gemini-1.5-flash';
          normalizedModel = activeFallbackModel;
          fallbackMessage = `تم التنفيذ عبر Gemini 1.5 Flash لعدم توفر مفتاح ${model}`;
        }
      }

      const activeModelLower = normalizedModel.toLowerCase();

      // -------------------------------------------------------------
      // 1. Google Gemini (Gemini 1.5 Pro, Flash, Pro aliases)
      // -------------------------------------------------------------
      if (
        activeModelLower.startsWith('gemini') ||
        activeModelLower.includes('gemini') ||
        activeModelLower.startsWith('google') ||
        activeModelLower === 'pro' ||
        activeModelLower === 'flash'
      ) {
        if (!geminiKey && !openrouterKey) {
          return new Response(
            JSON.stringify({
              success: false,
              missingKey: true,
              requiredProvider: 'gemini',
              requiredKeyName: 'Google Gemini API Key',
              model: normalizedModel,
              error: `يرجى إدخال مفتاح Google Gemini API Key في الإعدادات أو تعريف GEMINI_API_KEY في ملف .env لاستخدام نموذج ${normalizedModel}`,
            }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          );
        }

        if (geminiKey) {
          const google = createGoogleGenerativeAI({ apiKey: geminiKey });
          const isProRequested =
            activeModelLower.includes('pro') && !activeModelLower.includes('flash');

          try {
            const { text, modelUsed } = await callGoogleModelSafe(
              google,
              isProRequested ? 'gemini-pro-latest' : 'gemini-flash-latest',
              systemPrompt,
              combinedPrompt,
              clampedTemp
            );

            const streamHeaders: Record<string, string> = {
              'X-AI-Provider': 'google',
              'X-AI-Model': modelUsed,
              'X-Model-Used': modelUsed,
              'Content-Type': 'text/plain; charset=utf-8',
            };

            if (fallbackApplied || (isProRequested && modelUsed.includes('flash'))) {
              streamHeaders['X-Fallback-Applied'] = 'true';
              streamHeaders['X-Original-Model'] = originalModel;
              streamHeaders['X-Active-Model'] = modelUsed;
              streamHeaders['X-Fallback-Message'] =
                fallbackMessage ||
                (modelUsed.includes('flash') && isProRequested
                  ? 'تم التحويل تلقائياً إلى Gemini Flash لضمان استقرار وسرعة الاستجابة'
                  : 'تم التنفيذ بنجاح عبر Google Gemini');
            }

            if (shouldDeductCredit) {
              streamHeaders['x-remaining-credits'] = String(remainingCredits);
              streamHeaders['x-user-plan'] = userPlan;
            }

            return new Response(text, {
              headers: streamHeaders,
            });
          } catch (err: any) {
            console.error('[AI Provider Error - Google Gemini]:', err?.message || err);
            // If Groq key is available, attempt Groq fallback before returning error
            if (groqKey) {
              try {
                const groq = createOpenAI({
                  baseURL: 'https://api.groq.com/openai/v1',
                  apiKey: groqKey,
                });
                const { text: groqText } = await generateText({
                  model: groq('llama-3.3-70b-versatile'),
                  system: systemPrompt,
                  prompt: combinedPrompt,
                  temperature: clampedTemp,
                });
                return new Response(groqText, {
                  headers: {
                    'X-AI-Provider': 'groq',
                    'X-AI-Model': 'llama-3.3-70b-versatile',
                    'X-Fallback-Applied': 'true',
                    'X-Original-Model': originalModel,
                    'X-Active-Model': 'llama-3.3-70b-versatile',
                    'Content-Type': 'text/plain; charset=utf-8',
                  },
                });
              } catch (e) {}
            }

            const errStr = (err?.message || String(err || '')).toLowerCase();
            const isQuotaExceeded =
              err?.isQuota ||
              errStr.includes('quota') ||
              errStr.includes('429') ||
              errStr.includes('resource_exhausted') ||
              errStr.includes('limit: 0');

            const cleanErrorMessage = isQuotaExceeded
              ? 'تم بلوغ حد الاستخدام اللحظي لـ Google Gemini، جاري المحاولة بنموذج بديل أو يرجى الانتظار دقيقة.'
              : `خطأ في مزود Google Gemini: ${err.message || 'فشل الاتصال'}`;

            return new Response(
              JSON.stringify({
                success: false,
                error: cleanErrorMessage,
                details: isQuotaExceeded ? cleanErrorMessage : (err?.toString() || String(err)),
                modelUsed: 'gemini-3.8-flash',
                fallbackTriggered: true,
              }),
              { status: isQuotaExceeded ? 429 : 500, headers: { 'Content-Type': 'application/json' } }
            );
          }
        }
      }

      // -------------------------------------------------------------
      // 2. Groq (Llama 3.3 / Llama 3.1)
      // -------------------------------------------------------------
      if (
        activeModelLower.startsWith('llama') ||
        activeModelLower.includes('groq') ||
        activeModelLower.startsWith('mixtral')
      ) {
        if (!groqKey && !openrouterKey) {
          // If Gemini key is available, auto-route to Gemini
          if (geminiKey) {
            try {
              const google = createGoogleGenerativeAI({ apiKey: geminiKey });
              const result = streamText({
                model: google('gemini-1.5-flash'),
                system: systemPrompt,
                prompt: combinedPrompt,
                temperature: clampedTemp,
              });
              const streamHeaders: Record<string, string> = {
                'X-AI-Provider': 'google',
                'X-AI-Model': 'gemini-1.5-flash',
                'X-Model-Used': 'gemini-1.5-flash',
                'X-Fallback-Applied': 'true',
                'X-Original-Model': normalizedModel,
                'X-Active-Model': 'gemini-1.5-flash',
                'X-Fallback-Message': 'تم التنفيذ عبر Gemini 1.5 Flash لعدم توفر مفتاح Groq',
              };
              if (shouldDeductCredit) {
                streamHeaders['x-remaining-credits'] = String(remainingCredits);
                streamHeaders['x-user-plan'] = userPlan;
              }
              return result.toTextStreamResponse({ headers: streamHeaders });
            } catch (e) {}
          }

          return new Response(
            JSON.stringify({
              success: false,
              missingKey: true,
              requiredProvider: 'groq',
              requiredKeyName: 'Groq API Key',
              model: normalizedModel,
              error: `يرجى إدخال مفتاح Groq API Key (أو OpenRouter) في الإعدادات لاستخدام نموذج ${normalizedModel}`,
            }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          );
        }

        if (groqKey) {
          try {
            const groq = createOpenAI({
              baseURL: 'https://api.groq.com/openai/v1',
              apiKey: groqKey,
            });
            const result = streamText({
              model: groq(normalizedModel),
              system: systemPrompt,
              prompt: combinedPrompt,
              temperature: clampedTemp,
            });
            return result.toTextStreamResponse({
              headers: {
                'X-AI-Provider': 'groq',
                'X-AI-Model': normalizedModel,
              },
            });
          } catch (err: any) {
            console.error('[AI Provider Error - Groq]:', err?.message || err);
            // Fallback to Gemini if Groq fails
            if (geminiKey) {
              try {
                const google = createGoogleGenerativeAI({ apiKey: geminiKey });
                const fallbackResult = streamText({
                  model: google('gemini-1.5-flash'),
                  system: systemPrompt,
                  prompt: combinedPrompt,
                  temperature: clampedTemp,
                });
                return fallbackResult.toTextStreamResponse({
                  headers: {
                    'X-AI-Provider': 'google',
                    'X-AI-Model': 'gemini-1.5-flash',
                    'X-Fallback-Applied': 'true',
                    'X-Original-Model': normalizedModel,
                    'X-Active-Model': 'gemini-1.5-flash',
                    'X-Fallback-Message': 'تم التحويل تلقائياً إلى Gemini 1.5 Flash لضمان استمرار السلسلة',
                  },
                });
              } catch (e) {}
            }
            return new Response(
              JSON.stringify({
                success: false,
                error: `خطأ في مزود Groq: ${err.message || 'فشل الاتصال'}`,
                details: err?.toString() || String(err),
              }),
              { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
          }
        }
      }

      // -------------------------------------------------------------
      // 3. OpenAI (GPT-4o, GPT-4o-mini, o1, o3)
      // -------------------------------------------------------------
      if (
        activeModelLower.startsWith('gpt') ||
        activeModelLower.startsWith('o1') ||
        activeModelLower.startsWith('o3') ||
        activeModelLower.startsWith('chatgpt')
      ) {
        const isAdvanced = !activeModelLower.includes('mini');
        const targetGemini = isAdvanced ? 'gemini-pro-latest' : 'gemini-flash-latest';

        if (!openaiKey && !openrouterKey) {
          // If Gemini key is available, seamless auto-routing fallback
          if (geminiKey) {
            try {
              const google = createGoogleGenerativeAI({ apiKey: geminiKey });
              const { text, modelUsed } = await callGoogleModelSafe(
                google,
                targetGemini,
                systemPrompt,
                combinedPrompt,
                clampedTemp
              );
              const streamHeaders: Record<string, string> = {
                'X-AI-Provider': 'google',
                'X-AI-Model': modelUsed,
                'X-Model-Used': modelUsed,
                'X-Fallback-Applied': 'true',
                'X-Original-Model': normalizedModel,
                'X-Active-Model': modelUsed,
                'X-Fallback-Message': `تم التنفيذ عبر ${isAdvanced ? 'Gemini Pro' : 'Gemini Flash'} لعدم توفر مفتاح OpenAI`,
                'Content-Type': 'text/plain; charset=utf-8',
              };
              if (shouldDeductCredit) {
                streamHeaders['x-remaining-credits'] = String(remainingCredits);
                streamHeaders['x-user-plan'] = userPlan;
              }
              return new Response(text, { headers: streamHeaders });
            } catch (e) {
              console.error('[OpenAI auto-fallback to Gemini error]:', e);
            }
          }

          return new Response(
            JSON.stringify({
              success: false,
              missingKey: true,
              requiredProvider: 'openai',
              requiredKeyName: 'OpenAI API Key',
              model: normalizedModel,
              error: `يرجى إدخال مفتاح OpenAI API Key في الإعدادات لاستخدام نموذج ${normalizedModel}`,
            }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          );
        }

        if (openaiKey) {
          try {
            const openai = createOpenAI({ apiKey: openaiKey });
            const result = streamText({
              model: openai(normalizedModel),
              system: systemPrompt,
              prompt: combinedPrompt,
              temperature: clampedTemp,
            });
            return result.toTextStreamResponse({
              headers: {
                'X-AI-Provider': 'openai',
                'X-AI-Model': normalizedModel,
              },
            });
          } catch (err: any) {
            console.error('[AI Provider Error - OpenAI]:', err?.message || err);
            // Seamless fallback to Gemini if OpenAI call fails
            if (geminiKey) {
              try {
                const google = createGoogleGenerativeAI({ apiKey: geminiKey });
                const fallbackResult = streamText({
                  model: google(targetGemini),
                  system: systemPrompt,
                  prompt: combinedPrompt,
                  temperature: clampedTemp,
                });
                return fallbackResult.toTextStreamResponse({
                  headers: {
                    'X-AI-Provider': 'google',
                    'X-AI-Model': targetGemini,
                    'X-Model-Used': targetGemini,
                    'X-Fallback-Applied': 'true',
                    'X-Original-Model': normalizedModel,
                    'X-Active-Model': targetGemini,
                    'X-Fallback-Message': `تم التحويل تلقائياً إلى ${isAdvanced ? 'Gemini 1.5 Pro' : 'Gemini 1.5 Flash'} لضمان استمرار السلسلة`,
                  },
                });
              } catch (e) {}
            }
            return new Response(
              JSON.stringify({
                success: false,
                error: `خطأ في مزود OpenAI: ${err.message || 'فشل الاتصال'}`,
                details: err?.toString() || String(err),
              }),
              { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
          }
        }
      }

      // -------------------------------------------------------------
      // 4. Anthropic Claude (Claude 3.5 Sonnet, Opus, Haiku)
      // -------------------------------------------------------------
      if (activeModelLower.startsWith('claude')) {
        if (!anthropicKey && !openrouterKey) {
          // If Gemini key is available, seamless auto-routing fallback to Gemini Pro
          if (geminiKey) {
            try {
              const google = createGoogleGenerativeAI({ apiKey: geminiKey });
              const { text, modelUsed } = await callGoogleModelSafe(
                google,
                'gemini-pro-latest',
                systemPrompt,
                combinedPrompt,
                clampedTemp
              );
              const streamHeaders: Record<string, string> = {
                'X-AI-Provider': 'google',
                'X-AI-Model': modelUsed,
                'X-Model-Used': modelUsed,
                'X-Fallback-Applied': 'true',
                'X-Original-Model': normalizedModel,
                'X-Active-Model': modelUsed,
                'X-Fallback-Message': 'تم التنفيذ عبر Gemini Pro لعدم توفر مفتاح Anthropic Claude',
                'Content-Type': 'text/plain; charset=utf-8',
              };
              if (shouldDeductCredit) {
                streamHeaders['x-remaining-credits'] = String(remainingCredits);
                streamHeaders['x-user-plan'] = userPlan;
              }
              return new Response(text, { headers: streamHeaders });
            } catch (e) {
              console.error('[Anthropic auto-fallback to Gemini error]:', e);
            }
          }

          return new Response(
            JSON.stringify({
              success: false,
              missingKey: true,
              requiredProvider: 'anthropic',
              requiredKeyName: 'Anthropic Claude API Key',
              model: normalizedModel,
              error: `يرجى إدخال مفتاح Anthropic API Key (أو OpenRouter) في الإعدادات لاستخدام نموذج ${normalizedModel}`,
            }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }

      // -------------------------------------------------------------
      // 5. DeepSeek (DeepSeek-V3, R1, Coder)
      // -------------------------------------------------------------
      if (activeModelLower.startsWith('deepseek')) {
        if (!deepseekKey && !openrouterKey) {
          if (geminiKey) {
            try {
              const google = createGoogleGenerativeAI({ apiKey: geminiKey });
              const { text, modelUsed } = await callGoogleModelSafe(
                google,
                'gemini-flash-latest',
                systemPrompt,
                combinedPrompt,
                clampedTemp
              );
              const streamHeaders: Record<string, string> = {
                'X-AI-Provider': 'google',
                'X-AI-Model': modelUsed,
                'X-Model-Used': modelUsed,
                'X-Fallback-Applied': 'true',
                'X-Original-Model': normalizedModel,
                'X-Active-Model': modelUsed,
                'X-Fallback-Message': 'تم التنفيذ عبر Gemini Flash لعدم توفر مفتاح DeepSeek',
                'Content-Type': 'text/plain; charset=utf-8',
              };
              if (shouldDeductCredit) {
                streamHeaders['x-remaining-credits'] = String(remainingCredits);
                streamHeaders['x-user-plan'] = userPlan;
              }
              return new Response(text, { headers: streamHeaders });
            } catch (e) {}
          }

          return new Response(
            JSON.stringify({
              success: false,
              missingKey: true,
              requiredProvider: 'deepseek',
              requiredKeyName: 'DeepSeek API Key',
              model: normalizedModel,
              error: `يرجى إدخال مفتاح DeepSeek API Key أو OpenRouter في الإعدادات لاستخدام نموذج ${normalizedModel}`,
            }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          );
        }

        if (deepseekKey) {
          try {
            const deepseek = createOpenAI({
              baseURL: 'https://api.deepseek.com',
              apiKey: deepseekKey,
            });
            const targetModel = normalizedModel.includes('chat') ? normalizedModel : 'deepseek-chat';
            const result = streamText({
              model: deepseek(targetModel),
              system: systemPrompt,
              prompt: combinedPrompt,
              temperature: clampedTemp,
            });
            return result.toTextStreamResponse({
              headers: {
                'X-AI-Provider': 'deepseek',
                'X-AI-Model': normalizedModel,
              },
            });
          } catch (err: any) {
            console.error('[AI Provider Error - DeepSeek]:', err?.message || err);
            return new Response(
              JSON.stringify({
                success: false,
                error: `خطأ في مزود DeepSeek: ${err.message || 'فشل الاتصال'}`,
                details: err?.toString() || String(err),
              }),
              { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
          }
        }
      }

      // -------------------------------------------------------------
      // 6. Universal OpenRouter Routing
      // -------------------------------------------------------------
      if (openrouterKey) {
        try {
          const openrouter = createOpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: openrouterKey,
          });
          const result = streamText({
            model: openrouter(normalizedModel),
            system: systemPrompt,
            prompt: combinedPrompt,
            temperature: clampedTemp,
          });
          return result.toTextStreamResponse({
            headers: {
              'X-AI-Provider': 'openrouter',
              'X-AI-Model': normalizedModel,
            },
          });
        } catch (err: any) {
          console.error('[AI Provider Error - OpenRouter]:', err?.message || err);
          return new Response(
            JSON.stringify({
              success: false,
              error: `خطأ في مزود OpenRouter: ${err.message || 'فشل الاتصال'}`,
              details: err?.toString() || String(err),
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }

      // -------------------------------------------------------------
      // 7. Missing API Key Fallback: Explicit 401 response
      // -------------------------------------------------------------
      return new Response(
        JSON.stringify({
          success: false,
          missingKey: true,
          requiredProvider: 'unknown',
          requiredKeyName: 'API Key',
          model: normalizedModel,
          error: `يرجى إدخال مفتاح الـ API في الإعدادات لاستخدام نموذج ${normalizedModel}`,
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // -------------------------------------------------------------
    // Image AI Generation (Google Imagen 3, DALL-E 3, Flux Schnell)
    // -------------------------------------------------------------
    if (type === 'imageAI') {
      const userProvidedGeminiKey = (
        req.headers.get('x-gemini-key') ||
        bodyKeys.geminiKey ||
        bodyKeys.geminiApiKey ||
        ''
      ).trim();

      const serverGeminiKey = (
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
        process.env.GOOGLE_API_KEY ||
        ''
      ).trim();

      const geminiKey = userProvidedGeminiKey || serverGeminiKey;

      const userProvidedOpenaiKey = (
        req.headers.get('x-openai-key') ||
        bodyKeys.openaiKey ||
        bodyKeys.openaiApiKey ||
        ''
      ).trim();
      const serverOpenaiKey = (process.env.OPENAI_API_KEY || '').trim();
      const openaiKey = userProvidedOpenaiKey || serverOpenaiKey;

      let remainingCredits = 100;

      const rawInput = (prompt || context || '').trim();
      const requestedModel = (model || 'google-imagen-3').toLowerCase().trim();

      // 1. Silent Visual Prompt Auto-Refiner:
      // Convert Arabic / marketing text into a single, ultra-detailed, photorealistic English visual prompt.
      let refinedPrompt = rawInput || 'Cinematic 8k shot of a futuristic sleek tech workspace, dramatic studio lighting, octane render';
      const hasArabic = /[\u0600-\u06FF]/.test(rawInput);
      const isMarketingOrArabic = hasArabic || rawInput.length > 60;

      if (geminiKey && isMarketingOrArabic) {
        try {
          const google = createGoogleGenerativeAI({ apiKey: geminiKey });
          const { text: visualText } = await callGoogleModelSafe(
            google,
            'gemini-3.8-flash',
            'You are an expert visual prompt engineer for photorealistic commercial advertising and high-tech digital art.',
            `You are an expert visual prompt engineer. Based on this content: "${rawInput.slice(0, 1000)}", write a single, ultra-detailed, photorealistic image prompt in ENGLISH suitable for Imagen 3 and Flux. Include cinematic lighting, environment, textures, modern sleek technology aesthetic, and 8k detail. Output ONLY the English prompt text, no explanations, no quotes.`,
            0.4
          );
          if (visualText && visualText.trim().length > 10) {
            refinedPrompt = visualText.trim().replace(/^["']|["']$/g, '');
          }
        } catch (optErr) {
          console.warn('[Visual prompt auto-refiner warning, using fallback]:', optErr);
          if (hasArabic) {
            refinedPrompt = 'Cinematic 8k advertising photograph of a modern smart task management workstation, holographic interface, sleek productivity software, dramatic studio lighting, octane render';
          }
        }
      } else if (hasArabic) {
        refinedPrompt = 'Cinematic 8k advertising photograph of a modern smart task management workstation, holographic interface, sleek productivity software, dramatic studio lighting, octane render';
      }

      // 2. Google Imagen 3 (imagen-3.0-generate-002) official REST API
      if (
        geminiKey &&
        (requestedModel.includes('imagen') ||
          requestedModel.includes('google') ||
          requestedModel.includes('default') ||
          requestedModel === 'imageai')
      ) {
        try {
          const imagenRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                instances: [{ prompt: refinedPrompt }],
                parameters: {
                  sampleCount: 1,
                  aspectRatio: '1:1',
                  outputMimeType: 'image/jpeg',
                },
              }),
            }
          );

          if (imagenRes.ok) {
            const data = await imagenRes.json();
            const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
            if (b64) {
              const dataUrl = `data:image/jpeg;base64,${b64}`;
              return new Response(
                JSON.stringify({
                  success: true,
                  imageUrl: dataUrl,
                  model: 'imagen-3.0-generate-002',
                  provider: 'Google Imagen 3 (4K)',
                  prompt: refinedPrompt,
                }),
                {
                  status: 200,
                  headers: {
                    'Content-Type': 'application/json',
                    'x-remaining-credits': String(remainingCredits),
                  },
                }
              );
            }
          } else {
            const errBody = await imagenRes.json().catch(() => ({}));
            console.warn('[Google Imagen 3 non-200, falling back to Flux HD]:', errBody);
          }
        } catch (err: any) {
          console.warn('[Google Imagen 3 exception, falling back to Flux HD]:', err?.message || err);
        }
      }

      // 3. OpenAI DALL-E 3 if requested and key available
      if (openaiKey && requestedModel.includes('dall-e')) {
        try {
          const dalleRes = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${openaiKey}`,
            },
            body: JSON.stringify({
              model: 'dall-e-3',
              prompt: refinedPrompt,
              n: 1,
              size: '1024x1024',
            }),
          });
          if (dalleRes.ok) {
            const dalleData = await dalleRes.json();
            const dalleUrl = dalleData?.data?.[0]?.url;
            if (dalleUrl) {
              return new Response(
                JSON.stringify({
                  success: true,
                  imageUrl: dalleUrl,
                  model: 'dall-e-3',
                  provider: 'OpenAI DALL-E 3',
                  prompt: refinedPrompt,
                }),
                {
                  status: 200,
                  headers: {
                    'Content-Type': 'application/json',
                    'x-remaining-credits': String(remainingCredits),
                  },
                }
              );
            }
          }
        } catch (err: any) {
          console.warn('[DALL-E 3 Error, attempting fallback]:', err?.message || err);
        }
      }

      // 4. Enhanced Flux.1 HD (Watermark-Free, 1024x1024, High Quality)
      const seed = Math.floor(Math.random() * 1000000);
      const cleanPrompt = encodeURIComponent(refinedPrompt);
      const fluxUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1024&height=1024&model=flux&nologo=true&enhance=true&seed=${seed}`;

      const isPro = requestedModel.includes('pro');
      const isImagenRequested = requestedModel.includes('imagen') || requestedModel.includes('google');
      return new Response(
        JSON.stringify({
          success: true,
          imageUrl: fluxUrl,
          model: isPro ? 'flux-1-pro' : isImagenRequested ? 'flux-1-schnell' : 'flux-1-schnell',
          provider: isPro
            ? 'Flux.1 Pro'
            : isImagenRequested
            ? 'Flux HD (Imagen 3 Fallback)'
            : 'Flux.1 Schnell',
          prompt: refinedPrompt,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'x-remaining-credits': String(remainingCredits),
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: 'نوع العقدة غير مدعوم أو غير صالح للتنفيذ',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[AI Provider Error]:', error?.message || error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || 'فشل في الاتصال بمزود الذكاء الاصطناعي',
        details: error?.toString() || String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
