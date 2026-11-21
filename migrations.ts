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
  {
    // Los remote_id antiguos (no UUID) nunca fueron aceptados por la API: se regeneran como UUID v4.
    version: 3,
    sql: `
      UPDATE libro SET pending = 1, remote_id =
        lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' ||
        substr(lower(hex(randomblob(2))), 2) || '-' ||
        substr('89ab', abs(random()) % 4 + 1, 1) ||
        substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))
      WHERE remote_id IS NULL OR length(remote_id) <> 36;
    `,
  },
] as const;
