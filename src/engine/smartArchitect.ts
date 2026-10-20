import { Node, Edge } from '@xyflow/react';
import { getLayoutedElements } from './autoLayout';
import { StudioSettings } from '@/types/workflow';

export interface WorkflowGenerationResult {
  nodes: Node[];
  edges: Edge[];
  message: string;
  isIncremental: boolean;
}

/**
 * Normalizes Arabic text by removing diacritics and unifying letters for robust matching
 */
function normalizeArabic(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove tashkeel
    .replace(/[إأآا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه')
    .trim();
}

/**
 * Checks if a string contains any word from a synonym group
 */
function hasAny(normalizedText: string, words: string[]): boolean {
  return words.some((w) => normalizedText.includes(normalizeArabic(w)));
}

/**
 * Smart Workflow Architect & Fallback Matcher
 * Parses natural language requests in Arabic/English (formal, colloquial, or dialect)
 * and synthesizes connected node-wire topologies.
 */
export function buildWorkflowFromPrompt(
  prompt: string,
  existingNodes: Node[] = [],
  existingEdges: Edge[] = [],
  settings?: StudioSettings
): WorkflowGenerationResult {
  const norm = normalizeArabic(prompt);
  const defaultModel = settings?.defaultModel || 'gemini-1.5-flash';
  const timestamp = Date.now();

  // -------------------------------------------------------------
  // 1. INCREMENTAL ADDITION (أضف عقدة / اربط ...)
  // -------------------------------------------------------------
  const isIncremental = hasAny(norm, [
    'اضف',
    'اضافه',
    'اربط',
    'وصل',
    'لحق',
    'زد',
    'append',
    'add',
    'attach',
    'connect',
  ]);

  if (isIncremental && existingNodes.length > 0) {
    const sorted = [...existingNodes].sort((a, b) => b.position.x - a.position.x);
    const parentNode =
      sorted.find((n) => n.type === 'finalResult') ||
      sorted.find((n) => n.type === 'templateMerge') ||
      sorted.find((n) => n.type === 'textAI') ||
      sorted[0];

    // CASE A: Add Audio Voice
    if (hasAny(norm, ['صوت', 'صوتي', 'بودكاست', 'نطق', 'كلام', 'قراءه', 'audio', 'voice', 'podcast', 'tts'])) {
      const newNodeId = `node_audio_${timestamp}`;
      const newNode: Node = {
        id: newNodeId,
        type: 'audioVoice',
        position: { x: parentNode.position.x + 400, y: parentNode.position.y },
        data: {
          label: 'التعليق الصوتي المسموع (TTS)',
          category: 'output',
          status: 'idle',
          voiceRate: 1.0,
          voicePitch: 1.0,
          text: '',
          output: '',
        },
      };

      const newEdge: Edge = {
        id: `e_${parentNode.id}_${newNodeId}`,
        source: parentNode.id,
        target: newNodeId,
        type: 'deletable',
        animated: true,
        style: { stroke: '#14b8a6', strokeWidth: 2.5 },
      };

      const layouted = getLayoutedElements([...existingNodes, newNode], [...existingEdges, newEdge], 'LR');
      return {
        nodes: layouted.nodes,
        edges: layouted.edges,
        message: 'تمت إضافة عقدة التعليق الصوتي (TTS) وربطها بنجاح 🎙️',
        isIncremental: true,
      };
    }

    // CASE B: Add Image AI
    if (hasAny(norm, ['صوره', 'صور', 'رسم', 'تصميم', 'بنر', 'غلاف', 'فوتو', 'image', 'photo', 'picture', 'banner'])) {
      const newNodeId = `node_image_${timestamp}`;
      const newNode: Node = {
        id: newNodeId,
        type: 'imageAI',
        position: { x: parentNode.position.x + 400, y: parentNode.position.y },
        data: {
          label: 'توليد بوستر أو صورة فنية',
          category: 'ai',
          status: 'idle',
          model: 'flux-schnell',
          imagePrompt: `تصميم فوتوغرافي واقعي فائق الدقة مستوحى من: ${prompt}`,
          output: '',
        },
      };

      const newEdge: Edge = {
        id: `e_${parentNode.id}_${newNodeId}`,
        source: parentNode.id,
        target: newNodeId,
        type: 'deletable',
        animated: true,
        style: { stroke: '#ec4899', strokeWidth: 2.5 },
      };

      const layouted = getLayoutedElements([...existingNodes, newNode], [...existingEdges, newEdge], 'LR');
      return {
        nodes: layouted.nodes,
        edges: layouted.edges,
        message: 'تمت إضافة عقدة توليد الصور بالذكاء الاصطناعي 🎨',
        isIncremental: true,
      };
    }

    // CASE C: Add Tone Rewriter
    if (hasAny(norm, ['لهجه', 'تدقيق', 'لغوي', 'صياغه', 'اسلوب', 'سعودي', 'خليجي', 'فصحي', 'tone', 'rewrite'])) {
      const newNodeId = `node_tone_${timestamp}`;
      const newNode: Node = {
        id: newNodeId,
        type: 'toneRewriter',
        position: { x: parentNode.position.x + 400, y: parentNode.position.y },
        data: {
          label: 'محول اللهجة والتدقيق اللغوي',
          category: 'ai',
          status: 'idle',
          targetTone: hasAny(norm, ['سعودي', 'سعوديه', 'بيضاء']) ? 'saudi' : hasAny(norm, ['فصحي', 'رسمي']) ? 'formal' : 'saudi',
          lengthPreference: 'balanced',
          output: '',
        },
      };

      const newEdge: Edge = {
        id: `e_${parentNode.id}_${newNodeId}`,
        source: parentNode.id,
        target: newNodeId,
        type: 'deletable',
        animated: true,
        style: { stroke: '#a855f7', strokeWidth: 2.5 },
      };

      const layouted = getLayoutedElements([...existingNodes, newNode], [...existingEdges, newEdge], 'LR');
      return {
        nodes: layouted.nodes,
        edges: layouted.edges,
        message: 'تمت إضافة عقدة تحسين الأسلوب واللهجة بنجاح ✍️',
        isIncremental: true,
      };
    }

    // CASE D: Add JSON Extractor
    if (hasAny(norm, ['json', 'استخراج', 'بيانات', 'منظم', 'جدول', 'هيكله', 'extract', 'structure'])) {
      const newNodeId = `node_json_${timestamp}`;
      const newNode: Node = {
        id: newNodeId,
        type: 'jsonExtractor',
        position: { x: parentNode.position.x + 400, y: parentNode.position.y },
        data: {
          label: 'استخراج بيانات منظمة (JSON)',
          category: 'utility',
          status: 'idle',
          fields: 'العنوان, الملخص_التنفيذي, التصنيف, النقاط_الجوهرية, التقييم',
          format: 'json',
          output: '',
        },
      };

      const newEdge: Edge = {
        id: `e_${parentNode.id}_${newNodeId}`,
        source: parentNode.id,
        target: newNodeId,
        type: 'deletable',
        animated: true,
        style: { stroke: '#06b6d4', strokeWidth: 2.5 },
      };

      const layouted = getLayoutedElements([...existingNodes, newNode], [...existingEdges, newEdge], 'LR');
      return {
        nodes: layouted.nodes,
        edges: layouted.edges,
        message: 'تمت إضافة عقدة استخراج JSON وربطها بنجاح 📋',
        isIncremental: true,
      };
    }
  }

  // -------------------------------------------------------------
  // 2. COMPLETE WORKFLOW SYNTHESIS (SMART SEMANTIC PIPELINE BUILDER)
  // -------------------------------------------------------------
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let stepIdx = 1;

  const createId = (prefix: string) => `node_${timestamp}_${stepIdx++}_${prefix}`;

  // STEP A: Determine Input Source Node
  let inputNodeId = '';
  if (hasAny(norm, ['يوتيوب', 'يوت', 'مقطع', 'مقاطع', 'فيديو', 'فديو', 'رابط', 'روابط', 'لينك', 'تيك توك', 'موقع', 'صفحه', 'ويب', 'youtube', 'video', 'url', 'link', 'scrape'])) {
    inputNodeId = createId('urlScraper');
    const isYt = hasAny(norm, ['يوتيوب', 'يوت', 'مقطع', 'فيديو', 'youtube', 'video']);
    nodes.push({
      id: inputNodeId,
      type: 'urlScraper',
      position: { x: 50, y: 260 },
      data: {
        label: isYt ? 'رابط فيديو يوتيوب' : 'سحب رابط المقال / الويب',
        category: 'input',
        status: 'idle',
        url: isYt
          ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
          : 'https://ar.wikipedia.org/wiki/ذكاء_اصطناعي',
        output: isYt
          ? 'تفريغ نصي لمحتوى الفيديو: يناقش اللقاء أحدث استراتيجيات الابتكار وبناء المشاريع الحديثة...'
          : 'محتوى المقال المستخرج من الرابط بالكامل...',
      },
    });
  } else if (hasAny(norm, ['ملف', 'ملفات', 'مستند', 'مستندات', 'بي دي اف', 'pdf', 'txt', 'csv', 'اكسل', 'رفع', 'file', 'document', 'upload'])) {
    inputNodeId = createId('fileUpload');
    nodes.push({
      id: inputNodeId,
      type: 'fileUpload',
      position: { x: 50, y: 260 },
      data: {
        label: 'رفع مستند أو ملف بيانات',
        category: 'input',
        status: 'idle',
        output: 'محتوى الملف النصي المستخرج الجاهز للمعالجة...',
      },
    });
  } else if (hasAny(norm, ['بحث مباشر', 'بحث ويب', 'جوجل', 'احدث الاخبار', 'ترند', 'search', 'google'])) {
    inputNodeId = createId('webSearch');
    nodes.push({
      id: inputNodeId,
      type: 'webSearch',
      position: { x: 50, y: 260 },
      data: {
        label: 'بحث الويب المباشر',
        category: 'input',
        status: 'idle',
        searchQuery: prompt,
        output: '',
      },
    });
  } else {
    // Default text input
    inputNodeId = createId('textInput');
    nodes.push({
      id: inputNodeId,
      type: 'textInput',
      position: { x: 50, y: 260 },
      data: {
        label: 'مدخل الفكرة أو الموضوع',
        category: 'input',
        status: 'idle',
        text: `الموضوع المستهدف:\n${prompt}`,
        output: `الموضوع المستهدف:\n${prompt}`,
      },
    });
  }

  let previousNodeId = inputNodeId;
  const parallelOutputs: string[] = [];

  // STEP B: Detect Generation Tasks (Text AI)
  const wantsSummary = hasAny(norm, ['تلخيص', 'لخص', 'ملخص', 'اختصار', 'summary', 'summarize']);
  const wantsBlog = hasAny(norm, ['مقال', 'مقاله', 'تدوينه', 'مدونه', 'كتابه مقال', 'نشر مقال', 'article', 'blog']);
  const wantsTweets = hasAny(norm, ['تغريد', 'تغريدات', 'تويتر', 'ثريد', 'سلسله', 'منشور x', 'tweet', 'twitter', 'thread']);
  const wantsAdCopy = hasAny(norm, ['اعلان', 'اعلانات', 'تسويق', 'بيعي', 'حمله', 'ترويج', 'ad', 'copy', 'marketing']);
  const wantsTranslate = hasAny(norm, ['ترجمه', 'ترجم', 'انجليزي', 'عربي', 'translate']);
  const wantsSplitter = hasAny(norm, ['تقسيم', 'تجزئه', 'فصل', 'عناصر', 'سطور', 'split', 'chunk']);
  const wantsJson = hasAny(norm, ['json', 'هيكله', 'استخراج', 'جدول', 'بيانات منظمه']);
  const wantsTone = hasAny(norm, ['لهجه', 'سعودي', 'خليجي', 'فصحي', 'اسلوب', 'صياغه', 'تدقيق']);
  const wantsImage = hasAny(norm, ['صوره', 'صور', 'رسم', 'تصميم', 'بنر', 'غلاف', 'فوتو', 'image', 'photo', 'picture', 'banner']);
  const wantsAudio = hasAny(norm, ['صوت', 'صوتي', 'بودكاست', 'نطق', 'كلام', 'قراءه', 'audio', 'voice', 'podcast', 'speech']);

  // Case 1: Splitter before processing
  if (wantsSplitter) {
    const splitId = createId('splitter');
    nodes.push({
      id: splitId,
      type: 'splitter',
      position: { x: 420, y: 260 },
      data: {
        label: 'تقسيم النصوص لعناصر',
        category: 'utility',
        status: 'idle',
        delimiter: 'newline',
        output: '',
      },
    });
    edges.push({
      id: `e_${previousNodeId}_${splitId}`,
      source: previousNodeId,
      target: splitId,
      type: 'deletable',
      animated: true,
      style: { stroke: '#f59e0b', strokeWidth: 2 },
    });
    previousNodeId = splitId;
  }

  // Case 2: Summary Stage
  if (wantsSummary) {
    const summaryId = createId('textAI');
    nodes.push({
      id: summaryId,
      type: 'textAI',
      position: { x: 440, y: 260 },
      data: {
        label: 'تلخيص تنفيذي للمحتوى',
        category: 'ai',
        status: 'idle',
        model: defaultModel,
        systemPrompt:
          'أنت خبير تلخيص احترافي. لخص المحتوى القادم في 5 إلى 7 نقاط جوهرية مركزة ومباشرة مع تسليط الضوء على أبرز الأفكار والدروس المستفادة.',
        output: '',
      },
    });
    edges.push({
      id: `e_${previousNodeId}_${summaryId}`,
      source: previousNodeId,
      target: summaryId,
      type: 'deletable',
      animated: true,
      style: { stroke: '#6366f1', strokeWidth: 2 },
    });
    previousNodeId = summaryId;
  }

  // Case 3: Blog/Article Generation
  if (wantsBlog) {
    const blogId = createId('textAI');
    nodes.push({
      id: blogId,
      type: 'textAI',
      position: { x: 860, y: 100 },
      data: {
        label: 'كتابة مقال وتدوينة متكاملة',
        category: 'ai',
        status: 'idle',
        model: defaultModel,
        systemPrompt:
          'اكتب مقالاً احترافياً متوافقاً مع الـ SEO بناءً على المدخلات، يشمل عنواناً جذاباً ومقدمة مشوقة وعناوين فرعية H2/H3 وخاتمة محفزة للتفاعل.',
        output: '',
      },
    });
    edges.push({
      id: `e_${previousNodeId}_${blogId}`,
      source: previousNodeId,
      target: blogId,
      type: 'deletable',
      animated: true,
      style: { stroke: '#6366f1', strokeWidth: 2 },
    });
    parallelOutputs.push(blogId);
  }

  // Case 4: Tweets / Thread
  if (wantsTweets) {
    const tweetId = createId('textAI');
    nodes.push({
      id: tweetId,
      type: 'textAI',
      position: { x: 860, y: 460 },
      data: {
        label: 'توليد سلسلة تغريدات (ثريد X)',
        category: 'ai',
        status: 'idle',
        model: defaultModel,
        systemPrompt:
          'حول المحتوى القادم إلى ثريد تغريدات من 4-5 تغريدات مميزة على تويتر/X مع خطاف قوي (Hook) في التغريدة الأولى وإيموجيز مناسبة ودعوة للتفاعل.',
        output: '',
      },
    });
    edges.push({
      id: `e_${previousNodeId}_${tweetId}`,
      source: previousNodeId,
      target: tweetId,
      type: 'deletable',
      animated: true,
      style: { stroke: '#38bdf8', strokeWidth: 2 },
    });
    parallelOutputs.push(tweetId);
  }

  // Case 5: Ad / Marketing Copy
  if (wantsAdCopy) {
    const adId = createId('textAI');
    nodes.push({
      id: adId,
      type: 'textAI',
      position: { x: 860, y: 280 },
      data: {
        label: 'صياغة نصوص إعلانية وتسويقية',
        category: 'ai',
        status: 'idle',
        model: defaultModel,
        systemPrompt:
          'صغ نصوصاً تسويقية وإعلانية مقنعة للمنتج/الفكرة باستخدام تقنية AIDA (انتباه، اهتمام، رغبة، إجراء) مع نداء لاتخاذ إجراء واضح (CTA).',
        output: '',
      },
    });
    edges.push({
      id: `e_${previousNodeId}_${adId}`,
      source: previousNodeId,
      target: adId,
      type: 'deletable',
      animated: true,
      style: { stroke: '#ec4899', strokeWidth: 2 },
    });
    parallelOutputs.push(adId);
  }

  // Case 6: Translation
  if (wantsTranslate) {
    const transId = createId('textAI');
    nodes.push({
      id: transId,
      type: 'textAI',
      position: { x: 860, y: 260 },
      data: {
        label: 'ترجمة وصياغة سياقية',
        category: 'ai',
        status: 'idle',
        model: defaultModel,
        systemPrompt:
          'قم بترجمة النص القادم بدقة وسلاسة بلاغية عالية، مع الحفاظ على روح المعنى وتكييف المصطلحات بدقة.',
        output: '',
      },
    });
    edges.push({
      id: `e_${previousNodeId}_${transId}`,
      source: previousNodeId,
      target: transId,
      type: 'deletable',
      animated: true,
      style: { stroke: '#10b981', strokeWidth: 2 },
    });
    parallelOutputs.push(transId);
  }

  // If no specific generation was requested but user wrote a general prompt:
  if (
    !wantsSummary &&
    !wantsBlog &&
    !wantsTweets &&
    !wantsAdCopy &&
    !wantsTranslate
  ) {
    const generalAiId = createId('textAI');
    nodes.push({
      id: generalAiId,
      type: 'textAI',
      position: { x: 460, y: 260 },
      data: {
        label: `معالجة: ${prompt.slice(0, 26)}`,
        category: 'ai',
        status: 'idle',
        model: defaultModel,
        systemPrompt: `قم بتنفيذ وتوليد المطلوب بدقة عالية بناءً على المدخلات:\n"${prompt}"\nواحرص على تقديم محتوى متكامل ومنظم واحترافي.`,
        output: '',
      },
    });
    edges.push({
      id: `e_${previousNodeId}_${generalAiId}`,
      source: previousNodeId,
      target: generalAiId,
      type: 'deletable',
      animated: true,
      style: { stroke: '#6366f1', strokeWidth: 2 },
    });
    previousNodeId = generalAiId;
  }

  // If we have parallel outputs (e.g. blog + tweets), merge them using TemplateMerge
  if (parallelOutputs.length >= 2) {
    const mergeId = createId('templateMerge');
    nodes.push({
      id: mergeId,
      type: 'templateMerge',
      position: { x: 1260, y: 260 },
      data: {
        label: 'دمج وتنسيق الباقة النهائية',
        category: 'utility',
        status: 'idle',
        template:
          '# 📦 المخرجات المتكاملة\n\n### 📝 القسم الأول:\n{{input_1}}\n\n---\n\n### 🚀 القسم الثاني:\n{{input_2}}',
        output: '',
      },
    });
    edges.push({
      id: `e_${parallelOutputs[0]}_${mergeId}`,
      source: parallelOutputs[0],
      target: mergeId,
      targetHandle: 'input_1',
      type: 'deletable',
      animated: true,
      style: { stroke: '#f59e0b', strokeWidth: 2 },
    });
    edges.push({
      id: `e_${parallelOutputs[1]}_${mergeId}`,
      source: parallelOutputs[1],
      target: mergeId,
      targetHandle: 'input_2',
      type: 'deletable',
      animated: true,
      style: { stroke: '#14b8a6', strokeWidth: 2 },
    });
    previousNodeId = mergeId;
  } else if (parallelOutputs.length === 1) {
    previousNodeId = parallelOutputs[0];
  }

  // STEP C: Optional Tone Rewriter
  if (wantsTone) {
    const toneId = createId('toneRewriter');
    nodes.push({
      id: toneId,
      type: 'toneRewriter',
      position: { x: 1260, y: 260 },
      data: {
        label: 'تحسين الأسلوب واللهجة',
        category: 'ai',
        status: 'idle',
        targetTone: hasAny(norm, ['سعودي', 'سعوديه', 'بيضاء'])
          ? 'saudi'
          : hasAny(norm, ['خليجي'])
          ? 'khaleeji'
          : hasAny(norm, ['قصصي'])
          ? 'story'
          : 'saudi',
        lengthPreference: 'balanced',
        output: '',
      },
    });
    edges.push({
      id: `e_${previousNodeId}_${toneId}`,
      source: previousNodeId,
      target: toneId,
      type: 'deletable',
      animated: true,
      style: { stroke: '#8b5cf6', strokeWidth: 2 },
    });
    previousNodeId = toneId;
  }

  // STEP D: Optional JSON Extractor
  if (wantsJson) {
    const jsonId = createId('jsonExtractor');
    nodes.push({
      id: jsonId,
      type: 'jsonExtractor',
      position: { x: 1260, y: 460 },
      data: {
        label: 'هيكلة واستخراج كائن JSON',
        category: 'utility',
        status: 'idle',
        fields: 'العنوان, الملخص_التنفيذي, التصنيف, الكلمات_المفتاحية, التقييم',
        format: 'json',
        output: '',
      },
    });
    edges.push({
      id: `e_${previousNodeId}_${jsonId}`,
      source: previousNodeId,
      target: jsonId,
      type: 'deletable',
      animated: true,
      style: { stroke: '#06b6d4', strokeWidth: 2 },
    });
  }

  // STEP E: Optional Image AI Generation
  if (wantsImage) {
    const imageId = createId('imageAI');
    nodes.push({
      id: imageId,
      type: 'imageAI',
      position: { x: 1260, y: 80 },
      data: {
        label: 'توليد بوستر وصورة الغلاف',
        category: 'ai',
        status: 'idle',
        model: 'flux-schnell',
        imagePrompt: `تصميم إعلاني فوتوغرافي واقعي فائق الجودة ذو إضاءة سينمائية للمحتوى: ${prompt}`,
        output: '',
      },
    });
    edges.push({
      id: `e_${previousNodeId}_${imageId}`,
      source: previousNodeId,
      target: imageId,
      type: 'deletable',
      animated: true,
      style: { stroke: '#ec4899', strokeWidth: 2 },
    });
  }

  // STEP F: Optional Audio Voice TTS
  if (wantsAudio) {
    const audioId = createId('audioVoice');
    nodes.push({
      id: audioId,
      type: 'audioVoice',
      position: { x: 1260, y: 480 },
      data: {
        label: 'التعليق الصوتي والبودكاست (TTS)',
        category: 'output',
        status: 'idle',
        voiceRate: 1.0,
        voicePitch: 1.0,
        text: '',
        output: '',
      },
    });
    edges.push({
      id: `e_${previousNodeId}_${audioId}`,
      source: previousNodeId,
      target: audioId,
      type: 'deletable',
      animated: true,
      style: { stroke: '#14b8a6', strokeWidth: 2 },
    });
  }

  // STEP G: Always append FinalResult terminal node
  const finalId = createId('finalResult');
  nodes.push({
    id: finalId,
    type: 'finalResult',
    position: { x: 1680, y: 260 },
    data: {
      label: 'النتيجة النهائية المكتملة',
      category: 'output',
      status: 'idle',
      output: '',
    },
  });
  edges.push({
    id: `e_${previousNodeId}_${finalId}`,
    source: previousNodeId,
    target: finalId,
    type: 'deletable',
    animated: true,
    style: { stroke: '#10b981', strokeWidth: 2 },
  });

  // STEP H: Layout with DAGRE Horizontal Flow
  const layouted = getLayoutedElements(nodes, edges, 'LR');

  return {
    nodes: layouted.nodes,
    edges: layouted.edges,
    message: `تم بناء مسار العمل بنجاح ✨ (${layouted.nodes.length} عقد متصلة)`,
    isIncremental: false,
  };
}
