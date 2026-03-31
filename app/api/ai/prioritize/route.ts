import { NextResponse } from 'next/server';
import { runMigrations, listTasks } from '@/lib/db';
import { runPrioritizeAgent } from '@/lib/ai/prioritizeAgent';

runMigrations();

export async function POST() {
  const tasks = listTasks();
  const result = await runPrioritizeAgent(tasks);
  return NextResponse.json(result);
}
