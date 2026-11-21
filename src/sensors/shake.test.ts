import type { LibroRecord } from "../db/database";
import { pickRandomPendingBook } from "./shake";

describe("pickRandomPendingBook", () => {
  it("selecciona solo libros pendientes", () => {
    const books: LibroRecord[] = [
      {
        id: 1,
        titulo: "Leído",
        autor: "Autor",
        isbn: null,
        estado: "leido",
        portada_uri: null,
        prestado_a: null,
        fecha_prestamo: null,
        creado_en: "2026-11-20",
        remote_id: "one",
        updated_at: null,
        deleted: 0,
        pending: 0,
      },
      {
        id: 2,
        titulo: "Pendiente",
        autor: "Autor",
        isbn: null,
        estado: "pendiente",
        portada_uri: null,
        prestado_a: null,
        fecha_prestamo: null,
        creado_en: "2026-11-20",
        remote_id: "two",
        updated_at: null,
        deleted: 0,
        pending: 0,
      },
    ];

    expect(pickRandomPendingBook(books, () => 0)?.titulo).toBe("Pendiente");
  });
});
