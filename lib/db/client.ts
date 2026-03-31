import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'devlog.db');

// Singleton: one connection per Node.js process (Next.js dev HMR safe via global)
declare global {
  // eslint-disable-next-line no-var
  var __db: Database.Database | undefined;
}

function openDatabase(): Database.Database {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

export const db: Database.Database =
  global.__db ?? (global.__db = openDatabase());
