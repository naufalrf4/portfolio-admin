export const LLM_PROVIDERS = [
  { value: 'openai-compatible', label: 'OpenAI-compatible' },
  { value: 'gemini', label: 'Google Gemini' },
] as const;

export type LlmProvider = (typeof LLM_PROVIDERS)[number]['value'];

export const DEFAULT_BASE_URL: Record<LlmProvider, string> = {
  'openai-compatible': 'https://api.openai.com',
  gemini: '',
};

export const CHUNK_VECTOR_DIMENSION = 1536;
