export const migrations = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS libro (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        autor TEXT NOT NULL,
        isbn TEXT UNIQUE,
        estado TEXT NOT NULL DEFAULT 'pendiente'
          CHECK (estado IN ('pendiente','leyendo','leido')),
        portada_uri TEXT,
        prestado_a TEXT,
        fecha_prestamo TEXT,
        creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        remote_id TEXT,
        updated_at TEXT,
        deleted INTEGER NOT NULL DEFAULT 0,
        pending INTEGER NOT NULL DEFAULT 0
      );
    `,
  },
  {
    version: 2,
    sql: `
      CREATE TABLE IF NOT EXISTS app_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `,
  },
] as const;
