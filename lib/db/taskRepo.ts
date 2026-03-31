import { randomUUID } from 'crypto';
import { db } from './client';
import type { Task, CreateTaskInput, UpdateTaskInput, TaskStatus } from '../types';

export interface TaskFilters {
  status?: TaskStatus;
  sortBy?: 'priority' | 'createdAt';
  sortDir?: 'asc' | 'desc';
}

const PRIORITY_CASE = `CASE t.priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 WHEN 'low' THEN 2 END`;

export function listTasks(filters: TaskFilters = {}): Task[] {
  const { status, sortBy = 'createdAt', sortDir = 'desc' } = filters;
  const dir = sortDir === 'asc' ? 'ASC' : 'DESC';
  const orderBy = sortBy === 'priority' ? `${PRIORITY_CASE} ${dir}` : `t.createdAt ${dir}`;

  const query = `
    SELECT t.*, COUNT(s.id) AS subtaskCount
    FROM tasks t
    LEFT JOIN subtasks s ON s.parentTaskId = t.id
    ${status ? 'WHERE t.status = ?' : ''}
    GROUP BY t.id
    ORDER BY ${orderBy}
  `;

  return db.prepare(query).all(...(status ? [status] : [])) as Task[];
}

export function getTask(id: string): Task | undefined {
  return db
    .prepare(
      `SELECT t.*, COUNT(s.id) AS subtaskCount
       FROM tasks t
       LEFT JOIN subtasks s ON s.parentTaskId = t.id
       WHERE t.id = ?
       GROUP BY t.id`,
    )
    .get(id) as Task | undefined;
}

export function createTask(input: CreateTaskInput): Task {
  const now = new Date().toISOString();
  const id = randomUUID();

  db.prepare(
    `
    INSERT INTO tasks (id, title, description, status, priority, createdAt, updatedAt)
    VALUES (@id, @title, @description, @status, @priority, @createdAt, @updatedAt)
  `,
  ).run({ id, ...input, createdAt: now, updatedAt: now });

  return getTask(id)!;
}

export function updateTask(
  id: string,
  input: UpdateTaskInput,
): Task | undefined {
  const existing = getTask(id);
  if (!existing) return undefined;

  const updated = {
    ...existing,
    ...input,
    updatedAt: new Date().toISOString(),
  };

  db.prepare(
    `
    UPDATE tasks
    SET title = @title, description = @description, status = @status,
        priority = @priority, updatedAt = @updatedAt
    WHERE id = @id
  `,
  ).run(updated);

  return getTask(id);
}

export function deleteTask(id: string): boolean {
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  return result.changes > 0;
}
