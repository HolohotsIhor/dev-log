import { db } from "./client";

export function runMigrations(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id         TEXT PRIMARY KEY,
      title      TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      status     TEXT NOT NULL DEFAULT 'todo'
                   CHECK(status IN ('todo','in-progress','done')),
      priority   TEXT NOT NULL DEFAULT 'medium'
                   CHECK(priority IN ('low','medium','high')),
      createdAt  TEXT NOT NULL,
      updatedAt  TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subtasks (
      id           TEXT PRIMARY KEY,
      parentTaskId TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      title        TEXT NOT NULL,
      status       TEXT NOT NULL DEFAULT 'todo'
                     CHECK(status IN ('todo','in-progress','done')),
      createdAt    TEXT NOT NULL
    );
  `);
}
