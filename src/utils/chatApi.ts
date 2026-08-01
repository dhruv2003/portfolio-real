/**
 * Shared client for the portfolio chat backend.
 * Server enforces rate limits, CORS, and validation — these are UX helpers only.
 */

export const MAX_QUESTION_LENGTH = 2000;
export const MAX_HISTORY_LENGTH = 8000;

export const CHAT_UNAVAILABLE_MESSAGE =
  'Chat is temporarily unavailable. Please try again in a moment.';

export type ChatTone = 'professional' | 'fun' | 'roast';

export interface AskChatParams {
  question: string;
  tone?: ChatTone;
  conversationHistory?: string;
}

export interface AskChatResult {
  answer: string;
}

export class ChatApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ChatApiError';
    this.status = status;
  }
}

function getApiBaseUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl || typeof apiUrl !== 'string') {
    throw new ChatApiError(CHAT_UNAVAILABLE_MESSAGE);
  }
  return apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
}

export function validateQuestionClient(question: string): string | null {
  const trimmed = question.trim();
  if (!trimmed) return 'Message is empty.';
  if (trimmed.length > MAX_QUESTION_LENGTH) {
    return `Message is too long (max ${MAX_QUESTION_LENGTH} characters).`;
  }
  return null;
}

export function buildConversationHistory(
  messages: Array<{ sender: 'user' | 'ai'; text: string }>
): string {
  return messages
    .map((m) => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
    .join('\n');
}

function safeServerMessage(data: { message?: string } | undefined): string | null {
  if (typeof data?.message !== 'string') return null;
  if (data.message.length >= 200) return null;
  if (/env|VITE_|API_KEY|stack/i.test(data.message)) return null;
  return data.message;
}

export async function askChat(params: AskChatParams): Promise<AskChatResult> {
  const question = params.question.trim();
  const clientError = validateQuestionClient(question);
  if (clientError) {
    throw new ChatApiError(clientError, 400);
  }

  const endpoint = `${getApiBaseUrl()}/ask`;
  let history = params.conversationHistory || '';
  if (history.length > MAX_HISTORY_LENGTH) {
    history = history.slice(history.length - MAX_HISTORY_LENGTH);
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        tone: params.tone || 'professional',
        conversationHistory: history,
      }),
    });
  } catch {
    throw new ChatApiError(CHAT_UNAVAILABLE_MESSAGE);
  }

  let data: { answer?: string; message?: string; error?: string } | undefined;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = undefined;
    }
  }

  if (!response.ok) {
    const fallback =
      response.status === 429
        ? 'Too many requests. Please wait a bit and try again.'
        : CHAT_UNAVAILABLE_MESSAGE;
    throw new ChatApiError(safeServerMessage(data) ?? fallback, response.status);
  }

  const answer =
    typeof data?.answer === 'string' && data.answer.trim()
      ? data.answer
      : "I'm sorry, I couldn't generate a response.";

  return { answer };
}
