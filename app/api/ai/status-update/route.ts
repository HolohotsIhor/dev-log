import { NextResponse } from 'next/server';
import { z } from 'zod';
import { runMigrations, getTask, listSubtasks } from '@/lib/db';
import { runStatusUpdateAgent } from '@/lib/ai/statusUpdateAgent';

runMigrations();

const requestSchema = z.object({ taskId: z.string() });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const task = getTask(parsed.data.taskId);
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const subtasks = listSubtasks(task.id);

  try {
    const update = await runStatusUpdateAgent(task, subtasks);
    return NextResponse.json({ update });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
