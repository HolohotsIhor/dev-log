export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMClient {
  complete(messages: Message[]): Promise<string>;
}

function createOpenAIClient(apiKey: string, model: string): LLMClient {
  return {
    async complete(messages) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model, messages, temperature: 0.3 }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message ?? `OpenAI error ${res.status}`);
      }

      const data = await res.json();
      return data.choices[0].message.content as string;
    },
  };
}

function createAnthropicClient(apiKey: string, model: string): LLMClient {
  return {
    async complete(messages) {
      const system = messages.find((m) => m.role === 'system')?.content ?? '';
      const userMessages = messages.filter((m) => m.role !== 'system');

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({ model, max_tokens: 1024, system, messages: userMessages }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message ?? `Anthropic error ${res.status}`);
      }

      const data = await res.json();
      const text = data?.content?.[0]?.text;
      if (!text) throw new Error(`Anthropic returned empty content (model: ${model})`);
      return text as string;
    },
  };
}

// Deterministic mock — returns fixture responses without any API calls.
// Controlled by LLM_MOCK=true in .env.local.
function createMockClient(): LLMClient {
  return {
    async complete(messages) {
      const lastUser = messages.findLast((m) => m.role === 'user')?.content ?? '';

      if (lastUser.includes('CLARIFICATION_CHECK')) {
        return JSON.stringify({ needsClarification: false, questions: [] });
      }

      if (lastUser.includes('DECOMPOSE')) {
        return JSON.stringify({
          subtasks: [
            'Define acceptance criteria',
            'Create technical design doc',
            'Implement core logic',
            'Write unit tests',
            'Code review & merge',
          ],
        });
      }

      if (lastUser.includes('PRIORITIZE')) {
        return JSON.stringify({
          orderedIds: [],
          reasoning:
            'Mock mode: tasks sorted by priority descending. High-priority items addressed first, then by age (oldest wins) to avoid starvation.',
        });
      }

      return 'Mock response — set LLM_MOCK=false and provide LLM_API_KEY.';
    },
  };
}

export function getLLMClient(): LLMClient {
  const mock = process.env.LLM_MOCK === 'true';
  if (mock) return createMockClient();

  const provider = process.env.LLM_PROVIDER ?? 'openai';
  const apiKey = process.env.LLM_API_KEY ?? '';
  const model = process.env.LLM_MODEL ?? 'gpt-4o';

  if (!apiKey) throw new Error('LLM_API_KEY is not set. Set LLM_MOCK=true to use mock mode.');

  if (provider === 'anthropic') return createAnthropicClient(apiKey, model);
  return createOpenAIClient(apiKey, model);
}
