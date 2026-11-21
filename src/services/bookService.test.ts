jest.mock("../repositories/bookRepository", () => ({
  findBookByIsbn: jest.fn(),
  insertBook: jest.fn(),
  findBookById: jest.fn(),
  updateBookLocal: jest.fn(),
  deleteBookLocal: jest.fn(),
  listBooksLocal: jest.fn(),
  lendBookLocal: jest.fn(),
  returnBookLocal: jest.fn(),
  listLoanedBooksLocal: jest.fn(),
  countBooksLocal: jest.fn(),
  markBookReadLocal: jest.fn(),
  restoreBookLocal: jest.fn(),
}));

import * as repository from "../repositories/bookRepository";
import {
  AlreadyLoanedError,
  DuplicateIsbnError,
  crearLibro,
  prestar,
  validateBookInput,
  validateIsbn,
} from "./bookService";

describe("bookService", () => {
  it("rechaza un ISBN duplicado", async () => {
    jest.mocked(repository.findBookByIsbn).mockResolvedValue({
      id: 1,
      titulo: "Existente",
      autor: "Autor",
      isbn: "9781234567897",
      estado: "pendiente",
      portada_uri: null,
      prestado_a: null,
      fecha_prestamo: null,
      creado_en: "2026-11-20",
      remote_id: "remote",
      updated_at: null,
      deleted: 0,
      pending: 0,
    });

    await expect(
      crearLibro({
        titulo: "Nuevo",
        autor: "Autor",
        isbn: "9781234567897",
        estado: "pendiente",
        portada_uri: null,
      }),
    ).rejects.toBeInstanceOf(DuplicateIsbnError);
  });

  it("rechaza prestar un libro ya prestado", async () => {
    jest.mocked(repository.findBookById).mockResolvedValue({
      id: 1,
      titulo: "Libro",
      autor: "Autor",
      isbn: null,
      estado: "pendiente",
      portada_uri: null,
      prestado_a: "Ana",
      fecha_prestamo: "2026-11-20",
      creado_en: "2026-11-20",
      remote_id: "remote",
      updated_at: null,
      deleted: 0,
      pending: 0,
    });

    await expect(prestar(1, "Luis", "2026-11-20")).rejects.toBeInstanceOf(
      AlreadyLoanedError,
    );
  });

  it("valida título, autor e ISBN", () => {
    expect(() =>
      validateBookInput({
        titulo: " ",
        autor: "Autor",
        isbn: null,
        estado: "pendiente",
        portada_uri: null,
      }),
    ).toThrow();
    expect(validateIsbn("1234567890")).toBe("1234567890");
  });
});
