import { getLLMClient } from './llmClient';
import { parseJSON } from './parseJSON';
import type { Task } from '../types';

export interface ClarificationNeeded {
  type: 'clarification';
  questions: string[];
}

export interface SubtasksReady {
  type: 'subtasks';
  subtasks: string[];
}

export type DecomposeResult = ClarificationNeeded | SubtasksReady;

async function assessClarity(
  task: Task,
): Promise<{ needsClarification: boolean; questions: string[] }> {
  const llm = getLLMClient();

  const raw = await llm.complete([
    {
      role: 'system',
      content: `You are a senior engineering lead. Your job is to assess whether a task description 
is detailed enough to break it down into actionable subtasks.

Respond ONLY with valid JSON in this exact shape:
{"needsClarification": boolean, "questions": string[]}

- If the task is clear: {"needsClarification": false, "questions": []}
- If ambiguous: {"needsClarification": true, "questions": ["Question 1?", "Question 2?"]}
  (max 3 questions, ask only the most important things)`,
    },
    {
      role: 'user',
      content: `CLARIFICATION_CHECK

Task title: "${task.title}"
Task description: "${task.description || '(no description provided)'}"`,
    },
  ]);

  try {
    return parseJSON(raw);
  } catch {
    return { needsClarification: false, questions: [] };
  }
}

async function generateSubtasks(
  task: Task,
  answers?: string[],
): Promise<string[]> {
  const llm = getLLMClient();

  const answersSection = answers?.length
    ? `\nClarification answers:\n${answers.map((a, i) => `${i + 1}. ${a}`).join('\n')}`
    : '';

  const raw = await llm.complete([
    {
      role: 'system',
      content: `You are a senior engineer helping to break down tasks into subtasks.

Generate a list of concrete, actionable subtasks for the given task.

Rules:
- 3 to 7 subtasks
- Each subtask should be independently completable
- Be specific, not vague ("Write API endpoint for X", not "Do backend")
- Order them logically (dependencies first)

Respond ONLY with valid JSON: {"subtasks": ["subtask 1", "subtask 2", ...]}`,
    },
    {
      role: 'user',
      content: `DECOMPOSE

Task title: "${task.title}"
Task description: "${task.description || '(no description)'}"
Priority: ${task.priority}
Status: ${task.status}${answersSection}`,
    },
  ]);

  try {
    const parsed = parseJSON<{ subtasks: string[] }>(raw);
    if (Array.isArray(parsed.subtasks)) return parsed.subtasks;
  } catch {
    // TODO: handle error
  }

  throw new Error('Failed to parse subtasks from LLM response');
}

/**
 * Multi-step decomposition agent:
 *   1. Assess clarity — if the task is too vague, return clarifying questions
 *   2. Generate structured subtasks (with optional clarification answers)
 */
export async function runDecomposeAgent(
  task: Task,
  answers?: string[],
): Promise<DecomposeResult> {
  if (!answers) {
    const assessment = await assessClarity(task);
    if (assessment.needsClarification) {
      return { type: 'clarification', questions: assessment.questions };
    }
  }

  const subtasks = await generateSubtasks(task, answers);
  return { type: 'subtasks', subtasks };
}
