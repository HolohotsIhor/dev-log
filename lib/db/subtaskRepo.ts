import { randomUUID } from 'crypto';
import { db } from './client';
import type { Subtask, TaskStatus } from '../types';

export function listSubtasks(parentTaskId: string): Subtask[] {
  return db
    .prepare('SELECT * FROM subtasks WHERE parentTaskId = ? ORDER BY createdAt ASC')
    .all(parentTaskId) as Subtask[];
}

export function createSubtask(parentTaskId: string, title: string): Subtask {
  const subtask: Subtask = {
    id: randomUUID(),
    parentTaskId,
    title,
    status: 'todo',
    createdAt: new Date().toISOString(),
  };

  db.prepare(`
    INSERT INTO subtasks (id, parentTaskId, title, status, createdAt)
    VALUES (@id, @parentTaskId, @title, @status, @createdAt)
  `).run(subtask);

  return subtask;
}

export function updateSubtaskStatus(id: string, status: TaskStatus): boolean {
  const result = db.prepare('UPDATE subtasks SET status = ? WHERE id = ?').run(status, id);
  return result.changes > 0;
}

export function deleteSubtask(id: string): boolean {
  const result = db.prepare('DELETE FROM subtasks WHERE id = ?').run(id);
  return result.changes > 0;
}

export function bulkCreateSubtasks(parentTaskId: string, titles: string[]): Subtask[] {
  const insert = db.prepare(`
    INSERT INTO subtasks (id, parentTaskId, title, status, createdAt)
    VALUES (@id, @parentTaskId, @title, @status, @createdAt)
  `);

  const insertMany = db.transaction((items: Subtask[]) => {
    for (const item of items) insert.run(item);
    return items;
  });

  const now = new Date().toISOString();
  const subtasks: Subtask[] = titles.map((title) => ({
    id: randomUUID(),
    parentTaskId,
    title,
    status: 'todo',
    createdAt: now,
  }));

  return insertMany(subtasks);
}
