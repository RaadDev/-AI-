import type { Node, Edge } from '@xyflow/react';

export type NodeCategory =
  | 'input'
  | 'ai'
  | 'utility'
  | 'output'
  | 'control'
  | 'http'
  | 'testing';

export type NodeExecutionStatus =
  | 'idle'
  | 'queued'
  | 'running'
  | 'completed'
  | 'error'
  | 'cancelled'
  | 'skipped';

export type ThemeMode = 'midnight' | 'light' | 'blueprint' | 'oled';

export interface StudioSettings {
  // Appearance & Canvas
  theme: ThemeMode;
  backgroundVariant: 'dots' | 'blueprint' | 'cross' | 'none';
  backgroundOpacity: number; // 0.1 to 1.0
  backgroundGap: number; // 12 to 48
  ambientGlow: boolean;
  spotlightCursor: boolean;
  snapToGrid: boolean;
  isLocked: boolean;
  edgeStyle: 'bezier' | 'smoothstep' | 'straight';
  animatedEdges: boolean;
  canvasFontSize: 'small' | 'medium' | 'large';
  showMiniMap: boolean;
  compactNodes: boolean;
  layoutDirection?: 'LR' | 'TB' | 'RL';

  // AI & Models Defaults
  defaultModel: string;
  defaultTemperature: number;
  defaultLanguage: 'العربية الفصحى' | 'اللهجة السعودية' | 'الإنجليزية' | 'نفس لغة المدخل';
  streamingEnabled: boolean;

  // API Keys & Integrations
  openaiKey?: string;
  anthropicKey?: string;
  geminiKey?: string;
  groqKey?: string;
  deepseekKey?: string;
  mistralKey?: string;
  openrouterKey?: string;
  elevenlabsKey?: string;
  globalWebhookUrl?: string;

  // Execution & Behavior
  autoRunOnChange: boolean;
  soundEffects: boolean;
  smartCaching: boolean;
  executionTimeoutSeconds?: number;
}

export interface ApiKeysConfig {
  openaiKey?: string;
  geminiKey?: string;
  groqKey?: string;
  anthropicKey?: string;
  deepseekKey?: string;
  mistralKey?: string;
  openrouterKey?: string;
  elevenlabsKey?: string;
}

export interface BrandVoiceConfig {
  enabled: boolean;
  brandName?: string;
  targetAudience?: string;
  toneOfVoice?: string;
  avoidWords?: string;
}

export interface SavedWorkspace {
  id: string;
  name: string;
  updatedAt: number;
  nodeCount: number;
  nodes: Node[];
  edges: Edge[];
}

export interface WorkflowValidationIssue {
  id: string;
  nodeId?: string;
  nodeTitle?: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  field?: string;
  details?: string;
}

export interface WorkflowValidationResult {
  isValid: boolean;
  issues: WorkflowValidationIssue[];
  errors: WorkflowValidationIssue[];
  warnings: WorkflowValidationIssue[];
}

export interface WorkflowTestCase {
  id: string;
  name: string;
  description?: string;
  inputs: Record<string, string>;
  expectedOutputs?: Record<string, string>;
  actualOutputs?: Record<string, string>;
  assertions?: Array<{ assertionType: string; expectedValue: string; targetNodeId: string }>;
  status?: 'idle' | 'running' | 'passed' | 'failed';
  lastRunTimestamp?: string;
  executionDurationMs?: number;
  lastRunPassed?: boolean;
  lastRunAt?: number;
}

export interface WorkflowNodeData extends Record<string, unknown> {
  label: string;
  category: NodeCategory;
  status?: NodeExecutionStatus;
  output?: string;
  outputHistory?: string[];
  historyIndex?: number;
  errorMessage?: string;
  missingKey?: boolean;
  requiredProvider?: string;
  requiredKeyName?: string;
  isCollapsed?: boolean;
  isPinned?: boolean;
  compactMode?: boolean;
  executionDuration?: number; // in seconds
  tokensUsed?: number;
  fallbackApplied?: boolean;
  originalModel?: string;
  activeModel?: string;
  fallbackMessage?: string;

  // Specific properties
  text?: string;
  url?: string;
  systemPrompt?: string;
  prompt?: string;
  model?: string;
  temperature?: number;
  imagePrompt?: string;
  imageUrl?: string;
  template?: string;
  inputs?: Record<string, string>;

