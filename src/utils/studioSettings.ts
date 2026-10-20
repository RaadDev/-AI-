import { StudioSettings } from '@/types/workflow';
import { getStoredApiKeys, saveStoredApiKeys } from '@/utils/apiKeys';

export const SETTINGS_STORAGE_KEY = 'promptflow_settings';

export const DEFAULT_STUDIO_SETTINGS: StudioSettings = {
  // Appearance & Canvas
  theme: 'midnight',
  backgroundVariant: 'dots',
  backgroundOpacity: 0.35,
  backgroundGap: 24,
  ambientGlow: true,
  spotlightCursor: true,
  snapToGrid: false,
  isLocked: false,
  edgeStyle: 'smoothstep',
  animatedEdges: true,
  canvasFontSize: 'medium',
  showMiniMap: true,
  compactNodes: false,
  layoutDirection: 'RL',

  // AI & Models Defaults
  defaultModel: 'gemini-1.5-flash',
  defaultTemperature: 0.7,
  defaultLanguage: 'العربية الفصحى',
  streamingEnabled: true,

  // API Keys & Integrations
  openaiKey: '',
  anthropicKey: '',
  geminiKey: '',
  groqKey: '',
  deepseekKey: '',
  mistralKey: '',
  openrouterKey: '',
  elevenlabsKey: '',
  globalWebhookUrl: '',

  // Execution & Behavior
  autoRunOnChange: false,
  soundEffects: true,
  smartCaching: true,
};

export function getStudioSettings(): StudioSettings {
  if (typeof window === 'undefined') return DEFAULT_STUDIO_SETTINGS;

  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    const existingKeys = getStoredApiKeys();
    
    const directGemini =
      localStorage.getItem('gemini_api_key') ||
      localStorage.getItem('geminiApiKey') ||
      localStorage.getItem('geminiKey') ||
      localStorage.getItem('GEMINI_API_KEY') ||
      '';
    const directOpenai =
      localStorage.getItem('openai_api_key') ||
      localStorage.getItem('openaiApiKey') ||
      localStorage.getItem('openaiKey') ||
      '';
    const directGroq =
      localStorage.getItem('groq_api_key') ||
      localStorage.getItem('groqApiKey') ||
      localStorage.getItem('groqKey') ||
      '';

    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_STUDIO_SETTINGS,
        ...parsed,
        openaiKey: parsed.openaiKey || existingKeys.openaiKey || directOpenai || '',
        geminiKey: parsed.geminiKey || existingKeys.geminiKey || directGemini || '',
        groqKey: parsed.groqKey || existingKeys.groqKey || directGroq || '',
        anthropicKey: parsed.anthropicKey || existingKeys.anthropicKey || '',
        deepseekKey: parsed.deepseekKey || existingKeys.deepseekKey || '',
        mistralKey: parsed.mistralKey || existingKeys.mistralKey || '',
        openrouterKey: parsed.openrouterKey || existingKeys.openrouterKey || '',
      };
    } else {
      return {
        ...DEFAULT_STUDIO_SETTINGS,
        openaiKey: existingKeys.openaiKey || directOpenai || '',
        geminiKey: existingKeys.geminiKey || directGemini || '',
        groqKey: existingKeys.groqKey || directGroq || '',
        anthropicKey: existingKeys.anthropicKey || '',
        deepseekKey: existingKeys.deepseekKey || '',
        mistralKey: existingKeys.mistralKey || '',
        openrouterKey: existingKeys.openrouterKey || '',
      };
    }
  } catch (e) {
    console.warn('Failed to read studio settings from localStorage:', e);
    return DEFAULT_STUDIO_SETTINGS;
  }
}

export function saveStudioSettings(settings: Partial<StudioSettings>): StudioSettings {
  if (typeof window === 'undefined') return DEFAULT_STUDIO_SETTINGS;

  try {
    const current = getStudioSettings();
    const updated: StudioSettings = {
      ...current,
      ...settings,
    };

    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));

    // Keep API keys in sync with APIKeysModal store and direct localStorage items
    saveStoredApiKeys({
      openaiKey: updated.openaiKey,
      geminiKey: updated.geminiKey,
      groqKey: updated.groqKey,
      anthropicKey: updated.anthropicKey,
      deepseekKey: updated.deepseekKey,
      mistralKey: updated.mistralKey,
      openrouterKey: updated.openrouterKey,
      elevenlabsKey: updated.elevenlabsKey,
    });

    if (updated.geminiKey) localStorage.setItem('gemini_api_key', updated.geminiKey);
    if (updated.openaiKey) localStorage.setItem('openai_api_key', updated.openaiKey);
    if (updated.groqKey) localStorage.setItem('groq_api_key', updated.groqKey);
    if (updated.anthropicKey) localStorage.setItem('anthropic_api_key', updated.anthropicKey);

    // Dispatch global event for responsive real-time updates across the app
    window.dispatchEvent(
      new CustomEvent('promptflow:settings-changed', {
        detail: updated,
      })
    );

    return updated;
  } catch (e) {
    console.error('Failed to save studio settings:', e);
    return DEFAULT_STUDIO_SETTINGS;
  }
}

export function exportAllStudioData(): string {
  if (typeof window === 'undefined') return '{}';

  const data: Record<string, any> = {
    exportedAt: new Date().toISOString(),
    version: '3.0',
    settings: getStudioSettings(),
    canvasState: null,
    workspaces: null,
    brandVoice: null,
  };

  try {
    const canvasRaw = localStorage.getItem('promptflow_canvas_state');
    if (canvasRaw) data.canvasState = JSON.parse(canvasRaw);

    const workspacesRaw = localStorage.getItem('promptflow_saved_workspaces');
    if (workspacesRaw) data.workspaces = JSON.parse(workspacesRaw);

    const brandVoiceRaw = localStorage.getItem('promptflow_brand_voice');
    if (brandVoiceRaw) data.brandVoice = JSON.parse(brandVoiceRaw);
  } catch (e) {
    console.warn('Export error collecting local storage:', e);
  }

  return JSON.stringify(data, null, 2);
}

export function calculateStorageUsage(): string {
  if (typeof window === 'undefined') return '0 KB';
  try {
    let totalBytes = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('promptflow')) {
        const val = localStorage.getItem(key) || '';
        totalBytes += key.length + val.length;
      }
    }
    const kb = (totalBytes / 1024).toFixed(1);
    return `${kb} KB`;
  } catch {
    return 'غير متاح';
  }
}
