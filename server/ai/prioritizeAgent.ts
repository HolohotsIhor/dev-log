import { getLLMClient } from './llmClient';
import { parseJSON } from './parseJSON';
import type { Task, TaskPriority } from '../types';

export interface PrioritizeResult {
  orderedTasks: Task[];
  reasoning: string;
}

// Scoring weights: priority (main signal) + age in days (prevents starvation, capped at 30)
// + in-progress bonus (avoid unnecessary context switching).
// "done" tasks are excluded entirely.
const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  high: 30,
  medium: 20,
  low: 10,
};

function ageInDays(createdAt: string): number {
  const ms = Date.now() - new Date(createdAt).getTime();
  return Math.floor(ms / 86_400_000);
}

function scoreTask(task: Task): number {
  if (task.status === 'done') return -1;
  return (
    PRIORITY_WEIGHT[task.priority] +
    Math.min(ageInDays(task.createdAt), 30) +
    (task.status === 'in-progress' ? 25 : 0)
  );
}

function rankLocally(tasks: Task[]): Task[] {
  return tasks
    .filter((t) => t.status !== 'done')
    .sort((a, b) => scoreTask(b) - scoreTask(a));
}

async function getLLMPlan(
  ranked: Task[],
): Promise<{ orderedIds: string[]; reasoning: string }> {
  const llm = getLLMClient();

  const taskList = ranked
    .map((t, i) => {
      const age = ageInDays(t.createdAt);
      return `${i + 1}. [${t.id}] "${t.title}" | priority:${t.priority} | status:${t.status} | age:${age}d`;
    })
    .join('\n');

  const raw = await llm.complete([
    {
      role: 'system',
      content: `You are an engineering team lead helping a developer plan their workday.

      You receive a list of tasks pre-sorted by a scoring algorithm (priority + age + in-progress bonus).
      Your job is to:
      1. Review the order for logical sense (dependencies, natural grouping, context switching cost)
      2. Optionally reorder if you see a better sequence
      3. Write a concise "plan for the day" — 2-4 sentences, direct and practical

      Respond ONLY with valid JSON:
      {
        "orderedIds": ["id1", "id2", ...],
        "reasoning": "Your plan in 2-4 sentences."
      }`,
    },
    {
      role: 'user',
      content: `PRIORITIZE

      Tasks (pre-scored, best first):
      ${taskList}

      Review this order and return your recommended sequence with reasoning.`,
    },
  ]);

  try {
    const parsed = parseJSON<{ orderedIds: string[]; reasoning: string }>(raw);
    if (
      Array.isArray(parsed.orderedIds) &&
      typeof parsed.reasoning === 'string'
    ) {
      return parsed;
    }
  } catch {
    // fall through to local-ranking fallback below
  }

  return {
    orderedIds: ranked.map((t) => t.id),
    reasoning: 'Ordered by priority score, age, and in-progress status.',
  };
}

export async function runPrioritizeAgent(
  tasks: Task[],
): Promise<PrioritizeResult> {
  const activeTasks = tasks.filter((t) => t.status !== 'done');

  if (activeTasks.length === 0) {
    return { orderedTasks: [], reasoning: 'No active tasks to prioritize.' };
  }

  const ranked = rankLocally(activeTasks);
  const { orderedIds, reasoning } = await getLLMPlan(ranked);

  const byId = Object.fromEntries(ranked.map((t) => [t.id, t]));
  const llmOrdered = orderedIds.flatMap((id) => (byId[id] ? [byId[id]] : []));

  // Append tasks the LLM may have dropped from its ordered list
  const includedIds = new Set(llmOrdered.map((t) => t.id));
  const remainder = ranked.filter((t) => !includedIds.has(t.id));

  return { orderedTasks: [...llmOrdered, ...remainder], reasoning };
}
