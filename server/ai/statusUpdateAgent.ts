import { getLLMClient } from './llmClient';
import type { Task, Subtask } from '../types';

export async function runStatusUpdateAgent(
  task: Task,
  subtasks: Subtask[],
): Promise<string> {
  const llm = getLLMClient();

  const subtasksSection = subtasks.length
    ? `\nSubtasks:\n${subtasks.map((s) => `- [${s.status}] ${s.title}`).join('\n')}`
    : '\nSubtasks: none';

  const raw = await llm.complete([
    {
      role: 'system',
      content: `You are a helpful engineering assistant that writes async status updates for a dev team.

      Write a short Slack-style status update based on the task details provided.

      Rules:
      - 2–4 sentences max
      - Match the tone to the task status: celebratory if done, matter-of-fact if in-progress, planning-oriented if todo
      - Mention what's done, what's in progress, and blockers if any (infer from subtask statuses)
      - Write in first person ("I", "we")
      - No markdown, no bullet points — plain text only`,
    },
    {
      role: 'user',
      content: `STATUS_UPDATE

      Task: "${task.title}"
      Description: "${task.description || '(no description)'}"
      Status: ${task.status}
      Priority: ${task.priority}${subtasksSection}`,
    },
  ]);

  return raw.trim();
}
