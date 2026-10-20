import { ApiKeysConfig } from '@/types/workflow';

export const API_KEYS_STORAGE_KEY = 'promptflow_api_keys';

export function getStoredApiKeys(): ApiKeysConfig {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(API_KEYS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveStoredApiKeys(keys: ApiKeysConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(keys));
  // Dispatch reactive event across window
  window.dispatchEvent(
    new CustomEvent('promptflow_api_keys_changed', { detail: keys })
  );
}

/**
 * Checks if a given AI provider has a connected API key
 */
export function isProviderConnected(provider: string): boolean {
  if (typeof window === 'undefined') return true;
  const keys = getStoredApiKeys();
  const prov = provider.toLowerCase().trim();

  switch (prov) {
    case 'google':
      // Google Gemini / Imagen 3 is always connected via server-provided GEMINI_API_KEY
      return true;
    case 'groq':
      return Boolean(keys.groqKey?.trim());
    case 'openai':
      return Boolean(keys.openaiKey?.trim());
    case 'anthropic':
      return Boolean(keys.anthropicKey?.trim());
    default:
      return false;
  }
}

/**
 * Updates or sets a single provider's key
 */
export function updateProviderKey(provider: string, keyVal: string): void {
  const keys = getStoredApiKeys();
  const updated: ApiKeysConfig = { ...keys };
  const prov = provider.toLowerCase().trim();

  switch (prov) {
    case 'google':
      updated.geminiKey = keyVal.trim();
      break;
    case 'groq':
      updated.groqKey = keyVal.trim();
      break;
    case 'openai':
      updated.openaiKey = keyVal.trim();
      break;
    case 'anthropic':
      updated.anthropicKey = keyVal.trim();
      break;
  }

  saveStoredApiKeys(updated);
}

/**
 * Removes/clears a provider's key
 */
export function removeProviderKey(provider: string): void {
  updateProviderKey(provider, '');
}
