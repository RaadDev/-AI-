export interface WorkflowTemplate {
  id: string;
  title: string;
  description: string;
  category: 'marketing' | 'social' | 'seo' | 'business' | 'automation' | 'media' | 'dev';
  complexity: 'مبتدئ' | 'متوسط' | 'متقدم';
  nodeCount: number;
  tags: string[];
  icon: string;
  color: string;
  pipelinePreview: string[]; // تسلسل العقد
  nodes: any[];
  edges: any[];
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  // ─── 1. التسويق والإعلانات (Marketing & Ads) ─────────────────────
  {
    id: 'ad-campaign-generator',
    title: 'حملة إعلانية متكاملة بنموذج AIDA + صورة إعلانية',
    description: 'توليد نصوص إعلانية مقنعة للمنتج، واختيار الخطاف، ورسم غلاف إعلاني بالذكاء الاصطناعي.',
    category: 'marketing',
    complexity: 'متوسط',
    nodeCount: 4,
    tags: ['إعلانات', 'AIDA', 'صور', 'Meta/Google'],
    icon: 'Megaphone',
    color: 'from-blue-500 to-indigo-600',
    pipelinePreview: ['مدخل نصي', 'تحليل AIDA', 'توليد الصورة', 'النتيجة النهائية'],
    nodes: [
      {
        id: 'node-1',
        type: 'textInput',
        position: { x: 1350, y: 180 },
        data: {
          label: 'مدخل نصي: مواصفات المنتج والجمهور',
          category: 'input',
          status: 'idle',
          text: 'المنتج: تطبيق إدارة مهام ومشاريع للفرق التقنية الصغيرة والناشئة. الميزة الأساسية: ذكاء اصطناعي يقسم المشاريع تلقائياً لمهام يومية.',
          output: 'المنتج: تطبيق إدارة مهام ومشاريع للفرق التقنية الصغيرة والناشئة. الميزة الأساسية: ذكاء اصطناعي يقسم المشاريع تلقائياً لمهام يومية.'
        }
      },
      {
        id: 'node-2',
        type: 'textAI',
        position: { x: 900, y: 80 },
        data: {
          label: 'تحليل AIDA وصياغة الإعلان',
          category: 'ai',
          status: 'idle',
          model: 'gemini-3.8-flash',
          systemPrompt: 'اكتب نص إعلان تسويقي مبهر بنموذج AIDA (انتباه Attention، اهتمام Interest، رغبة Desire، إجراء Action) موجه لرواد الأعمال مع اقتراح وصف للصورة الإعلانية.',
          output: ''
        }
      },
      {
        id: 'node-3',
        type: 'imageAI',
        position: { x: 480, y: 320 },
        data: {
          label: 'توليد الصورة الإعلانية بالذكاء الاصطناعي',
          category: 'ai',
          status: 'idle',
          model: 'google-imagen-3',
          imagePrompt: 'Futuristic sleek productivity workspace, modern minimalist desk, glowing holographic task dashboard, cinematic lighting, 8k',
          imageUrl: '',
          output: ''
        }
      },
      {
        id: 'node-4',
        type: 'finalResult',
        position: { x: 50, y: 180 },
        data: {
          label: 'النتيجة النهائية: الحزمة الإعلانية المتكاملة',
          category: 'output',
          status: 'idle',
          output: ''
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
      { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true, style: { stroke: '#ec4899', strokeWidth: 2 } },
      { id: 'e2-4', source: 'node-2', target: 'node-4', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
      { id: 'e3-4', source: 'node-3', target: 'node-4', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } }
    ]
  },
  {
    id: 'cold-email-sequence',
    title: 'سلسلة رسائل بريد B2B باردة (Cold Outreach)',
    description: 'بناء 3 رسائل بريدية مخصصة لأصحاب القرار مع سطر موضوع فضولي ودعوة إجراء خفيفة.',
    category: 'marketing',
    complexity: 'مبتدئ',
    nodeCount: 3,
    tags: ['B2B', 'مبيعات', 'بريد إلكتروني'],
    icon: 'Mail',
    color: 'from-amber-500 to-orange-600',
    pipelinePreview: ['بيانات العميل', 'صانع الرسائل', 'تنسيق Markdown'],
    nodes: [
      {
        id: 'node-1',
        type: 'textInput',
        position: { x: 980, y: 150 },
        data: {
          label: 'بيانات العميل المستهدف والخدمة',
          category: 'input',
          status: 'idle',
          text: 'العميل: مدراء التسويق في شركات التجارة الإلكترونية الخليجية. الخدمة: خدمة تحسين معدل التحويل (CRO) عبر بوابات دفع تفاعلية.',
          output: 'العميل: مدراء التسويق في شركات التجارة الإلكترونية الخليجية. الخدمة: خدمة تحسين معدل التحويل (CRO) عبر بوابات دفع تفاعلية.'
        }
      },
      {
        id: 'node-2',
        type: 'textAI',
        position: { x: 520, y: 150 },
        data: {
          label: 'صانع الرسائل الباردة B2B',
          category: 'ai',
          status: 'idle',
          model: 'gemini-3.8-flash',
          systemPrompt: 'اكتب سلسلة من 3 رسائل بريد إلكتروني مخصصة وموجزة جداً (Touch 1, Follow-up 1, Breakup Email) مع سطور موضوع غير تقليدية ودعوة سريعة لمكالمة تعارف 10 دقائق.',
          output: ''
        }
      },
      {
        id: 'node-3',
        type: 'finalResult',
        position: { x: 60, y: 150 },
        data: {
          label: 'سلسلة المراسلات الجاهزة للتسليم',
          category: 'output',
          status: 'idle',
          output: ''
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 } },
      { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } }
    ]
  },
  {
    id: 'ecommerce-product-launch',
    title: 'خطة إطلاق منتج لمتجر إلكتروني مع صور متعددة',
    description: 'صياغة وصف المنتج، منشورات الإطلاق، وتوليد خلفيات فوتوغرافية سينمائية.',
    category: 'marketing',
    complexity: 'متقدم',
    nodeCount: 5,
    tags: ['تجارة إلكترونية', 'إطلاق', 'صور منتجات'],
    icon: 'ShoppingBag',
    color: 'from-emerald-500 to-teal-600',
    pipelinePreview: ['رابط المنتج', 'وصف تسويقي', 'محسن الصور', 'توليد الصور', 'جدول النشر'],
    nodes: [
      {
        id: 'node-1',
        type: 'urlScraper',
        position: { x: 1400, y: 220 },
        data: {
          label: 'رابط صفحة المنتج أو المتجر',
          category: 'input',
          status: 'idle',
          url: 'https://example.com/products/smart-perfume',
          output: 'عطر الفخامة الملكي، مستخلص العود الطبيعي مع لمسات العنبر واللافندر، يدوم 24 ساعة، إصدار محدود 2026.'
        }
      },
      {
        id: 'node-2',
        type: 'textAI',
        position: { x: 940, y: 80 },
        data: {
          label: 'وصف تسويقي وسيناريو الإطلاق',
          category: 'ai',
          status: 'idle',
          model: 'gemini-3.8-flash',
          systemPrompt: 'صغ وصف منتج فاخر بأسلوب إقناعي، ثم اكتب خطة إطلاق عبر 3 منشورات تشويقية قبل يوم الإطلاق.',
          output: ''
        }
      },
      {
        id: 'node-3',
        type: 'textAI',
        position: { x: 940, y: 420 },
        data: {
          label: 'محسن أوامر التصوير (Prompt Engineer)',
          category: 'ai',
          status: 'idle',
          model: 'gemini-3.8-flash',
          systemPrompt: 'حول مواصفات المنتج إلى برومبت إنجليزي فوتوغرافي فائق الجودة لمحرك Imagen 3 لتوليد صورة دعائية إعلانية.',
          output: ''
        }
      },
      {
        id: 'node-4',
        type: 'imageAI',
        position: { x: 490, y: 420 },
        data: {
          label: 'توليد الصور الفوتوغرافية للمنتج',
          category: 'ai',
          status: 'idle',
          model: 'google-imagen-3',
          imagePrompt: 'Luxury perfume bottle on dark reflective marble, golden mist, soft studio rim light, commercial photography 8k',
          imageUrl: '',
          output: ''
        }
      },
      {
        id: 'node-5',
        type: 'finalResult',
        position: { x: 50, y: 220 },
        data: {
          label: 'جدول النشر وحزمة الإطلاق الكاملة',
          category: 'output',
          status: 'idle',
          output: ''
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
      { id: 'e1-3', source: 'node-1', target: 'node-3', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
      { id: 'e3-4', source: 'node-3', target: 'node-4', animated: true, style: { stroke: '#ec4899', strokeWidth: 2 } },
      { id: 'e2-5', source: 'node-2', target: 'node-5', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
      { id: 'e4-5', source: 'node-4', target: 'node-5', animated: true, style: { stroke: '#ec4899', strokeWidth: 2 } }
    ]
  },
  {
    id: 'ab-testing-copywriter',
    title: 'مختبر نصوص إعلانية A/B Testing للمعلنين',
    description: 'توليد زاويتين تسويقيتين مختلفتين (زاوية المنطق وزاوية العاطفة) لمقارنة التحويل.',
    category: 'marketing',
    complexity: 'متوسط',
    nodeCount: 4,
    tags: ['تحويل', 'A/B Test', 'إعلانات ممولة'],
    icon: 'GitCompare',
    color: 'from-purple-500 to-pink-600',
    pipelinePreview: ['مواصفات العرض', 'الزاوية العاطفية', 'الزاوية المنطقية', 'المقارنة'],
    nodes: [
      {
        id: 'node-1',
        type: 'textInput',
        position: { x: 1350, y: 220 },
        data: {
          label: 'مواصفات العرض التجاري',
          category: 'input',
          status: 'idle',
          text: 'خدمة غسيل سيارات متنقلة عند باب البيت، توفر ساعتين من وقتك أسبوعياً، مع ضمان نظافة ومعطرات ألمانية مجانية.',
          output: 'خدمة غسيل سيارات متنقلة عند باب البيت، توفر ساعتين من وقتك أسبوعياً، مع ضمان نظافة ومعطرات ألمانية مجانية.'
        }
      },
      {
        id: 'node-2',
        type: 'textAI',
        position: { x: 880, y: 80 },
        data: {
          label: 'النسخة A: الزاوية العاطفية (FOMO & Lifestyle)',
          category: 'ai',
          status: 'idle',
          model: 'gemini-3.8-flash',
          systemPrompt: 'اكتب نص إعلان يركز على راحة البال، والمكانة الاجتماعية، والتخلص من التعب والانتظار في المغاسل التقليدية.',
          output: ''
        }
      },
      {
        id: 'node-3',
        type: 'textAI',
        position: { x: 880, y: 400 },
        data: {
          label: 'النسخة B: الزاوية المنطقية (ROI & Numbers)',
          category: 'ai',
          status: 'idle',
          model: 'gemini-3.8-flash',
          systemPrompt: 'اكتب نص إعلان يركز على الأرقام: وفر 8 ساعات شهرياً، وفر 30% من تكلفة الوقود، استثمار ذكي في وقتك الثمين.',
          output: ''
        }
      },
      {
        id: 'node-4',
        type: 'finalResult',
        position: { x: 50, y: 220 },
        data: {
          label: 'جدول مقارنة A/B للاختبار الميداني',
          category: 'output',
          status: 'idle',
          output: ''
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true, style: { stroke: '#a855f7', strokeWidth: 2 } },
      { id: 'e1-3', source: 'node-1', target: 'node-3', animated: true, style: { stroke: '#ec4899', strokeWidth: 2 } },
      { id: 'e2-4', source: 'node-2', target: 'node-4', animated: true, style: { stroke: '#a855f7', strokeWidth: 2 } },
      { id: 'e3-4', source: 'node-3', target: 'node-4', animated: true, style: { stroke: '#ec4899', strokeWidth: 2 } }
    ]
  },

  // ─── 2. صناعة المحتوى والسوشيال ميديا (Content Creation) ─────────
  {
    id: 'youtube-to-thread-article',
    title: 'من فيديو يوتيوب إلى ثريد X ومقال مدونة وغلاف',
    description: 'تفريغ تلقائي لليوتيوب، استخراج أهم 5 دروس، ثريد فيروسي، وصورة غلاف سينمائية.',
    category: 'social',
    complexity: 'متقدم',
    nodeCount: 5,
    tags: ['يوتيوب', 'ثريد X', 'مقال', 'صور'],
    icon: 'Youtube',
    color: 'from-red-500 to-rose-600',
    pipelinePreview: ['سحب يوتيوب', 'تحليل وتفريغ', 'ثريد تويتر', 'توليد الغلاف', 'النتيجة'],
    nodes: [
      {
        id: 'node-1',
        type: 'urlScraper',
        position: { x: 1350, y: 240 },
        data: {
          label: 'سحب محتوى فيديو يوتيوب',
          category: 'input',
          status: 'idle',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          output: 'في هذا اللقاء، يتحدث الخبير عن أسرار بناء الشركات الناشئة المعتمدة على الذكاء الاصطناعي وكيف تختصر الفرق أشهراً باستخدام هندسة الأوامر.'
        }
      },
      {
        id: 'node-2',
        type: 'textAI',
        position: { x: 900, y: 60 },
        data: {
          label: 'صياغة ثريد تويتر (X) فيروسي',
          category: 'ai',
          status: 'idle',
          model: 'gemini-3.8-flash',
          systemPrompt: 'حول النص القادم إلى ثريد تفاعلي من 5 تغريدات مع هوك استثنائي وإحصائيات مركزة.',
          output: ''
        }
      },
      {
        id: 'node-3',
        type: 'textAI',
        position: { x: 900, y: 440 },
        data: {
          label: 'كتابة مقال مدونة متوافق مع SEO',
          category: 'ai',
          status: 'idle',
          model: 'gemini-3.8-flash',
          systemPrompt: 'اكتب مقالاً متكاملاً مع عناوين H2 و H3 يستند للحقائق المستخرجة من الفيديو.',
          output: ''
        }
      },
      {
        id: 'node-4',
        type: 'imageAI',
        position: { x: 480, y: 60 },
        data: {
          label: 'توليد غلاف سينمائي للمقال والثريد',
          category: 'ai',
          status: 'idle',
          model: 'google-imagen-3',
          imagePrompt: 'Cinematic digital art of AI future startups, cybernetic intelligence, deep contrast lighting, 8k',
          imageUrl: '',
          output: ''
        }
      },
      {
        id: 'node-5',
        type: 'finalResult',
        position: { x: 50, y: 240 },
        data: {
          label: 'الحزمة التسويقية الشاملة الجاهزة',
          category: 'output',
          status: 'idle',
          output: ''
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
      { id: 'e1-3', source: 'node-1', target: 'node-3', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
      { id: 'e2-4', source: 'node-2', target: 'node-4', animated: true, style: { stroke: '#ec4899', strokeWidth: 2 } },
      { id: 'e2-5', source: 'node-2', target: 'node-5', animated: true, style: { stroke: '#38bdf8', strokeWidth: 2 } },
      { id: 'e3-5', source: 'node-3', target: 'node-5', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
      { id: 'e4-5', source: 'node-4', target: 'node-5', animated: true, style: { stroke: '#ec4899', strokeWidth: 2 } }
    ]
  },
  {
    id: 'reels-tiktok-script-generator',
    title: 'سكريبت فيديوهات قصيرة (Reels / TikTok / Shorts)',
    description: 'تحويل أي فكرة إلى سكريبت مشهد بمشهد مع توجيهات بصرية للكاميرا والنصوص المتحركة.',
    category: 'social',
    complexity: 'مبتدئ',
    nodeCount: 3,
    tags: ['فيديو قصير', 'تيك توك', 'سكريبت'],
    icon: 'Video',
    color: 'from-fuchsia-500 to-purple-600',
    pipelinePreview: ['فكرة المحتوى', 'كتابة السكريبت', 'مخرجات منسقة'],
    nodes: [
      {
        id: 'node-1',
        type: 'textInput',
        position: { x: 960, y: 150 },
        data: {
          label: 'فكرة الفيديو والهدف',
          category: 'input',
          status: 'idle',
          text: 'كيف تضاعف تركيزك اليومي باستخدام تقنية 90/20 وتتخلص من التشتت الناتج عن الهاتف.',
          output: 'كيف تضاعف تركيزك اليومي باستخدام تقنية 90/20 وتتخلص من التشتت الناتج عن الهاتف.'
        }
      },
      {
        id: 'node-2',
        type: 'textAI',
        position: { x: 500, y: 150 },
        data: {
          label: 'كاتب سكريبتات الشورتس والتيك توك',
          category: 'ai',
          status: 'idle',
          model: 'gemini-3.8-flash',
          systemPrompt: 'اكتب سكريبت ريلز مدته 45 ثانية مقسم إلى 4 مشاهد: [الثواني 0-3: الخطاف البصري والنفسي]، [الثواني 3-20: المشكلة والحل]، [الثواني 20-35: الخطوة العملية]، [الثواني 35-45: الدعوة للإجراء CTA]. اذكر التوجيهات البصرية بين أقواس [كاميرا زووم، نص عريض على الشاشة].',
          output: ''
        }
      },
      {
        id: 'node-3',
        type: 'finalResult',
        position: { x: 50, y: 150 },
        data: {
          label: 'السكريبت الكامل الجاهز للتصوير',
          category: 'output',
          status: 'idle',
          output: ''
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true, style: { stroke: '#d946ef', strokeWidth: 2 } },
      { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } }
    ]
  },
  {
    id: 'arab-dialects-multi-tone',
    title: 'إعادة صياغة المحتوى إلى 5 لهجات عربية',
    description: 'تحويل النص إلى: سعودية بيضاء، خليجية تسويقية، مصرية عفوية، وفصحى معتمدة.',
    category: 'social',
    complexity: 'متوسط',
    nodeCount: 4,
    tags: ['لهجات', 'سعودية', 'إعادة صياغة'],
    icon: 'Languages',
    color: 'from-violet-500 to-indigo-600',
    pipelinePreview: ['المحتوى الأصلي', 'محول اللهجة', 'فلاتر الأسلوب', 'جدول المقارنة'],
    nodes: [
      {
        id: 'node-1',
        type: 'textInput',
        position: { x: 1350, y: 180 },
        data: {
          label: 'النص الأصلي المراد تكييفه',
          category: 'input',
          status: 'idle',
          text: 'يسرنا الإعلان عن إطلاق ميزتنا الجديدة التي تتيح لعملائنا إدارة استثماراتهم بكل سهولة وأمان دون أي عمولات خفية.',
          output: 'يسرنا الإعلان عن إطلاق ميزتنا الجديدة التي تتيح لعملائنا إدارة استثماراتهم بكل سهولة وأمان دون أي عمولات خفية.'
        }
      },
      {
        id: 'node-2',
        type: 'toneRewriter',
        position: { x: 890, y: 100 },
        data: {
          label: 'محول اللهجة: سعودية بيضاء تسويقية',
          category: 'ai',
          status: 'idle',
          targetTone: 'saudi',
          lengthPreference: 'balanced',
          output: ''
        }
      },
      {
        id: 'node-3',
        type: 'textAI',
        position: { x: 890, y: 380 },
        data: {
          label: 'توليد اللهجات المتبقية (مصرية، إماراتية، فصحى)',
          category: 'ai',
          status: 'idle',
          model: 'gemini-3.8-flash',
          systemPrompt: 'حول النص الأصلي إلى 3 نسخ: 1- لهجة مصرية عفوية تسويقية، 2- خليجية رسمية، 3- فصحى أدبية مبهرة.',
          output: ''
        }
      },
      {
        id: 'node-4',
        type: 'finalResult',
        position: { x: 50, y: 220 },
        data: {
          label: 'مصفوفة اللهجات المقارنة',
          category: 'output',
          status: 'idle',
          output: ''
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
      { id: 'e1-3', source: 'node-1', target: 'node-3', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
      { id: 'e2-4', source: 'node-2', target: 'node-4', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
      { id: 'e3-4', source: 'node-3', target: 'node-4', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } }
    ]
  },
  {
    id: 'linkedin-viral-post',
    title: 'منشور لينكد إن قيادي وتفاعلي (Thought Leadership)',
    description: 'صياغة أفكار مهنية بهيكل بصري مريح للقراءة مع خطاف قوي وسؤال للنقاش.',
    category: 'social',
    complexity: 'مبتدئ',
    nodeCount: 3,
    tags: ['LinkedIn', 'علامة شخصية', 'قيادة فكرية'],
    icon: 'Linkedin',
    color: 'from-sky-500 to-blue-600',
    pipelinePreview: ['فكرة مهنية', 'صانع المحتوى القيادي', 'المنشور النهائي'],
    nodes: [
      {
        id: 'node-1',
        type: 'textInput',
        position: { x: 960, y: 150 },
        data: {
          label: 'الفكرة المهنية أو التجربة الشخصية',
          category: 'input',
          status: 'idle',
          text: 'بعد 10 سنوات من إدارة الفرق، اكتشفت أن أكبر خطأ يقع فيه المدير الجديد هو محاولة حل كل مشكلة بنفسه بدلاً من تمكين فريقه.',
          output: 'بعد 10 سنوات من إدارة الفرق، اكتشفت أن أكبر خطأ يقع فيه المدير الجديد هو محاولة حل كل مشكلة بنفسه بدلاً من تمكين فريقه.'
        }
      },
      {
        id: 'node-2',
        type: 'textAI',
        position: { x: 510, y: 150 },
        data: {
          label: 'صانع محتوى لينكد إن القيادي',
          category: 'ai',
          status: 'idle',
          model: 'gemini-3.8-flash',
          systemPrompt: 'اكتب منشور لينكد إن فيروسي وفق هيكل النخبة: 1- خطاف من سطرين يجبر على ضغط see more، 2- فراغات بيضاء بين السطور، 3- 3 نصائح عملية مرقمة، 4- خلاصة حكيمة، 5- سؤال نقاشي مثير للتعليقات.',
          output: ''
        }
      },
      {
        id: 'node-3',
        type: 'finalResult',
        position: { x: 60, y: 150 },
        data: {
          label: 'المنشور النهائي الجاهز للنشر',
          category: 'output',
          status: 'idle',
          output: ''
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true, style: { stroke: '#0284c7', strokeWidth: 2 } },
      { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } }
    ]
  },

  // ─── 3. السيو والمقالات الطويلة (SEO & Blogging) ─────────────────
  {
    id: 'seo-pillar-article-eeat',
    title: 'مقال ركيزة شامل متوافق مع معايير Google E-E-A-T',
    description: 'توليد مقال طويل من 2000 كلمة مع عناوين H2/H3، وتوزيع سليم للكلمات المفتاحية.',
    category: 'seo',
    complexity: 'متقدم',
    nodeCount: 5,
    tags: ['سيو', 'جوجل', 'E-E-A-T', 'مقال كامل'],
    icon: 'FileText',
    color: 'from-emerald-500 to-green-600',
    pipelinePreview: ['الكلمة المفتاحية', 'هيكل العناوين', 'كتابة المقال', 'مراجعة السيو', 'المخرجات'],
    nodes: [
      {
        id: 'node-1',
        type: 'textInput',
        position: { x: 1400, y: 220 },
        data: {
          label: 'الكلمة المفتاحية المستهدفة والجمهور',
          category: 'input',
          status: 'idle',
          text: 'الكلمة: أفضل أدوات الذكاء الاصطناعي للمتاجر الإلكترونية 2026. الجمهور: تجار سلة وزد وشوبيفاي.',
          output: 'الكلمة: أفضل أدوات الذكاء الاصطناعي للمتاجر الإلكترونية 2026. الجمهور: تجار سلة وزد وشوبيفاي.'
        }
      },
      {
        id: 'node-2',
        type: 'textAI',
        position: { x: 940, y: 100 },
        data: {
          label: 'مهندس هيكل العناوين (H2/H3 Outline)',
          category: 'ai',
          status: 'idle',
          model: 'gemini-3.8-flash',
          systemPrompt: 'ابنِ هيكل مقال ركيزة (Pillar Outline) يتضمن مقدمة جذابة، 6 أقسام رئيسية H2 مع تفريعات H3، وجدول مقارنة وخاتمة محفزة.',
          output: ''
        }
      },
      {
        id: 'node-3',
        type: 'textAI',
        position: { x: 500, y: 100 },
        data: {
          label: 'كاتب المحتوى المتعمق بمعايير E-E-A-T',
          category: 'ai',
          status: 'idle',
          model: 'gemini-3.8-flash',
          systemPrompt: 'اكتب المقال كاملاً بأسلوب غني بالخبرة العملية والأمثلة الواقعية مع تدعيم البنود بنصائح حصرية للمتاجر.',
          output: ''
        }
      },
      {
        id: 'node-4',
        type: 'jsonExtractor',
        position: { x: 500, y: 380 },
        data: {
          label: 'مستخرج بيانات السيو (Schema & Meta)',
          category: 'utility',
          status: 'idle',
          fields: 'عنوان_الميتا, وصف_الميتا, الكلمات_المفتاحية_المقترحة, الرابط_الدائم',
          format: 'json',
          output: ''
        }
      },
      {
        id: 'node-5',
        type: 'finalResult',
        position: { x: 50, y: 220 },
        data: {
          label: 'المقال الكامل المهيأ للنشر الفوري',
          category: 'output',
          status: 'idle',
          output: ''
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true, style: { stroke: '#059669', strokeWidth: 2 } },
      { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true, style: { stroke: '#059669', strokeWidth: 2 } },
      { id: 'e3-4', source: 'node-3', target: 'node-4', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 } },
      { id: 'e3-5', source: 'node-3', target: 'node-5', animated: true, style: { stroke: '#059669', strokeWidth: 2 } },
      { id: 'e4-5', source: 'node-4', target: 'node-5', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } }
    ]
  },
  {
    id: 'meta-tags-keywords-extractor',
    title: 'مستخرج الكلمات المفتاحية ومولد الميتا تاغز',
    description: 'استخراج الكيانات الرئيسية، وتوليد 5 عناوين Title و Meta Descriptions متوافقة الحجم.',
    category: 'seo',
    complexity: 'مبتدئ',
    nodeCount: 3,
    tags: ['ميتا تاغ', 'سيو تقني', 'عناوين'],
    icon: 'Search',
    color: 'from-cyan-500 to-blue-600',
    pipelinePreview: ['نص المقال', 'استخراج السيو', 'جدول الميتا'],
    nodes: [
      {
        id: 'node-1',
        type: 'textInput',
        position: { x: 960, y: 150 },
        data: {
          label: 'نص المقال أو ملخص الصفحة',
          category: 'input',
          status: 'idle',
          text: 'دليل شامل لتعلم البرمجة بلغة بايثون من الصفر حتى الاحتراف مع تطبيقات عملية في تحليل البيانات والذكاء الاصطناعي.',
          output: 'دليل شامل لتعلم البرمجة بلغة بايثون من الصفر حتى الاحتراف مع تطبيقات عملية في تحليل البيانات والذكاء الاصطناعي.'
        }
      },
      {
        id: 'node-2',
        type: 'jsonExtractor',
        position: { x: 510, y: 150 },
        data: {
          label: 'مستخرج وسوم الميتا المهيكلة',
          category: 'utility',
          status: 'idle',
          fields: 'العناوين_المقترحة_60_حرف, أوصاف_الميتا_155_حرف, الكلمات_المفتاحية_LSI, وسم_OG_Title',
          format: 'json',
          output: ''
        }
      },
      {
        id: 'node-3',
        type: 'finalResult',
        position: { x: 60, y: 150 },
        data: {
          label: 'جدول وسوم الميتا الجاهز للإدراج',
          category: 'output',
          status: 'idle',
          output: ''
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true, style: { stroke: '#06b6d4', strokeWidth: 2 } },
      { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } }
    ]
  },
  {
    id: 'faq-schema-generator',
    title: 'مولد الأسئلة الشائعة المهيكلة (FAQPage Schema JSON-LD)',
    description: 'تحويل أسئلة العملاء وإجابات المقال إلى كود JSON-LD جاهز للظهور في النتيجة الصفرية.',
    category: 'seo',
    complexity: 'متوسط',
    nodeCount: 4,
    tags: ['JSON-LD', 'Schema', 'النتيجة الصفرية'],
    icon: 'Code',
    color: 'from-teal-500 to-emerald-600',
    pipelinePreview: ['الموضوع أو المقال', 'استخراج الأسئلة', 'بناء JSON Schema', 'فحص الصحة'],
    nodes: [
      {
        id: 'node-1',
        type: 'textInput',
        position: { x: 1350, y: 180 },
        data: {
          label: 'الموضوع أو محتوى المقال الأصلي',
          category: 'input',
          status: 'idle',
          text: 'الشحن والتوصيل في متجرنا: يستغرق التوصيل داخل الرياض 24 ساعة، وباقي المدن 2-4 أيام عمل. الشحن مجاني للطلبات فوق 200 ريال. الاسترجاع متاح خلال 14 يوماً.',
          output: 'الشحن والتوصيل في متجرنا: يستغرق التوصيل داخل الرياض 24 ساعة، وباقي المدن 2-4 أيام عمل. الشحن مجاني للطلبات فوق 200 ريال. الاسترجاع متاح خلال 14 يوماً.'
        }
      },
      {
        id: 'node-2',
        type: 'textAI',
        position: { x: 890, y: 100 },
        data: {
          label: 'استخراج وتوليد أكثر 4 أسئلة شائعة',
          category: 'ai',
          status: 'idle',
          model: 'gemini-3.8-flash',
          systemPrompt: 'استخرج من النص أكثر 4 أسئلة يبحث عنها العملاء واكتب إجابات مباشرة وموجزة جداً لكل سؤال.',
          output: ''
        }
      },
      {
        id: 'node-3',
        type: 'structuredOutput',
        position: { x: 480, y: 100 },
        data: {
          label: 'بناء كود FAQPage Schema (JSON-LD)',
          category: 'utility',
          status: 'idle',
          output: ''
        }
      },
      {
        id: 'node-4',
        type: 'finalResult',
        position: { x: 50, y: 180 },
        data: {
          label: 'كود السكيما المعتمد من جوجل',
          category: 'output',
          status: 'idle',
          output: ''
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true, style: { stroke: '#14b8a6', strokeWidth: 2 } },
      { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true, style: { stroke: '#14b8a6', strokeWidth: 2 } },
      { id: 'e3-4', source: 'node-3', target: 'node-4', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } }
    ]
  },
  {
    id: 'content-refresher-updater',
    title: 'محدّث ومدقق المقالات القديمة لإنعاش الترتيب',
    description: 'سحب محتوى مقال قديم من رابط ويب، فحص الثغرات، وإضافة أحدث إحصائيات 2026.',
    category: 'seo',
    complexity: 'متوسط',
    nodeCount: 4,
    tags: ['تحديث محتوى', 'سحب ويب', 'ترتيب جوجل'],
    icon: 'RefreshCw',
    color: 'from-lime-500 to-emerald-600',
    pipelinePreview: ['رابط المقال', 'سحب المحتوى', 'إعادة الصياغة والتحديث', 'المقال المحدث'],
    nodes: [
      {
        id: 'node-1',
        type: 'urlScraper',
        position: { x: 1350, y: 180 },
        data: {
          label: 'رابط المقال القديم المراد تحديثه',
          category: 'input',
          status: 'idle',
          url: 'https://example.com/blog/marketing-guide-2023',
          output: 'دليل التسويق الرقمي لعام 2023: التركيز على إعلانات فيسبوك والتسويق بالمحتوى والرسائل النصية.'
        }
      },
      {
        id: 'node-2',
        type: 'webSearch',
        position: { x: 900, y: 80 },
        data: {
          label: 'بحث ويب حي عن أحدث اتجاهات 2026',
          category: 'input',
          status: 'idle',
          searchQuery: 'latest digital marketing trends 2026 ai tools',
          output: ''
        }
      },
      {
        id: 'node-3',
        type: 'textAI',
        position: { x: 480, y: 180 },
        data: {
          label: 'إعادة الصياغة والتحديث الشامل لـ 2026',
          category: 'ai',
          status: 'idle',
          model: 'gemini-3.8-flash',
          systemPrompt: 'ادمج المقال الأصلي مع نتائج البحث الجديدة، استبدل الإحصائيات القديمة، وأضف قسماً جديداً عن أدوات الأتمتة الحديثة.',
          output: ''
        }
      },
      {
        id: 'node-4',
        type: 'finalResult',
        position: { x: 50, y: 180 },
        data: {
          label: 'المقال المحدث الجاهز لإنعاش الترتيب',
          category: 'output',
          status: 'idle',
          output: ''
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true, style: { stroke: '#84cc16', strokeWidth: 2 } },
      { id: 'e1-3', source: 'node-1', target: 'node-3', animated: true, style: { stroke: '#84cc16', strokeWidth: 2 } },
      { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true, style: { stroke: '#84cc16', strokeWidth: 2 } },
      { id: 'e3-4', source: 'node-3', target: 'node-4', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } }
    ]
  },

  // ─── 4. الأعمال وتحليل البيانات (Business & Data Intelligence) ───
  {
    id: 'legal-contract-analyzer',
    title: 'محلل العقود القانونية وكشف بنود المخاطر',
    description: 'قراءة ملف العقد، استخراج التزامات الأطراف، الشروط الجزائية، وتنبيهات المخاطر القانونية.',
    category: 'business',
    complexity: 'متقدم',
    nodeCount: 4,
    tags: ['قانوني', 'عقود', 'تحليل مخاطر'],
    icon: 'ShieldAlert',
    color: 'from-rose-500 to-red-600',
    pipelinePreview: ['رفع العقد PDF/TXT', 'الفحص والتدقيق', 'تقرير المخاطر', 'الملخص النهائي'],
    nodes: [
      {
        id: 'node-1',
        type: 'fileUpload',
        position: { x: 1350, y: 180 },
        data: {
          label: 'رفع مستند العقد (PDF / DOCX / TXT)',
          category: 'input',
          status: 'idle',
          fileName: 'service_agreement_v2.pdf',
          output: 'اتفاقية تقديم خدمات تقنية: يلتزم الطرف الثاني بتسليم المنظومة خلال 60 يوماً. الشرط الجزائي: 5% عن كل يوم تأخير بدون حد أقصى. الملكية الفكرية تظل للطرف الأول فقط.'
        }
      },
      {
        id: 'node-2',
        type: 'textAI',
        position: { x: 900, y: 100 },
        data: {
          label: 'فحص بنود العقد والالتزامات',
          category: 'ai',
          status: 'idle',
          model: 'gemini-3.8-flash',
          systemPrompt: 'راجع بنود هذا العقد واستخرج: 1- التزامات الطرفين الأساسية، 2- الشروط الجزائية والغرامات، 3- آلية إنهاء العقد وفترة الإخطار.',
          output: ''
        }
      },
      {
        id: 'node-3',
        type: 'structuredOutput',
        position: { x: 480, y: 100 },
        data: {
          label: 'تصنيف بنود المخاطر (احمرار/اصفرار/أخضر)',
          category: 'utility',
          status: 'idle',
          output: ''
        }
      },
      {
        id: 'node-4',
        type: 'finalResult',
        position: { x: 50, y: 180 },
        data: {
          label: 'التقرير التنفيذي القانوني الشامل',
          category: 'output',
          status: 'idle',
          output: ''
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true, style: { stroke: '#f43f5e', strokeWidth: 2 } },
      { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true, style: { stroke: '#f43f5e', strokeWidth: 2 } },
      { id: 'e3-4', source: 'node-3', target: 'node-4', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } }
    ]
  },
  {
    id: 'csv-sales-insights',
    title: 'محلل مبيعات CSV ومولد التقارير التنفيذية',
    description: 'استخراج الأنماط، أعلى المنتجات مبيعاً، ومعدلات النمو من جداول المبيعات بنقرة زر.',
    category: 'business',
    complexity: 'متوسط',
    nodeCount: 4,
    tags: ['بيانات', 'CSV', 'تحليل مالي', 'تقارير'],
    icon: 'BarChart3',
    color: 'from-blue-600 to-cyan-600',
    pipelinePreview: ['ملف CSV', 'تحليل البيانات', 'استخراج الرؤى', 'تقرير تنفيذي'],
    nodes: [
      {
        id: 'node-1',
        type: 'fileUpload',
        position: { x: 1350, y: 180 },
        data: {
          label: 'جدول بيانات المبيعات (CSV / Sheet)',
          category: 'input',
          status: 'idle',
          fileName: 'sales_q3_report.csv',
          output: 'المنتج,الفئة,الكمية,الإيراد_الإجمالي,المدينة\nسماعات برو,إلكترونيات,450,135000,الرياض\nشاحن سريع,إلكترونيات,890,71200,جدة\nكفر جلدي,إكسسوار,1200,60000,الدمام'
        }
      },
      {
        id: 'node-2',
        type: 'jsonExtractor',
        position: { x: 900, y: 100 },
        data: {
          label: 'هيكلة واستخراج المؤشرات المالية',
          category: 'utility',
          status: 'idle',
          fields: 'إجمالي_المبيعات, أعلى_منتج_إيراداً, أعلى_مدينة_طلباً, فئات_النمو',
          format: 'json',
          output: ''
        }
      },
      {
        id: 'node-3',
        type: 'textAI',
        position: { x: 480, y: 100 },
        data: {
          label: 'صانع التقرير الاستراتيجي والتوصيات',
          category: 'ai',
          status: 'idle',
          model: 'gemini-3.8-flash',
          systemPrompt: 'اكتب تقريراً تنفيذياً موجزاً للإدارة العليا بناءً على البيانات مع اقتراح 3 قرارات استراتيجية لزيادة الربحية في الربع القادم.',
          output: ''
        }
      },
      {
        id: 'node-4',
        type: 'finalResult',
        position: { x: 50, y: 180 },
        data: {
          label: 'لوحة التقرير التنفيذي للقيادة',
          category: 'output',
          status: 'idle',
          output: ''
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true, style: { stroke: '#2563eb', strokeWidth: 2 } },
      { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true, style: { stroke: '#2563eb', strokeWidth: 2 } },
      { id: 'e3-4', source: 'node-3', target: 'node-4', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } }
    ]
  },
  {
    id: 'customer-reviews-sentiment',
    title: 'محلل مشاعر وآراء العملاء (Sentiment Analysis)',
    description: 'تصنيف المراجعات إلى إيجابية وسلبية وتوليد خطة عملية لتحسين تجربة المستخدم.',
    category: 'business',
    complexity: 'متوسط',
    nodeCount: 4,
    tags: ['مشاعر', 'تقييمات', 'خدمة عملاء'],
    icon: 'Smile',
    color: 'from-amber-500 to-yellow-600',
    pipelinePreview: ['نصوص التقييمات', 'تحليل المشاعر', 'تصنيف JSON', 'توصيات التحسين'],
    nodes: [
      {
        id: 'node-1',
        type: 'textInput',
        position: { x: 1350, y: 180 },
        data: {
          label: 'نصوص مراجعات وتقييمات العملاء',
          category: 'input',
          status: 'idle',
          text: '1. التطبيق سريع جداً لكن واجهة الدفع تعلق أحياناً.\n2. التوصيل تأخر يومين وخدمة العملاء لم ترد بسرعة.\n3. جودة المنتج ممتازة وسأطلب مجدداً بالتأكيد!',
          output: '1. التطبيق سريع جداً لكن واجهة الدفع تعلق أحياناً.\n2. التوصيل تأخر يومين وخدمة العملاء لم ترد بسرعة.\n3. جودة المنتج ممتازة وسأطلب مجدداً بالتأكيد!'
        }
      },
      {
        id: 'node-2',
        type: 'textAI',
        position: { x: 900, y: 100 },
        data: {
          label: 'محرك تحليل المشاعر واستخراج نقاط الألم',
          category: 'ai',
          status: 'idle',
          model: 'gemini-3.8-flash',
          systemPrompt: 'صنف كل تقييم إلى (إيجابي، سلبي، محايد) واستخرج نقاط الألم المتكررة (Pain Points) المؤثرة على رضا العميل.',
          output: ''
        }
      },
      {
        id: 'node-3',
        type: 'jsonExtractor',
        position: { x: 480, y: 100 },
        data: {
          label: 'هيكلة النتائج (JSON Metrics)',
          category: 'utility',
          status: 'idle',
          fields: 'نسبة_الرضا, المشاكل_الحرجة, نقاط_القوة, إجراءات_عاجلة',
          format: 'json',
          output: ''
        }
      },
      {
        id: 'node-4',
        type: 'finalResult',
        position: { x: 50, y: 180 },
        data: {
          label: 'تقرير خطة تحسين تجربة العملاء (CX)',
          category: 'output',
          status: 'idle',
          output: ''
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true, style: { stroke: '#d97706', strokeWidth: 2 } },
      { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true, style: { stroke: '#d97706', strokeWidth: 2 } },
      { id: 'e3-4', source: 'node-3', target: 'node-4', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } }
    ]
  },
  {
    id: 'business-proposal-builder',
    title: 'صانع العروض الفنية والمالية (B2B Proposals)',
    description: 'بناء عرض عمل احترافي يضم نطاق المشروع، الجدول الزمني، والميزانية المتوقعة.',
    category: 'business',
    complexity: 'متوسط',
    nodeCount: 3,
    tags: ['مقترحات', 'B2B', 'إدارة مشاريع'],
    icon: 'Briefcase',
    color: 'from-indigo-500 to-blue-600',
    pipelinePreview: ['متطلبات العميل', 'كتابة المقترح الفني', 'المستند الكامل'],
    nodes: [
      {
        id: 'node-1',
        type: 'textInput',
        position: { x: 960, y: 150 },
        data: {
          label: 'متطلبات العميل ونطاق العمل',
          category: 'input',
          status: 'idle',
          text: 'العميل: جهة شبه حكومية. المطلوب: تطوير بوابة رقمية لإصدار التراخيص الفورية وربطها بالهوية الوطنية مع جدول زمني 3 أشهر.',
          output: 'العميل: جهة شبه حكومية. المطلوب: تطوير بوابة رقمية لإصدار التراخيص الفورية وربطها بالهوية الوطنية مع جدول زمني 3 أشهر.'
        }
      },
      {
        id: 'node-2',
        type: 'textAI',
        position: { x: 500, y: 150 },
        data: {
          label: 'صانع العرض الفني والمالي المهني',
          category: 'ai',
          status: 'idle',
          model: 'gemini-3.8-flash',
          systemPrompt: 'اكتب عرض عمل احترافي متكامل: 1- الملخص التنفيذي، 2- نطاق العمل ومراحل التنفيذ الثلاث، 3- المخرجات المتوقعة، 4- الميزانية التقديرية وشروط الدفع.',
          output: ''
        }
      },
      {
        id: 'node-3',
        type: 'finalResult',
        position: { x: 50, y: 150 },
        data: {
          label: 'وثيقة المقترح التجاري الجاهزة للتقديم',
          category: 'output',
          status: 'idle',
          output: ''
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } },
      { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } }
    ]
  },

  // ─── 5. الأتمتة والربط الخارجي (Automation & APIs) ────────────────
  {
    id: 'webhook-slack-telegram-alert',
    title: 'مراقبة الأخبار والويب وإرسال تنبيهات تلقائية',
    description: 'بحث الويب الحي حول موضوع معين، تلخيص أبرز الأخبار، وإرسالها فوراً إلى Webhook.',
    category: 'automation',
    complexity: 'متوسط',
    nodeCount: 4,
    tags: ['Webhook', 'بحث ويب', 'أتمتة', 'Slack/Telegram'],
    icon: 'Send',
    color: 'from-sky-500 to-cyan-600',
    pipelinePreview: ['بحث ويب حي', 'تلخيص ذكي', 'صياغة الرسالة', 'إرسال Webhook'],
    nodes: [
      {
        id: 'node-1',
        type: 'webSearch',
        position: { x: 1350, y: 180 },
        data: {
          label: 'بحث ويب مباشر عن أحدث الأخبار',
          category: 'input',
          status: 'idle',
          searchQuery: 'AI agents latest developments Middle East 2026',
          output: ''
        }
      },
      {
        id: 'node-2',
        type: 'textAI',
        position: { x: 900, y: 100 },
        data: {
          label: 'تلخيص الأخبار وصياغة التنبيه الموجز',
          category: 'ai',
          status: 'idle',
          model: 'gemini-3.8-flash',
          systemPrompt: 'لخص نتائج البحث في 3 نقاط محددة جداً مع إيموجيز مناسبة لتكون صالحة كرسالة تنبيه فوري لفريق العمل.',
          output: ''
        }
      },
      {
        id: 'node-3',
        type: 'webhookOutput',
        position: { x: 480, y: 100 },
        data: {
          label: 'إرسال التنبيه إلى Slack / Telegram Webhook',
          category: 'output',
          status: 'idle',
          output: ''
        }
      },
      {
        id: 'node-4',
        type: 'finalResult',
        position: { x: 50, y: 180 },
        data: {
          label: 'سجل التنبيهات المرسلة وحالة التسليم',
          category: 'output',
          status: 'idle',
          output: ''
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true, style: { stroke: '#0284c7', strokeWidth: 2 } },
      { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true, style: { stroke: '#0284c7', strokeWidth: 2 } },
      { id: 'e3-4', source: 'node-3', target: 'node-4', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } }
    ]
  },
  {
    id: 'batch-product-translation',
    title: 'معالجة دفعية (Batch Loop) لترجمة وتخصيص المنتجات',
    description: 'المرور على قائمة منتجات متجر وترجمتها وإعادة صياغة العناوين وتصديرها كـ JSON.',
    category: 'automation',
    complexity: 'متقدم',
    nodeCount: 5,
    tags: ['Batch Loop', 'ترجمة دفعية', 'تخصيص'],
    icon: 'Repeat',
    color: 'from-violet-500 to-purple-600',
    pipelinePreview: ['قائمة المنتجات', 'حلقة تكرار Batch', 'ترجمة وتعديل', 'تجميع JSON', 'تصدير'],
    nodes: [
      {
        id: 'node-1',
        type: 'textInput',
        position: { x: 1400, y: 200 },
        data: {
          label: 'قائمة المنتجات المراد معالجتها',
          category: 'input',
          status: 'idle',
          text: 'Wireless Noise Cancelling Earbuds\nErgonomic Memory Foam Pillow\nUltra Fast 100W GaN Wall Charger',
          output: 'Wireless Noise Cancelling Earbuds\nErgonomic Memory Foam Pillow\nUltra Fast 100W GaN Wall Charger'
        }
      },
      {
        id: 'node-2',
        type: 'batchLoop',
        position: { x: 960, y: 120 },
        data: {
          label: 'حلقة التكرار الدفعية (Batch Loop)',
          category: 'control',
          status: 'idle',
          batchDelimiter: 'newline',
          output: ''
        }
      },
      {
        id: 'node-3',
        type: 'textAI',
        position: { x: 520, y: 80 },
        data: {
          label: 'ترجمة وصياغة عنوان عربي تجاري جذاب',
          category: 'ai',
          status: 'idle',
          model: 'gemini-3.8-flash',
          systemPrompt: 'ترجم اسم المنتج إلى العربية الفصحى التسويقية وصغ معه وصفاً تسويقياً من جملة واحدة.',
          output: ''
        }
      },
      {
        id: 'node-4',
        type: 'jsonExtractor',
        position: { x: 520, y: 360 },
        data: {
          label: 'تجميع الكتالوج المترجم (JSON Schema)',
          category: 'utility',
          status: 'idle',
          fields: 'الاسم_العربي, الوصف_المختصر, التصنيف_المقترح',
          format: 'json',
          output: ''
        }
      },
      {
        id: 'node-5',
        type: 'finalResult',
        position: { x: 50, y: 200 },
        data: {
          label: 'ملف الكتالوج المترجم المجمع للتصدير',
          category: 'output',
          status: 'idle',
          output: ''
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true, style: { stroke: '#7c3aed', strokeWidth: 2 } },
      { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true, style: { stroke: '#7c3aed', strokeWidth: 2 } },
      { id: 'e3-4', source: 'node-3', target: 'node-4', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 } },
      { id: 'e4-5', source: 'node-4', target: 'node-5', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } }
    ]
  },
  {
    id: 'smart-conditional-router',
    title: 'موجّه ذكي شرطي (If/Else Router) لخدمة العملاء',
    description: 'تحليل نية العميل وتوجيه استفسارات الدعم الفني لمسار والمبيعات لمسار منفصل.',
    category: 'automation',
    complexity: 'متوسط',
    nodeCount: 5,
    tags: ['شروط If/Else', 'توجيه ذكي', 'دعم فني'],
    icon: 'GitFork',
    color: 'from-orange-500 to-amber-600',
    pipelinePreview: ['رسالة العميل', 'تحليل النية', 'عقدة شرطية If/Else', 'رد الدعم / رد المبيعات'],
    nodes: [
      {
        id: 'node-1',
        type: 'textInput',
        position: { x: 1400, y: 220 },
        data: {
          label: 'رسالة أو تذكرة العميل الواردة',
          category: 'input',
          status: 'idle',
          text: 'مرحباً، اشتريت باقة Pro لكن الفاتورة تم سحبها مرتين والحساب لم يتفعل حتى الآن.',
          output: 'مرحباً، اشتريت باقة Pro لكن الفاتورة تم سحبها مرتين والحساب لم يتفعل حتى الآن.'
        }
      },
      {
        id: 'node-2',
        type: 'textAI',
        position: { x: 950, y: 100 },
        data: {
          label: 'محلل نية العميل (Intent Classifier)',
          category: 'ai',
          status: 'idle',
          model: 'gemini-3.8-flash',
          systemPrompt: 'حدد نية العميل في كلمة واحدة فقط: إما SUPPORT إذا كانت شكوى أو مشكلة، أو SALES إذا كان استفسار شراء.',
          output: ''
        }
      },
      {
        id: 'node-3',
        type: 'conditional',
        position: { x: 540, y: 100 },
        data: {
          label: 'التوجيه الشرطي (If Intent == SUPPORT)',
          category: 'control',
          status: 'idle',
          conditionType: 'contains',
          conditionValue: 'SUPPORT',
          output: ''
        }
      },
      {
        id: 'node-4',
        type: 'textAI',
        position: { x: 540, y: 380 },
        data: {
          label: 'صياغة رد الدعم الفني والاعتذار الفوري',
          category: 'ai',
          status: 'idle',
          model: 'gemini-3.8-flash',
          systemPrompt: 'اكتب رداً مهنياً عطوفاً يعتذر عن الخطأ ويطلب رقم العملية ويعد بحلها خلال ساعتين.',
          output: ''
        }
      },
      {
        id: 'node-5',
        type: 'finalResult',
        position: { x: 50, y: 220 },
        data: {
          label: 'الرد الموجه التلقائي المعتمد',
          category: 'output',
          status: 'idle',
          output: ''
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true, style: { stroke: '#ea580c', strokeWidth: 2 } },
      { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true, style: { stroke: '#ea580c', strokeWidth: 2 } },
      { id: 'e3-4', source: 'node-3', target: 'node-4', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 } },
      { id: 'e4-5', source: 'node-4', target: 'node-5', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } }
    ]
  },
  {
    id: 'api-data-enrichment',
    title: 'جلب بيانات من REST API وتحليلها بالذكاء الاصطناعي',
    description: 'إرسال طلب HTTP GET إلى واجهة برمجية وتمرير البيانات المرجعة لتلخيصها.',
    category: 'automation',
    complexity: 'متوسط',
    nodeCount: 4,
    tags: ['HTTP API', 'JSON', 'تكامل برمجيات'],
    icon: 'Globe',
    color: 'from-teal-500 to-cyan-600',
    pipelinePreview: ['طلب HTTP', 'استخراج البيانات', 'تحليل الذكاء الاصطناعي', 'التقرير النهائي'],
    nodes: [
      {
        id: 'node-1',
        type: 'httpRequest',
        position: { x: 1350, y: 180 },
        data: {
          label: 'طلب REST API خارجي (HTTP GET)',
          category: 'http',
          status: 'idle',
          url: 'https://jsonplaceholder.typicode.com/posts/1',
          method: 'GET',
          output: '{\n  "userId": 1,\n  "id": 1,\n  "title": "sunt aut facere repellat provident",\n  "body": "quia et suscipit suscipit recusandae consequuntur expedita et cum"\n}'
        }
      },
      {
        id: 'node-2',
        type: 'jsonExtractor',
        position: { x: 900, y: 100 },
        data: {
          label: 'استخراج الحقول الأساسية من JSON',
          category: 'utility',
          status: 'idle',
          fields: 'title, body, userId',
          format: 'json',
          output: ''
        }
      },
      {
        id: 'node-3',
        type: 'textAI',
        position: { x: 480, y: 100 },
        data: {
          label: 'تحليل وتلخيص بيانات الـ API المرجعة',
          category: 'ai',
          status: 'idle',
          model: 'gemini-3.8-flash',
          systemPrompt: 'حلل البيانات المستلمة وصغ ملخصاً عربياً واضحاً يشرح أهم ما ورد فيها وتأثيره العملي.',
          output: ''
        }
      },
      {
        id: 'node-4',
        type: 'finalResult',
        position: { x: 50, y: 180 },
        data: {
          label: 'التقرير المعزز بالبيانات الخارجية',
          category: 'output',
          status: 'idle',
          output: ''
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true, style: { stroke: '#0d9488', strokeWidth: 2 } },
      { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true, style: { stroke: '#0d9488', strokeWidth: 2 } },
      { id: 'e3-4', source: 'node-3', target: 'node-4', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } }
    ]
  },

  // ─── 6. الوسائط والصوتيات (Multimodal & Media) ───────────────────
  {
    id: 'podcast-audio-with-cover',
    title: 'تحويل مقال إلى بودكاست صوتي مسموع + غلاف مخصص',
    description: 'قراءة المقال، تحويله لأسلوب حواري ممتع، تشغيل التعليق الصوتي، وتوليد غلاف بودكاست.',
    category: 'media',
    complexity: 'متقدم',
    nodeCount: 5,
    tags: ['بودكاست', 'صوت TTS', 'صورة غلاف'],
    icon: 'Headphones',
    color: 'from-purple-500 to-fuchsia-600',
    pipelinePreview: ['المقال الأصلي', 'تحويل لأسلوب حواري', 'تعليق صوتي TTS', 'توليد الغلاف', 'المشغل النهائي'],
    nodes: [
      {
        id: 'node-1',
        type: 'textInput',
        position: { x: 1400, y: 220 },
        data: {
          label: 'نص المقال أو الفكرة المحورية',
          category: 'input',
          status: 'idle',
          text: 'كيف تغير الحوسبة الكمية مستقبل الأمن السيبراني ولماذا تتسابق الدول لحماية بنيتها التحتية المشفرة.',
          output: 'كيف تغير الحوسبة الكمية مستقبل الأمن السيبراني ولماذا تتسابق الدول لحماية بنيتها التحتية المشفرة.'
        }
      },
      {
        id: 'node-2',
        type: 'textAI',
        position: { x: 940, y: 80 },
        data: {
          label: 'إعادة الصياغة إلى سيناريو بودكاست مسموع',
          category: 'ai',
          status: 'idle',
          model: 'gemini-3.8-flash',
          systemPrompt: 'حول المقال إلى نص بودكاست حواري دافئ وشيق يبدأ بترحيب جذاب ويسهل قراءته صوتياً بسلاسة.',
          output: ''
        }
      },
      {
        id: 'node-3',
        type: 'audioVoice',
        position: { x: 500, y: 80 },
        data: {
          label: 'توليد الصوت البشري (ElevenLabs / Web TTS)',
          category: 'ai',
          status: 'idle',
          audioModel: 'eleven_multilingual_v2',
          voiceName: 'Adam',
          output: ''
        }
      },
      {
        id: 'node-4',
        type: 'imageAI',
        position: { x: 500, y: 400 },
        data: {
          label: 'توليد غلاف البودكاست السينمائي (Cover Art)',
          category: 'ai',
          status: 'idle',
          model: 'google-imagen-3',
          imagePrompt: 'Podcast square cover art, quantum cyber security abstract glowing visual, studio microphone silhouette, modern typography aesthetic 8k',
          imageUrl: '',
          output: ''
        }
      },
      {
        id: 'node-5',
        type: 'finalResult',
        position: { x: 50, y: 220 },
        data: {
          label: 'حلقة البودكاست والغلاف الجاهزان للنشر',
          category: 'output',
          status: 'idle',
          output: ''
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true, style: { stroke: '#9333ea', strokeWidth: 2 } },
      { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true, style: { stroke: '#9333ea', strokeWidth: 2 } },
      { id: 'e2-4', source: 'node-2', target: 'node-4', animated: true, style: { stroke: '#ec4899', strokeWidth: 2 } },
      { id: 'e3-5', source: 'node-3', target: 'node-5', animated: true, style: { stroke: '#9333ea', strokeWidth: 2 } },
      { id: 'e4-5', source: 'node-4', target: 'node-5', animated: true, style: { stroke: '#ec4899', strokeWidth: 2 } }
    ]
  },
  {
    id: 'children-story-teller',
    title: 'راوي قصص الأطفال التفاعلي (نص + صوت + رسوم)',
    description: 'تأليف قصة تعليمية هادفة للأطفال، قراءتها بنبرة دافئة، ورسم مشاهد كرتونية ملونة.',
    category: 'media',
    complexity: 'متقدم',
    nodeCount: 5,
    tags: ['قصص أطفال', 'كرتون', 'صوتيات', 'صور'],
    icon: 'BookOpen',
    color: 'from-pink-500 to-rose-600',
    pipelinePreview: ['فكرة القصة', 'تأليف المشاهد', 'تعليق صوتي', 'رسم كرتوني', 'المكتبة'],
    nodes: [
      {
        id: 'node-1',
        type: 'textInput',
        position: { x: 1400, y: 220 },
        data: {
          label: 'فكرة القصة وقيمتها التربوية',
          category: 'input',
          status: 'idle',
          text: 'قصة أرنوب الصغير الذي تعلم أهمية الصدق والاعتذار عند ارتكاب خطأ في حديقة الجزرة.',
          output: 'قصة أرنوب الصغير الذي تعلم أهمية الصدق والاعتذار عند ارتكاب خطأ في حديقة الجزرة.'
        }
      },
      {
        id: 'node-2',
        type: 'textAI',
        position: { x: 940, y: 80 },
        data: {
          label: 'تأليف فصول القصة بأسلوب أطفال شيق',
          category: 'ai',
          status: 'idle',
          model: 'gemini-3.8-flash',
          systemPrompt: 'ألف قصة ممتعة للأطفال من 3 مشاهد قصيرة بلغة عربية مبسطة ومليئة بالأمل والتشويق.',
          output: ''
        }
      },
      {
        id: 'node-3',
        type: 'audioVoice',
        position: { x: 500, y: 80 },
        data: {
          label: 'راوي القصة الصوتي بنبرة دافئة',
          category: 'ai',
          status: 'idle',
          voiceName: 'Sarah',
          output: ''
        }
      },
      {
        id: 'node-4',
        type: 'imageAI',
        position: { x: 500, y: 400 },
        data: {
          label: 'رسم المشهد الكرتوني التوضيحي',
          category: 'ai',
          status: 'idle',
          model: 'google-imagen-3',
          imagePrompt: 'Cute 3D Pixar Disney style baby bunny in a vibrant sunny magical carrot garden, storybook illustration, happy colors',
          imageUrl: '',
          output: ''
        }
      },
      {
        id: 'node-5',
        type: 'finalResult',
        position: { x: 50, y: 220 },
        data: {
          label: 'القصة التفاعلية الكاملة للأطفال',
          category: 'output',
          status: 'idle',
          output: ''
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true, style: { stroke: '#ec4899', strokeWidth: 2 } },
      { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true, style: { stroke: '#ec4899', strokeWidth: 2 } },
      { id: 'e2-4', source: 'node-2', target: 'node-4', animated: true, style: { stroke: '#f43f5e', strokeWidth: 2 } },
      { id: 'e3-5', source: 'node-3', target: 'node-5', animated: true, style: { stroke: '#ec4899', strokeWidth: 2 } },
      { id: 'e4-5', source: 'node-4', target: 'node-5', animated: true, style: { stroke: '#f43f5e', strokeWidth: 2 } }
    ]
  },
  {
    id: 'visual-brand-asset-creator',
    title: 'مصمم هوية العلامة التجارية (ألوان + شعار + بنرات)',
    description: 'تحويل رؤية الشركة إلى لوحة ألوان متناسقة، وصف للشعار، وتوليد بنرات شبكات اجتماعية.',
    category: 'media',
    complexity: 'متوسط',
    nodeCount: 4,
    tags: ['براندينج', 'صور وتصميم', 'هوية بصرية'],
    icon: 'Palette',
    color: 'from-indigo-500 to-purple-600',
    pipelinePreview: ['رؤية البراند', 'لوحة الألوان والأسلوب', 'أمر توليد الشعار', 'معرض التصاميم'],
    nodes: [
      {
        id: 'node-1',
        type: 'textInput',
        position: { x: 1350, y: 180 },
        data: {
          label: 'رؤية الشركة وقيم البراند الأساسية',
          category: 'input',
          status: 'idle',
          text: 'اسم الشركة: نماء فينتك. التخصص: استثمارات رقمية ذكية. الشعور المستهدف: ثقة وأمان وتطور تقني حديث.',
          output: 'اسم الشركة: نماء فينتك. التخصص: استثمارات رقمية ذكية. الشعور المستهدف: ثقة وأمان وتطور تقني حديث.'
        }
      },
      {
        id: 'node-2',
        type: 'textAI',
        position: { x: 900, y: 100 },
        data: {
          label: 'تحديد باليتة الألوان ودليل الهوية',
          category: 'ai',
          status: 'idle',
          model: 'gemini-3.8-flash',
          systemPrompt: 'اقترح لوحة ألوان مع كود Hex لكل لون، وحدد الخطوط المناسبة، ثم اكتب برومبت إنجليزي فائق الدقة لرسم الشعار.',
          output: ''
        }
      },
      {
        id: 'node-3',
        type: 'imageAI',
        position: { x: 480, y: 100 },
        data: {
          label: 'توليد الشعار والأصول البصرية',
          category: 'ai',
          status: 'idle',
          model: 'google-imagen-3',
          imagePrompt: 'Minimalist modern fintech logo emblem, abstract geometric letter N growth arrow, gradient emerald and royal blue, clean white background, vector design 8k',
          imageUrl: '',
          output: ''
        }
      },
      {
        id: 'node-4',
        type: 'finalResult',
        position: { x: 50, y: 180 },
        data: {
          label: 'كتيب الهوية البصرية الجاهز للاستخدام',
          category: 'output',
          status: 'idle',
          output: ''
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
      { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true, style: { stroke: '#ec4899', strokeWidth: 2 } },
      { id: 'e3-4', source: 'node-3', target: 'node-4', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } }
    ]
  },

  // ─── 7. البرمجة وتطوير البرمجيات (Developer & Tech) ─────────────
  {
    id: 'code-review-security-audit',
    title: 'مراجع الأكواد ومكتشف الثغرات الأمنية والأداء',
    description: 'فحص مقتطفات الأكواد البرمجية، كشف ثغرات SQLi / XSS واقتراح إصلاحات محسنة.',
    category: 'dev',
    complexity: 'متوسط',
    nodeCount: 3,
    tags: ['مراجعة كود', 'أمان وحماية', 'TypeScript/Python'],
    icon: 'ShieldCheck',
    color: 'from-emerald-500 to-teal-600',
    pipelinePreview: ['الكود المصدري', 'فاحص الثغرات', 'الكود المصحح والتقرير'],
    nodes: [
      {
        id: 'node-1',
        type: 'textInput',
        position: { x: 960, y: 150 },
        data: {
          label: 'الكود البرمجي المراد مراجعته',
          category: 'input',
          status: 'idle',
          text: 'export async function getUser(req, res) {\n  const { id } = req.query;\n  const user = await db.query(`SELECT * FROM users WHERE id = ${id}`);\n  return res.json(user);\n}',
          output: 'export async function getUser(req, res) {\n  const { id } = req.query;\n  const user = await db.query(`SELECT * FROM users WHERE id = ${id}`);\n  return res.json(user);\n}'
        }
      },
      {
        id: 'node-2',
        type: 'textAI',
        position: { x: 510, y: 150 },
        data: {
          label: 'فاحص الأمان وكفاءة الأداء',
          category: 'ai',
          status: 'idle',
          model: 'gemini-3.8-flash',
          systemPrompt: 'افحص الكود بعناية فائقة: 1- استخرج الثغرات الأمنية مثل SQL Injection مع درجة خطورتها، 2- اذكر مشاكل الأداء، 3- أعد كتابة الكود كاملاً بشكل آمن ومحصن وموثق بنوع TypeScript.',
          output: ''
        }
      },
      {
        id: 'node-3',
        type: 'finalResult',
        position: { x: 60, y: 150 },
        data: {
          label: 'تقرير الفحص والكود النظيف المصحح',
          category: 'output',
          status: 'idle',
          output: ''
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true, style: { stroke: '#059669', strokeWidth: 2 } },
      { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } }
    ]
  },
  {
    id: 'api-documentation-generator',
    title: 'مولد توثيق الـ APIs من مسارات JSON / Endpoints',
    description: 'تحويل بيانات ومخططات الـ API إلى توثيق Markdown منسق مع أمثلة طلبات Curl.',
    category: 'dev',
    complexity: 'مبتدئ',
    nodeCount: 3,
    tags: ['توثيق', 'REST API', 'Markdown'],
    icon: 'FileCode',
    color: 'from-cyan-500 to-blue-600',
    pipelinePreview: ['مواصفات الـ API', 'مولد الوثائق', 'صفحة التوثيق'],
    nodes: [
      {
        id: 'node-1',
        type: 'textInput',
        position: { x: 960, y: 150 },
        data: {
          label: 'مواصفات المسار (Endpoint Schema)',
          category: 'input',
          status: 'idle',
          text: 'POST /api/v1/orders\nHeaders: Authorization: Bearer <token>\nBody: { "productId": "str", "quantity": int, "shippingAddress": { "city": "str", "zip": "str" } }\nResponse 201: { "orderId": "str", "status": "pending", "total": float }',
          output: 'POST /api/v1/orders\nHeaders: Authorization: Bearer <token>\nBody: { "productId": "str", "quantity": int, "shippingAddress": { "city": "str", "zip": "str" } }\nResponse 201: { "orderId": "str", "status": "pending", "total": float }'
        }
      },
      {
        id: 'node-2',
        type: 'textAI',
        position: { x: 510, y: 150 },
        data: {
          label: 'مولد وثائق المطورين (Markdown API Docs)',
          category: 'ai',
          status: 'idle',
          model: 'gemini-3.8-flash',
          systemPrompt: 'اكتب صفحة توثيق API احترافية بتنسيق Markdown تضم: وصف المسار، جدول معاملات الـ Headers والـ Body، أمثلة كود بـ cURL و JavaScript (Fetch)، وجدول استجابات الأخطاء (400, 401, 500).',
          output: ''
        }
      },
      {
        id: 'node-3',
        type: 'finalResult',
        position: { x: 60, y: 150 },
        data: {
          label: 'صفحة التوثيق الجاهزة لموقع المطورين',
          category: 'output',
          status: 'idle',
          output: ''
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true, style: { stroke: '#06b6d4', strokeWidth: 2 } },
      { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } }
    ]
  },
  {
    id: 'unit-test-suite-builder',
    title: 'مولد اختبارات الوحدات البرمجية (Unit Tests Generator)',
    description: 'توليد حالات اختبار شاملة (Happy path & Edge cases) لأطر Jest و PyTest.',
    category: 'dev',
    complexity: 'متوسط',
    nodeCount: 3,
    tags: ['Jest', 'اختبارات', 'جودة الكود'],
    icon: 'CheckCircle2',
    color: 'from-blue-500 to-indigo-600',
    pipelinePreview: ['الدالة البرمجية', 'بناء حالات الاختبار', 'ملف Test جاهز'],
    nodes: [
      {
        id: 'node-1',
        type: 'textInput',
        position: { x: 960, y: 150 },
        data: {
          label: 'الدالة البرمجية المراد اختبارها',
          category: 'input',
          status: 'idle',
          text: 'export function calculateDiscount(price: number, couponCode?: string): number {\n  if (price < 0) throw new Error("Price cannot be negative");\n  if (couponCode === "SAVE20") return price * 0.8;\n  if (couponCode === "HALF") return price * 0.5;\n  return price;\n}',
          output: 'export function calculateDiscount(price: number, couponCode?: string): number {\n  if (price < 0) throw new Error("Price cannot be negative");\n  if (couponCode === "SAVE20") return price * 0.8;\n  if (couponCode === "HALF") return price * 0.5;\n  return price;\n}'
        }
      },
      {
        id: 'node-2',
        type: 'textAI',
        position: { x: 510, y: 150 },
        data: {
          label: 'مهندس اختبارات الجودة (Jest / Vitest)',
          category: 'ai',
          status: 'idle',
          model: 'gemini-3.8-flash',
          systemPrompt: 'اكتب حزمة اختبارات كاملة باستخدام Jest/Vitest تغطي: المسار الطبيعي، الكوبونات المختلفة، الحالات الحدية (Edge Cases)، واختبار رمي الأخطاء عند تمرير أسعار سالبة.',
          output: ''
        }
      },
      {
        id: 'node-3',
        type: 'finalResult',
        position: { x: 60, y: 150 },
        data: {
          label: 'ملف الاختبارات البرمجية الجاهز للتشغيل',
          category: 'output',
          status: 'idle',
          output: ''
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } },
      { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } }
    ]
  }
];

// Alias for backwards compatibility
export const sampleTemplates = WORKFLOW_TEMPLATES;
