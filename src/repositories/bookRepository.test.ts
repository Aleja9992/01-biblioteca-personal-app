jest.mock("../db/database", () => ({
  getDatabase: jest.fn(),
}));

import { getDatabase } from "../db/database";
import {
  createRemoteId,
  getPendingBooksLocal,
} from "./bookRepository";

describe("createRemoteId", () => {
  it("genera IDs UUID v4 compatibles con la API", () => {
    expect(createRemoteId()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });
});

describe("getPendingBooksLocal", () => {
  it("reemplaza IDs heredados que la API no acepta", async () => {
    const book = {
      id: 1,
      titulo: "Libro",
      autor: "Autor",
      isbn: null,
      estado: "pendiente" as const,
      portada_uri: null,
      prestado_a: null,
      fecha_prestamo: null,
      creado_en: "2026-11-20T00:00:00.000Z",
      remote_id: "legacy-id",
      updated_at: null,
      deleted: 0,
      pending: 1,
    };
    const runAsync = jest.fn().mockResolvedValue({ changes: 1 });
    const database = {
      getAllAsync: jest.fn().mockResolvedValue([book]),
      runAsync,
    };
    jest.mocked(getDatabase).mockResolvedValue(database as never);

    const [pendingBook] = await getPendingBooksLocal();

    expect(pendingBook.remote_id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(runAsync).toHaveBeenCalledWith(
      "UPDATE libro SET remote_id = ?, pending = 1 WHERE id = ?;",
      [pendingBook.remote_id, book.id],
    );
  });
});
