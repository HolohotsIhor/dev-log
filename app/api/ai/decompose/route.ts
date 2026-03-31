import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { runMigrations, getTask, bulkCreateSubtasks } from '@/lib/db';
import { runDecomposeAgent } from '@/lib/ai/decomposeAgent';

runMigrations();

const requestSchema = z.object({
  taskId: z.string().min(1),
  answers: z.array(z.string()).optional(),
  subtasks: z.array(z.string()).optional(),
  save: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { taskId, answers, subtasks, save } = requestSchema.parse(body);

    const task = getTask(taskId);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (save && subtasks?.length) {
      const created = bulkCreateSubtasks(taskId, subtasks);
      return NextResponse.json({ type: 'subtasks', subtasks, saved: created });
    }

    const result = await runDecomposeAgent(task, answers);

    if (result.type === 'subtasks' && save) {
      const created = bulkCreateSubtasks(taskId, result.subtasks);
      return NextResponse.json({ ...result, saved: created });
    }

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