  // AudioVoiceNode (TTS)
  audioModel?: string;
  voiceName?: string;
  voiceLang?: string;
  voiceRate?: number;
  voicePitch?: number;
  audioDuration?: number;

  // BatchLoopNode
  batchItems?: string[];
  currentBatchIndex?: number;
  batchDelimiter?: 'newline' | 'comma' | 'json';
  batchMode?: 'all' | 'step';

  // FileUploadNode
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  fileContent?: string;

  // NoteNode
  noteText?: string;
  noteColor?: 'yellow' | 'purple' | 'cyan' | 'emerald';
  title?: string;
  content?: string;
  color?: string;

  // JsonExtractorNode
  fields?: string;
  format?: 'json' | 'table';

  // ToneRewriterNode
  targetTone?: 'saudi' | 'khaleeji' | 'formal' | 'story' | 'executive' | 'sales';
  lengthPreference?: 'concise' | 'balanced' | 'detailed';

  // ConditionalNode
  conditionType?: 'contains' | 'notContains' | 'wordsGreaterThan' | 'charsGreaterThan';
  conditionValue?: string;
  conditionResult?: boolean;

  // WebSearchNode
  searchQuery?: string;
  searchEngine?: 'all' | 'google' | 'news' | 'academic';
  maxResults?: number;
  searchResults?: Array<{ title: string; snippet: string; url: string }>;

  // SplitterNode
  delimiter?: 'newline' | 'comma' | 'paragraph' | 'custom';
  customDelimiter?: string;
  splitItems?: string[];
  selectedItemIndex?: number; // -1 for all

  // WebhookOutputNode
  webhookUrl?: string;
  webhookMethod?: 'POST' | 'GET';
  webhookHeaders?: string;
  lastResponseStatus?: number;
  lastResponseBody?: string;

  // HttpRequestNode
  httpUrl?: string;
  httpMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  httpHeaders?: string | Record<string, string>;
  httpBody?: string;
  httpTimeout?: number;
  httpResponseStatus?: number;
  httpResponseHeaders?: Record<string, string>;

  // StructuredOutputNode
  jsonSchema?: string;
  validationStrict?: boolean;
  isValidSchema?: boolean;
  schemaValidationErrors?: string[];

  // DelayNode
  delaySeconds?: number;
  remainingSeconds?: number;

  // TestAssertionNode
  assertionType?: 'equals' | 'contains' | 'matchesRegex' | 'regex' | 'jsonValid' | 'notEmpty';
  expectedValue?: string;
  assertionPassed?: boolean;
  assertionMessage?: string;
  failWorkflowOnMismatch?: boolean;
}

export interface ExecutionMetrics {
  totalTokens: number;
  totalCostUsd: number;
  completedNodesCount: number;
}

export interface WorkflowTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  complexity?: 'مبتدئ' | 'متوسط' | 'متقدم' | string;
  nodeCount?: number;
  tags?: string[];
  color?: string;
  pipelinePreview?: string[];
  nodes: Node[];
  edges: Edge[];
}


export const AI_TIER_MODELS = {
  free: {
    text: [
      { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash (فائق السرعة - افتراضي)' },
      { id: 'llama-3.3-70b', label: 'Llama 3.3 70B (مفتوح المصدر)' },
    ],
    image: [
      { id: 'google-imagen-3', label: 'Google Imagen 3 (فائق الدقة - موصى به ⭐)' },
      { id: 'flux-1-schnell', label: 'Flux.1 Schnell (سريع)' },
    ],
    defaultText: 'gemini-3.8-flash',
    defaultImage: 'google-imagen-3',
  },
  pro: {
    text: [
      { id: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet (الأفضل برمجياً وأدبياً)' },
      { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro (استدلال متقدم)' },
      { id: 'gpt-4o', label: 'GPT-4o (الرائد متعدد الوسائط)' },
    ],
    image: [
      { id: 'google-imagen-3', label: 'Google Imagen 3 (فائق الدقة - موصى به ⭐)' },
      { id: 'flux-1-dev', label: 'Flux.1 Pro (احترافي فائق الدقة)' },
      { id: 'dall-e-3', label: 'DALL-E 3 (OpenAI - فهم دقيق)' },
      { id: 'midjourney-v6-1', label: 'Midjourney v6.1 (جماليات فنية سينمائية)' },
    ],
    defaultText: 'claude-3-5-sonnet',
    defaultImage: 'google-imagen-3',
  },
} as const;


