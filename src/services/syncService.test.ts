jest.mock("@react-native-community/netinfo", () => ({
  __esModule: true,
  default: {
    fetch: jest.fn(),
  },
}));

jest.mock("../api/client", () => ({
  ApiClientError: jest.requireActual("../api/client").ApiClientError,
  apiFetch: jest.fn(),
}));

jest.mock("../sensors/coverUpload", () => ({
  reduceAndUploadCover: jest.fn(),
}));

jest.mock("../repositories/bookRepository", () => ({
  applyRemoteBook: jest.fn(),
  getMeta: jest.fn(),
  getPendingBooksLocal: jest.fn(),
  markBookSyncedLocal: jest.fn(),
  setMeta: jest.fn(),
}));

import NetInfo from "@react-native-community/netinfo";
import { ApiClientError, apiFetch } from "../api/client";
import { reduceAndUploadCover } from "../sensors/coverUpload";
import {
  getPendingBooksLocal,
  getMeta,
  markBookSyncedLocal,
} from "../repositories/bookRepository";
import { synchronizeBooks } from "./syncService";

describe("synchronizeBooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("no realiza operaciones sin conexión", async () => {
    jest.mocked(NetInfo.fetch).mockResolvedValue({
      isConnected: false,
    } as never);

    await expect(synchronizeBooks()).resolves.toEqual({
      enviados: 0,
      recibidos: 0,
    });
  });

  it("consulta cambios incrementales después de la cola", async () => {
    jest.mocked(NetInfo.fetch).mockResolvedValue({
      isConnected: true,
    } as never);
    jest.mocked(getPendingBooksLocal).mockResolvedValue([]);
    jest.mocked(getMeta).mockResolvedValue(null);
    jest.mocked(apiFetch).mockImplementation(async () =>
      new Response(
        JSON.stringify({
          items: [],
          servidor_ahora: "2026-11-20T23:00:00.000Z",
          next_cursor: null,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    await expect(synchronizeBooks()).resolves.toEqual({
      enviados: 0,
      recibidos: 0,
    });
    expect(apiFetch).toHaveBeenCalledWith("/api/libros");
  });

  it("deja pendiente un libro si falla la subida de su portada", async () => {
    jest.mocked(NetInfo.fetch).mockResolvedValue({
      isConnected: true,
    } as never);
    jest.mocked(getPendingBooksLocal).mockResolvedValue([
      {
        id: 1,
        titulo: "Libro",
        autor: "Autor",
        isbn: null,
        estado: "pendiente",
        portada_uri: "file:///cover.jpg",
        prestado_a: null,
        fecha_prestamo: null,
        creado_en: "2026-11-20T00:00:00.000Z",
        remote_id: "b22f8c13-c6e9-4cca-86bd-3adab31b2c31",
        updated_at: null,
        deleted: 0,
        pending: 1,
      },
    ]);
    jest.mocked(reduceAndUploadCover).mockResolvedValue({
      ok: false,
      message: "Fallo al subir portada",
    });

    await expect(synchronizeBooks()).rejects.toThrow("Fallo al subir portada");
    expect(apiFetch).not.toHaveBeenCalled();
    expect(markBookSyncedLocal).not.toHaveBeenCalled();
  });

  it("considera sincronizada una eliminación si el libro ya no existe en la API", async () => {
    jest.mocked(NetInfo.fetch).mockResolvedValue({
      isConnected: true,
    } as never);
    jest.mocked(getPendingBooksLocal).mockResolvedValue([
      {
        id: 2,
        titulo: "Eliminado",
        autor: "Autor",
        isbn: null,
        estado: "pendiente",
        portada_uri: null,
        prestado_a: null,
        fecha_prestamo: null,
        creado_en: "2026-11-20T00:00:00.000Z",
        remote_id: "b22f8c13-c6e9-4cca-86bd-3adab31b2c31",
        updated_at: null,
        deleted: 1,
        pending: 1,
      },
    ]);
    jest.mocked(apiFetch)
      .mockRejectedValueOnce(
        new ApiClientError(404, { error: "No encontrado" }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            items: [],
            servidor_ahora: "2026-11-20T23:00:00.000Z",
            next_cursor: null,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );

    await expect(synchronizeBooks()).resolves.toEqual({
      enviados: 1,
      recibidos: 0,
    });
    expect(markBookSyncedLocal).toHaveBeenCalledWith(2);
  });

  it("comparte una sincronización activa entre llamadas simultáneas", async () => {
    let resolveConnection = (_value: { isConnected: boolean }) => {};
    jest.mocked(NetInfo.fetch)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveConnection = resolve;
          }) as never,
      )
      .mockResolvedValue({ isConnected: true } as never);
    jest.mocked(getPendingBooksLocal).mockResolvedValue([]);
    jest.mocked(getMeta).mockResolvedValue(null);
      jest.mocked(apiFetch).mockImplementation(async () =>
        new Response(
        JSON.stringify({
          items: [],
          servidor_ahora: "2026-11-20T23:00:00.000Z",
          next_cursor: null,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const first = synchronizeBooks();
    const second = synchronizeBooks();
    expect(first).toBe(second);

    resolveConnection({ isConnected: true });
    await expect(first).resolves.toEqual({ enviados: 0, recibidos: 0 });
    expect(NetInfo.fetch).toHaveBeenCalledTimes(2);
  });
});
