import { NextRequest, NextResponse } from "next/server";
import { runMigrations, listTasks, createTask } from "@/lib/db";
import { createTaskSchema, taskFiltersSchema } from "@/lib/validation";
import { ZodError } from "zod";

runMigrations();

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams);
  const filters = taskFiltersSchema.parse(params);
  return NextResponse.json(listTasks(filters));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = createTaskSchema.parse(body);
    const task = createTask(input);
    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }
    throw err;
  }
}
