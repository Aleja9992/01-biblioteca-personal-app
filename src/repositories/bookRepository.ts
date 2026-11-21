import { getDatabase, type LibroRecord } from "../db/database";

export type NewLibro = {
  titulo: string;
  autor: string;
  isbn: string | null;
  estado: "pendiente" | "leyendo" | "leido";
  portada_uri: string | null;
};

export type UpdateLibro = NewLibro & {
  prestado_a: string | null;
  fecha_prestamo: string | null;
};

export function createRemoteId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    const value = character === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export async function findBookById(id: number): Promise<LibroRecord | null> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<LibroRecord>(
    "SELECT * FROM libro WHERE id = ? AND deleted = 0;",
    [id],
  );
  return result ?? null;
}

export async function findBookByIsbn(isbn: string): Promise<LibroRecord | null> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<LibroRecord>(
    "SELECT * FROM libro WHERE isbn = ? AND deleted = 0;",
    [isbn],
  );
  return result ?? null;
}

export async function listBooksLocal(): Promise<LibroRecord[]> {
  const database = await getDatabase();
  return database.getAllAsync<LibroRecord>(
    "SELECT * FROM libro WHERE deleted = 0 ORDER BY id DESC;",
  );
}

export async function searchBooksLocal(
  search: string,
  estado: "pendiente" | "leyendo" | "leido" | "todos",
): Promise<LibroRecord[]> {
  const database = await getDatabase();
  const term = search.trim();
  const values: string[] = [];
  const conditions = ["deleted = 0"];

  if (term !== "") {
    values.push(`%${term.toLowerCase()}%`, `%${term.toLowerCase()}%`);
    conditions.push(
      "(LOWER(titulo) LIKE ? OR LOWER(autor) LIKE ?)",
    );
  }

  if (estado !== "todos") {
    values.push(estado);
    conditions.push("estado = ?");
  }

  return database.getAllAsync<LibroRecord>(
    `SELECT * FROM libro
     WHERE ${conditions.join(" AND ")}
     ORDER BY id DESC;`,
    values,
  );
}

export async function insertBook(
  book: NewLibro,
  remoteId = createRemoteId(),
): Promise<LibroRecord> {
  const database = await getDatabase();
  const now = new Date().toISOString();
  const result = await database.runAsync(
    `INSERT INTO libro
      (titulo, autor, isbn, estado, portada_uri, prestado_a, fecha_prestamo,
       remote_id, updated_at, deleted, pending)
     VALUES (?, ?, ?, ?, ?, NULL, NULL, ?, ?, 0, 1);`,
    [
      book.titulo,
      book.autor,
      book.isbn,
      book.estado,
      book.portada_uri,
      remoteId,
      now,
    ],
  );

  const created = await findBookById(result.lastInsertRowId);
  if (!created) {
    throw new Error("No se pudo recuperar el libro creado.");
  }
  return created;
}

export async function updateBookLocal(
  id: number,
  book: UpdateLibro,
): Promise<LibroRecord | null> {
  const database = await getDatabase();
  const now = new Date().toISOString();
  await database.runAsync(
    `UPDATE libro
     SET titulo = ?, autor = ?, isbn = ?, estado = ?, portada_uri = ?,
         prestado_a = ?, fecha_prestamo = ?, updated_at = ?, pending = 1
     WHERE id = ? AND deleted = 0;`,
    [
      book.titulo,
      book.autor,
      book.isbn,
      book.estado,
      book.portada_uri,
      book.prestado_a,
      book.fecha_prestamo,
      now,
      id,
    ],
  );
  return findBookById(id);
}

export async function deleteBookLocal(id: number): Promise<boolean> {
  const database = await getDatabase();
  const now = new Date().toISOString();
  const result = await database.runAsync(
    `UPDATE libro
     SET deleted = 1, updated_at = ?, pending = 1
     WHERE id = ? AND deleted = 0;`,
    [now, id],
  );
  return result.changes > 0;
}

export async function lendBookLocal(
  id: number,
  prestadoA: string,
  fechaPrestamo: string,
): Promise<LibroRecord | null> {
  const database = await getDatabase();
  const now = new Date().toISOString();
  await database.runAsync(
    `UPDATE libro
     SET prestado_a = ?, fecha_prestamo = ?, updated_at = ?, pending = 1
     WHERE id = ? AND deleted = 0;`,
    [prestadoA, fechaPrestamo, now, id],
  );
  return findBookById(id);
}

export async function returnBookLocal(
  id: number,
): Promise<LibroRecord | null> {
  const database = await getDatabase();
  const now = new Date().toISOString();
  await database.runAsync(
    `UPDATE libro
     SET prestado_a = NULL, fecha_prestamo = NULL, updated_at = ?, pending = 1
     WHERE id = ? AND deleted = 0;`,
    [now, id],
  );
  return findBookById(id);
}

