import {
  deleteBookLocal,
  findBookById,
  findBookByIsbn,
  insertBook,
  lendBookLocal,
  countBooksLocal,
  markBookReadLocal,
  restoreBookLocal,
  listLoanedBooksLocal,
  listBooksLocal,
  returnBookLocal,
  updateBookLocal,
  type NewLibro,
  type UpdateLibro,
} from "../repositories/bookRepository";
import type { LibroRecord } from "../db/database";

export class BookValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BookValidationError";
  }
}

export class DuplicateIsbnError extends Error {
  constructor() {
    super("El ISBN ya está registrado");
    this.name = "DuplicateIsbnError";
  }
}

function validateRequiredText(value: string, field: string): void {
  if (value.length < 2 || value.trim().length < 2) {
    throw new BookValidationError(`${field} debe tener al menos 2 caracteres`);
  }
}

export function validateIsbn(isbn: string | null): string | null {
  if (isbn === null || isbn.trim() === "") {
    return null;
  }
  if (!/^(?:\d{10}|\d{13})$/.test(isbn)) {
    throw new BookValidationError("El ISBN debe tener 10 o 13 dígitos");
  }
  return isbn;
}

export function validateBookInput(book: NewLibro): NewLibro {
  validateRequiredText(book.titulo, "El título");
  validateRequiredText(book.autor, "El autor");
  return {
    ...book,
    titulo: book.titulo.trim(),
    autor: book.autor.trim(),
    isbn: validateIsbn(book.isbn),
  };
}

export async function crearLibro(book: NewLibro): Promise<LibroRecord> {
  const validated = validateBookInput(book);
  if (validated.isbn) {
    const existing = await findBookByIsbn(validated.isbn);
    if (existing) {
      throw new DuplicateIsbnError();
    }
  }
  return insertBook(validated);
}

export async function listarLibros(): Promise<LibroRecord[]> {
  return listBooksLocal();
}

export function filtrarLibros(
  books: LibroRecord[],
  search: string,
  estado: "pendiente" | "leyendo" | "leido" | "todos",
): LibroRecord[] {
  const term = search.trim().toLowerCase();

  return books.filter((book) => {
    const matchesSearch =
      term === "" ||
      book.titulo.toLowerCase().includes(term) ||
      book.autor.toLowerCase().includes(term);
    const matchesState =
      estado === "todos" || book.estado === estado;

    return matchesSearch && matchesState;
  });
}

export async function obtenerLibro(id: number): Promise<LibroRecord | null> {
  return findBookById(id);
}

export async function editarLibro(
  id: number,
  book: UpdateLibro,
): Promise<LibroRecord | null> {
  const validated = validateBookInput(book);
  if (validated.isbn) {
    const existing = await findBookByIsbn(validated.isbn);
    if (existing && existing.id !== id) {
      throw new DuplicateIsbnError();
    }
  }
  return updateBookLocal(id, {
    ...validated,
    prestado_a: book.prestado_a,
    fecha_prestamo: book.fecha_prestamo,
  });
}

export async function eliminarLibro(id: number): Promise<boolean> {
  return deleteBookLocal(id);
}

export class AlreadyLoanedError extends Error {
  constructor() {
    super("El libro ya está prestado");
    this.name = "AlreadyLoanedError";
  }
}

export function validateLoan(
  prestadoA: string,
  fechaPrestamo: string,
): { prestadoA: string; fechaPrestamo: string } {
  if (prestadoA.trim().length === 0) {
    throw new BookValidationError("La persona es obligatoria");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaPrestamo)) {
    throw new BookValidationError("La fecha debe tener formato YYYY-MM-DD");
  }
  const date = new Date(`${fechaPrestamo}T00:00:00.000Z`);
  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== fechaPrestamo
  ) {
    throw new BookValidationError("La fecha no es válida");
  }
  return { prestadoA: prestadoA.trim(), fechaPrestamo };
}

export async function prestar(
  id: number,
  prestadoA: string,
  fechaPrestamo: string,
): Promise<LibroRecord | null> {
  const book = await findBookById(id);
  if (!book) {
    return null;
  }
  if (book.prestado_a !== null || book.fecha_prestamo !== null) {
    throw new AlreadyLoanedError();
  }
  const validated = validateLoan(prestadoA, fechaPrestamo);
  return lendBookLocal(id, validated.prestadoA, validated.fechaPrestamo);
}

export async function devolver(
  id: number,
): Promise<LibroRecord | null> {
  return returnBookLocal(id);
}

export async function listarPrestados(): Promise<LibroRecord[]> {
  return listLoanedBooksLocal();
}

export async function prestarVarios(
  ids: number[],
  prestadoA: string,
  fechaPrestamo: string,
): Promise<LibroRecord[]> {
  const validated = validateLoan(prestadoA, fechaPrestamo);
  const books: LibroRecord[] = [];

  for (const id of ids) {
    const book = await findBookById(id);
    if (!book) {
      throw new BookValidationError("Uno de los libros ya no existe");
    }
    if (book.prestado_a !== null || book.fecha_prestamo !== null) {
      throw new AlreadyLoanedError();
    }
  }

  for (const id of ids) {
    const updated = await lendBookLocal(
      id,
      validated.prestadoA,
      validated.fechaPrestamo,
    );
    if (updated) books.push(updated);
  }
  return books;
}

export async function obtenerContadores() {
  return countBooksLocal();
}

export async function marcarLeido(id: number): Promise<LibroRecord | null> {
  return markBookReadLocal(id);
}

export async function deshacerEliminacion(id: number): Promise<boolean> {
  return restoreBookLocal(id);
}
