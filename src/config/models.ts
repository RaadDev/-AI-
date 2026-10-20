export interface AIModelConfig {
  id: string;
  name: string;
  provider: 'google' | 'openai' | 'anthropic' | 'groq' | 'flux';
  providerLabel: string;
  category: 'text' | 'image';
  isDefault?: boolean;
  tier: 'free' | 'pro';
  description: string;
  badge?: string;
  requiresKey?: 'OPENAI_API_KEY' | 'ANTHROPIC_API_KEY' | 'GROQ_API_KEY';
}

export const TEXT_MODELS: AIModelConfig[] = [
  // ── Google AI (تعمل فوراً بمفتاح Gemini الخاص بك) ──
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash (فائق السرعة - الافتراضي ⚡)',
    provider: 'google',
    providerLabel: 'Google AI',
    category: 'text',
    isDefault: true,
    tier: 'free',
    badge: 'موصى به ⚡',
    description: 'النموذج الرسمي الأحدث والأكثر استقراراً، يدعم سياقاً ضخماً واستجابة فائقة السرعة.'
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro (استنتاج متقدم 🧠)',
    provider: 'google',
    providerLabel: 'Google AI',
    category: 'text',
    tier: 'free',
    badge: 'استنتاج عميق 🧠',
    description: 'الأفضل في التحليل المتقدم، الأكواد البرمجية، وصياغة المستندات الطويلة.'
  },

  // ── Groq Cloud (السرعة القصوى) ──
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B (عبر Groq)',
    provider: 'groq',
    providerLabel: 'Meta / Groq',
    category: 'text',
    tier: 'free',
    badge: 'استجابة فورية 🦙',
    description: 'أقوى نموذج مفتوح المصدر بسرعة تفوق 250 توكن في الثانية.',
    requiresKey: 'GROQ_API_KEY'
  },

  // ── OpenAI (تتطلب مفتاح شخصي أو اشتراك Pro) ──
  {
    id: 'gpt-4o',
    name: 'GPT-4o (الرائد متعدد الوسائط)',
    provider: 'openai',
    providerLabel: 'OpenAI',
    category: 'text',
    tier: 'pro',
    badge: 'PRO 🌟',
    description: 'النموذج الأقوى من OpenAI للمهام الإبداعية والتنفيذية الحساسة.',
    requiresKey: 'OPENAI_API_KEY'
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini (سريع واقتصادي)',
    provider: 'openai',
    providerLabel: 'OpenAI',
    category: 'text',
    tier: 'free',
    description: 'مناسب للمهام السريعة وإعادة الصياغة والتصنيف بدقة عالية.',
    requiresKey: 'OPENAI_API_KEY'
  },

  // ── Anthropic (تتطلب مفتاح شخصي أو اشتراك Pro) ──
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet (الأفضل في البرمجة)',
    provider: 'anthropic',
    providerLabel: 'Anthropic',
    category: 'text',
    tier: 'pro',
    badge: 'كود وأدب 👑',
    description: 'المرجع الأول عالمياً في كتابة الأكواد، التحليل المنطقي، والأسلوب الأدبي.',
    requiresKey: 'ANTHROPIC_API_KEY'
  }
];

export const IMAGE_MODELS: AIModelConfig[] = [
  {
    id: 'google-imagen-3',
    name: 'Google Imagen 3 (فوتوغرافي 4K ⭐)',
    provider: 'google',
    providerLabel: 'Google AI',
    category: 'image',
    isDefault: true,
    tier: 'free',
    badge: 'افتراضي متصل 🎨',
    description: 'توليد صور واقعية سينمائية فائقة الدقة مباشرة بمفتاح Gemini الخاص بك.'
  },
  {
    id: 'flux-schnell',
    name: 'Flux.1 Schnell (توليد سريع)',
    provider: 'flux',
    providerLabel: 'Black Forest Labs',
    category: 'image',
    tier: 'free',
    badge: 'مجاني فائق السرعة ⚡',
    description: 'سرعة استجابة هائلة وتفاصيل بصرية سينمائية عالية بدون علامات مائية.'
  },
  {
    id: 'flux-pro',
    name: 'Flux.1 Pro (احترافي)',
    provider: 'flux',
    providerLabel: 'Black Forest Labs',
    category: 'image',
    tier: 'pro',
    badge: 'PRO ⭐',
    description: 'الأعلى تقييماً في تجسيد تفاصيل الوجوه والتكوين البصري الاحترافي.'
  },
  {
    id: 'dall-e-3',
    name: 'DALL-E 3 (OpenAI)',
    provider: 'openai',
    providerLabel: 'OpenAI',
    category: 'image',
    tier: 'pro',
    badge: 'OpenAI 🖼️',
    description: 'فهم ممتاز للأوامر المعقدة وتوليد الرسوم التوضيحية الدقيقة.',
    requiresKey: 'OPENAI_API_KEY'
  }
];

export const ALL_MODELS: AIModelConfig[] = [...TEXT_MODELS, ...IMAGE_MODELS];

export const DEFAULT_TEXT_MODEL = 'gemini-3.8-flash';
export const DEFAULT_IMAGE_MODEL = 'google-imagen-3';

export function getModelById(id: string): AIModelConfig | undefined {
  if (!id) return undefined;
  const normalized = id.toLowerCase().trim();
  if (
    normalized === 'gemini-3.8-flash' ||
    normalized === 'gemini-3.8' ||
    normalized === 'gemini-2.5-flash' ||
    normalized === 'gemini-1.5-flash' ||
    normalized === 'gemini-flash' ||
    normalized === 'gemini-flash-latest' ||
    normalized.includes('flash')
  ) {
    return ALL_MODELS.find((m) => m.id === 'gemini-3.8-flash');
  }
  if (
    normalized === 'gemini-3.1-pro-preview' ||
    normalized === 'gemini-3.1-pro' ||
    normalized === 'gemini-2.5-pro' ||
    normalized === 'gemini-1.5-pro' ||
    normalized === 'gemini-pro' ||
    normalized === 'gemini-pro-latest' ||
    normalized.includes('pro')
  ) {
    return ALL_MODELS.find((m) => m.id === 'gemini-3.1-pro-preview');
  }
  return (
    ALL_MODELS.find((m) => m.id.toLowerCase() === normalized) ||
    ALL_MODELS.find((m) => normalized.includes(m.id.toLowerCase()))
  );
}

export function isProModel(id: string): boolean {
  const model = getModelById(id);
  return model?.tier === 'pro';
}
