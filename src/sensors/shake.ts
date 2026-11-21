import type { LibroRecord } from "../db/database";

export function pickRandomPendingBook(
  books: LibroRecord[],
  random = Math.random,
): LibroRecord | null {
  const pending = books.filter((book) => book.estado === "pendiente");
  if (pending.length === 0) return null;
  return pending[Math.floor(random() * pending.length)] ?? null;
}
