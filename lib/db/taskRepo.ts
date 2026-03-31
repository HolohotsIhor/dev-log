import { randomUUID } from "crypto";
import { db } from "./client";
import type { Task, CreateTaskInput, UpdateTaskInput, TaskStatus, TaskPriority } from "../types";

export interface TaskFilters {
  status?: TaskStatus;
  sortBy?: "priority" | "createdAt";
  sortDir?: "asc" | "desc";
}

const PRIORITY_ORDER: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };

export function listTasks(filters: TaskFilters = {}): Task[] {
  const rows = db.prepare("SELECT * FROM tasks").all() as Task[];

  const filtered = filters.status
    ? rows.filter((t) => t.status === filters.status)
    : rows;

  const sortBy = filters.sortBy ?? "createdAt";
  const dir = filters.sortDir === "asc" ? 1 : -1;

  return filtered.sort((a, b) => {
    if (sortBy === "priority") {
      return (PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]) * dir;
    }
    return (a.createdAt < b.createdAt ? -1 : 1) * dir;
  });
}

export function getTask(id: string): Task | undefined {
  return db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as Task | undefined;
}

export function createTask(input: CreateTaskInput): Task {
  const now = new Date().toISOString();
  const task: Task = { id: randomUUID(), ...input, createdAt: now, updatedAt: now };

  db.prepare(`
    INSERT INTO tasks (id, title, description, status, priority, createdAt, updatedAt)
    VALUES (@id, @title, @description, @status, @priority, @createdAt, @updatedAt)
  `).run(task);

  return task;
}

export function updateTask(id: string, input: UpdateTaskInput): Task | undefined {
  const existing = getTask(id);
  if (!existing) return undefined;

  const updated: Task = { ...existing, ...input, updatedAt: new Date().toISOString() };

  db.prepare(`
    UPDATE tasks
    SET title = @title, description = @description, status = @status,
        priority = @priority, updatedAt = @updatedAt
    WHERE id = @id
  `).run(updated);

  return updated;
}

export function deleteTask(id: string): boolean {
  const result = db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  return result.changes > 0;
}
