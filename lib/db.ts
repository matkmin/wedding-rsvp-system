import Database from 'better-sqlite3';
import path from 'path';

// Connect to SQLite database in the root of the project
const dbPath = path.join(process.cwd(), 'rsvp.db');
const db = new Database(dbPath);

// Initialize the database table
db.exec(`
  CREATE TABLE IF NOT EXISTS rsvps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    attendance TEXT NOT NULL,
    guests INTEGER DEFAULT 0,
    phone TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;
