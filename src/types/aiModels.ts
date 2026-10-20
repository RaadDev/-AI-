export type ModelCategory = 'llm' | 'image' | 'code' | 'audio';

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  providerKey: 'openai' | 'anthropic' | 'gemini' | 'groq' | 'meta' | 'bfl';
  category: ModelCategory;
  badge: string;
  description: string;
  contextWindow?: string;
  speed: 'ultra-fast' | 'fast' | 'balanced' | 'deep-reasoning';
  isPro?: boolean;
}

export const AI_MODELS: AIModel[] = [
  // ==========================================
  // 1. Large Language Models (LLMs)
  // ==========================================
  {
    id: 'gemini-1-5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'Google AI',
    providerKey: 'gemini',
    category: 'llm',
    badge: 'فائق السرعة وافتراضي ⚡',
    description: 'النموذج الافتراضي فائق السرعة، يدعم سياقاً حتى مليون توكن واستجابة فورية.',
    contextWindow: '1M',
    speed: 'ultra-fast',
  },
  {
    id: 'gemini-1-5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google AI',
    providerKey: 'gemini',
    category: 'llm',
    badge: 'سياق ضخم واستنتاج عميق 🧠',
    description: 'يتميز بسياق ضخم يصل إلى مليوني توكن لتحليل المستندات الطويلة والبرمجة المعقدة.',
    contextWindow: '2M',
    speed: 'balanced',
    isPro: true,
  },
  {
    id: 'llama-3-3-70b',
    name: 'Llama 3.3 70B',
    provider: 'Groq / Meta',
    providerKey: 'groq',
    category: 'llm',
    badge: 'استجابة خارقة 250t/s ⚡',
    description: 'أقوى نموذج مفتوح المصدر بسرعة تفوق 250 توكن في الثانية عبر Groq LPUs.',
    contextWindow: '128K',
    speed: 'ultra-fast',
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    providerKey: 'openai',
    category: 'llm',
    badge: 'الرائد متعدد الوسائط 🌟',
    description: 'النموذج الأساسي الرائد للتعامل مع النصوص والوسائط المتعددة بدقة متناهية.',
    contextWindow: '128K',
    speed: 'fast',
    isPro: true,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    providerKey: 'openai',
    category: 'llm',
    badge: 'سريع واقتصادي',
    description: 'نموذج خفيف وسريع مناسب لإعادة الصياغة والتصنيف بدقة عالية.',
    contextWindow: '128K',
    speed: 'ultra-fast',
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    providerKey: 'anthropic',
    category: 'llm',
    badge: 'الأفضل في البرمجة والمحتوى 👑',
    description: 'المرجع الأول عالمياً في كتابة الأكواد، التحليل المنطقي، والصياغة الأدبية.',
    contextWindow: '200K',
    speed: 'balanced',
    isPro: true,
  },

  // ==========================================
  // 2. Image & Vision Models
  // ==========================================
  {
    id: 'google-imagen-3',
    name: 'Google Imagen 3',
    provider: 'Google AI',
    providerKey: 'gemini',
    category: 'image',
    badge: 'فوتوغرافي 4K وسينمائي 🎨',
    description: 'توليد صور واقعية سينمائية فائقة الجودة مباشرة بمفتاح Gemini الخاص بك.',
    speed: 'balanced',
  },
  {
    id: 'flux-1-schnell',
    name: 'Flux.1 Schnell',
    provider: 'Black Forest Labs / Groq',
    providerKey: 'bfl',
    category: 'image',
    badge: 'توليد فوري ونصوص دقيقة ⚡',
    description: 'سرعة استجابة هائلة وتفاصيل بصرية عالية مع دقة كتابة الكلمات الإنجليزية.',
    speed: 'ultra-fast',
  },
  {
    id: 'flux-1-dev',
    name: 'Flux.1 Pro',
    provider: 'Black Forest Labs',
    providerKey: 'bfl',
    category: 'image',
    badge: 'أعلى جودة سينمائية ⭐',
    description: 'إصدار متقدم لمحترفي التصميم، إضاءة سينمائية وأعلى واقعية بصرية ممكنة.',
    speed: 'balanced',
    isPro: true,
  },
  {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    provider: 'OpenAI',
    providerKey: 'openai',
    category: 'image',
    badge: 'فهم متقدم للأوامر 🖼️',
    description: 'ممتاز في فهم الأوامر المعقدة وتوليد صور إبداعية متناسقة.',
    speed: 'fast',
    isPro: true,
  },

  // ==========================================
  // 3. Audio & Speech Models
  // ==========================================
  {
    id: 'whisper-v3',
    name: 'Whisper v3',
    provider: 'OpenAI',
    providerKey: 'openai',
    category: 'audio',
    badge: 'أفضل تفريغ صوتي بالعربية 🎙️',
    description: 'أفضل نموذج عالمياً لتفريغ النصوص الصوتية بدقة عالية جداً ودعم كامل للغة العربية.',
    speed: 'ultra-fast',
  },
];

export function getModelsByCategory(category: ModelCategory): AIModel[] {
  return AI_MODELS.filter((m) => m.category === category);
}

export function getLLMAndCodeModels(): AIModel[] {
  return AI_MODELS.filter((m) => m.category === 'llm' || m.category === 'code');
}

export function getImageModels(): AIModel[] {
  return AI_MODELS.filter((m) => m.category === 'image');
}

export function getAudioModels(): AIModel[] {
  return AI_MODELS.filter((m) => m.category === 'audio');
}

export function getModelById(id?: string): AIModel {
  if (!id) return AI_MODELS[0];
  const found = AI_MODELS.find((m) => m.id === id);
  return found || AI_MODELS[0];
}
