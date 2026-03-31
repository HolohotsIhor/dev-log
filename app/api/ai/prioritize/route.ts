import { NextResponse } from 'next/server';
import { runMigrations, listTasks } from '@/lib/db';
import { runPrioritizeAgent } from '@/lib/ai/prioritizeAgent';

runMigrations();

export async function POST() {
  try {
    const tasks = listTasks();
    const result = await runPrioritizeAgent(tasks);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