export async function listLoanedBooksLocal(): Promise<LibroRecord[]> {
  const database = await getDatabase();
  return database.getAllAsync<LibroRecord>(
    `SELECT * FROM libro
     WHERE deleted = 0 AND prestado_a IS NOT NULL
     ORDER BY fecha_prestamo DESC, id DESC;`,
  );
}

export type LibroCounters = {
  total: number;
  leidos: number;
  prestados: number;
};

export async function countBooksLocal(): Promise<LibroCounters> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{
    total: number;
    leidos: number;
    prestados: number;
  }>(
    `SELECT
       COUNT(*) AS total,
       SUM(CASE WHEN estado = 'leido' THEN 1 ELSE 0 END) AS leidos,
       SUM(CASE WHEN prestado_a IS NOT NULL THEN 1 ELSE 0 END) AS prestados
     FROM libro
     WHERE deleted = 0;`,
  );

  return {
    total: result?.total ?? 0,
    leidos: result?.leidos ?? 0,
    prestados: result?.prestados ?? 0,
  };
}

export async function markBookReadLocal(id: number): Promise<LibroRecord | null> {
  const database = await getDatabase();
  const now = new Date().toISOString();
  await database.runAsync(
    `UPDATE libro
     SET estado = 'leido', updated_at = ?, pending = 1
     WHERE id = ? AND deleted = 0;`,
    [now, id],
  );
  return findBookById(id);
}

export async function restoreBookLocal(id: number): Promise<boolean> {
  const database = await getDatabase();
  const now = new Date().toISOString();
  const result = await database.runAsync(
    `UPDATE libro
     SET deleted = 0, updated_at = ?, pending = 1
     WHERE id = ? AND deleted = 1;`,
    [now, id],
  );
  return result.changes > 0;
}

export async function getPendingBooksLocal(): Promise<LibroRecord[]> {
  const database = await getDatabase();
  const books = await database.getAllAsync<LibroRecord>(
    "SELECT * FROM libro WHERE pending = 1 ORDER BY id ASC;",
  );
  const pending: LibroRecord[] = [];

  for (const book of books) {
    if (book.remote_id && isUuid(book.remote_id)) {
      pending.push(book);
      continue;
    }

    const remoteId = createRemoteId();
    await database.runAsync(
      "UPDATE libro SET remote_id = ?, pending = 1 WHERE id = ?;",
      [remoteId, book.id],
    );
    pending.push({ ...book, remote_id: remoteId, pending: 1 });
  }

  return pending;
}

export async function findBookByRemoteId(
  remoteId: string,
): Promise<LibroRecord | null> {
  const database = await getDatabase();
  return (
    (await database.getFirstAsync<LibroRecord>(
      "SELECT * FROM libro WHERE remote_id = ?;",
      [remoteId],
    )) ?? null
  );
}

export async function markBookSyncedLocal(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    "UPDATE libro SET pending = 0 WHERE id = ?;",
    [id],
  );
}

export async function getMeta(key: string): Promise<string | null> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ value: string }>(
    "SELECT value FROM app_meta WHERE key = ?;",
    [key],
  );
  return result?.value ?? null;
}

export async function setMeta(key: string, value: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    "INSERT INTO app_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value;",
    [key, value],
  );
}

export type RemoteBook = {
  id: string;
  titulo: string;
  autor: string;
  isbn: string | null;
  estado: "pendiente" | "leyendo" | "leido";
  prestado_a: string | null;
  fecha_prestamo: string | null;
  portada_url: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export async function updateCoverLocal(
  id: number,
  portadaUri: string,
): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    "UPDATE libro SET portada_uri = ?, pending = 1 WHERE id = ?;",
    [portadaUri, id],
  );
}

export async function applyRemoteBook(
  remote: RemoteBook,
): Promise<void> {
  const database = await getDatabase();
  const local = await findBookByRemoteId(remote.id);

  if (local?.pending === 1) return;

  if (local) {
    await database.runAsync(
      `UPDATE libro
       SET titulo = ?, autor = ?, isbn = ?, estado = ?,
           portada_uri = ?, prestado_a = ?, fecha_prestamo = ?,
           updated_at = ?, deleted = ?, pending = 0
       WHERE id = ?;`,
      [
        remote.titulo,
        remote.autor,
        remote.isbn,
        remote.estado,
        remote.portada_url,
        remote.prestado_a,
        remote.fecha_prestamo,
        remote.updated_at,
        remote.deleted_at ? 1 : 0,
        local.id,
      ],
    );
    return;
  }

  if (remote.deleted_at) return;

  await database.runAsync(
    `INSERT INTO libro
      (titulo, autor, isbn, estado, portada_uri, prestado_a, fecha_prestamo,
       creado_en, remote_id, updated_at, deleted, pending)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0);`,
    [
      remote.titulo,
      remote.autor,
      remote.isbn,
      remote.estado,
      remote.portada_url,
      remote.prestado_a,
      remote.fecha_prestamo,
      remote.created_at,
      remote.id,
      remote.updated_at,
    ],
  );
}
