/**
 * Extracts and parses JSON from an LLM response that may be wrapped
 * in markdown code fences (```json ... ```) or returned as plain text.
 */
export function parseJSON<T = unknown>(raw: string): T {
  const stripped = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();

  return JSON.parse(stripped);
}
