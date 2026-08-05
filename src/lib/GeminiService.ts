export interface GeneratedQuestionSet {
  mcqs: Array<{ question: string; options: string[]; answer: string }>;
  shortQuestions: Array<{ question: string; answer: string }>;
  longQuestions: Array<{ question: string; answer: string }>;
  numericalProblems: Array<{ question: string; answer: string }>;
  vivaQuestions: Array<{ question: string; answer: string }>;
}

export interface GeminiQuestionRequest {
  className: '11' | '12';
  chapter: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  numberOfQuestions: number;
}

const STORAGE_PREFIX = 'pcs-physics-ai-questions';
const DEFAULT_MODEL = 'gemini-2.0-flash';

const normalizeQuestionSet = (value: Partial<GeneratedQuestionSet> | null | undefined): GeneratedQuestionSet => ({
  mcqs: Array.isArray(value?.mcqs) ? value.mcqs.slice(0, 10) : [],
  shortQuestions: Array.isArray(value?.shortQuestions) ? value.shortQuestions.slice(0, 10) : [],
  longQuestions: Array.isArray(value?.longQuestions) ? value.longQuestions.slice(0, 10) : [],
  numericalProblems: Array.isArray(value?.numericalProblems) ? value.numericalProblems.slice(0, 10) : [],
  vivaQuestions: Array.isArray(value?.vivaQuestions) ? value.vivaQuestions.slice(0, 10) : [],
});

export const buildQuestionCacheKey = (request: GeminiQuestionRequest) => {
  const safeCount = Math.min(10, Math.max(1, request.numberOfQuestions));
  return `${STORAGE_PREFIX}:${request.className}:${request.chapter}:${request.difficulty}:${safeCount}`;
};

export const getCachedGeneratedQuestions = (request: GeminiQuestionRequest): GeneratedQuestionSet | null => {
  if (typeof window === 'undefined') return null;

  try {
    const cachedValue = window.localStorage.getItem(buildQuestionCacheKey(request));
    if (!cachedValue) return null;
    const parsed = JSON.parse(cachedValue) as Partial<GeneratedQuestionSet>;
    return normalizeQuestionSet(parsed);
  } catch {
    return null;
  }
};

const persistGeneratedQuestions = (request: GeminiQuestionRequest, payload: GeneratedQuestionSet) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(buildQuestionCacheKey(request), JSON.stringify(payload));
  } catch {
    // Ignore storage errors so the UI continues to work offline.
  }
};

const extractJsonPayload = (text: string) => {
  const trimmed = text.trim();
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }
  return trimmed;
};

export const generateQuestions = async (request: GeminiQuestionRequest): Promise<GeneratedQuestionSet> => {
  console.log('[GeminiService] generateQuestions start', request);
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
  console.log('[GeminiService] API key exists:', Boolean(apiKey));
  if (!apiKey) {
    console.error('[GeminiService] missing Gemini API key: VITE_GEMINI_API_KEY is not set');
    throw new Error('missing-api-key');
  }

  const cached = getCachedGeneratedQuestions(request);
  if (cached) {
    console.log('[GeminiService] using cached generated questions', cached);
    return cached;
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${apiKey}`;
  console.log('[GeminiService] about to fetch Gemini API', apiUrl);
  const response = await fetch(
    apiUrl,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Create physics exam questions for Class ${request.className} chapter "${request.chapter}" at ${request.difficulty.toLowerCase()} difficulty. Return only valid JSON. No explanation. No markdown. Use at most ${Math.min(10, Math.max(1, request.numberOfQuestions))} questions per category. Structure the JSON with these keys: mcqs, shortQuestions, longQuestions, numericalProblems, vivaQuestions. Each mcq object must have question, options, answer. Each short/long/numerical/viva item must have question and answer. Keep the content curriculum-aligned, concise, and suitable for school physics practice.`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.9,
          maxOutputTokens: 1800,
        },
      }),
    }
  );

  if (!response.ok) {
    console.error('[GeminiService] Gemini API request failed', response.status, response.statusText);
    throw new Error(`gemini-request-failed:${response.status}`);
  }

  const payload = await response.json();
  console.log('[GeminiService] Gemini response payload', payload);
  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  console.log('[GeminiService] Gemini response text', text);
  const jsonText = extractJsonPayload(text);
  console.log('[GeminiService] extracted JSON payload', jsonText);

  let parsed: Partial<GeneratedQuestionSet>;
  try {
    parsed = JSON.parse(jsonText) as Partial<GeneratedQuestionSet>;
  } catch (error) {
    console.error('[GeminiService] failed to parse Gemini JSON', error, jsonText);
    throw new Error('gemini-response-invalid');
  }

  console.log('[GeminiService] parsed JSON', parsed);
  const normalized = normalizeQuestionSet(parsed);
  persistGeneratedQuestions(request, normalized);
  return normalized;
};
