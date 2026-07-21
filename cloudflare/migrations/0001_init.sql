-- 星语塔罗 云端账户与历史记录
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT UNIQUE,
  password_hash TEXT,
  google_sub    TEXT UNIQUE,
  name          TEXT,
  created_at    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS readings (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL,
  question   TEXT,
  spread     TEXT,
  cards      TEXT,   -- JSON
  summary    TEXT,
  ai_text    TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_readings_user ON readings(user_id, created_at DESC);
