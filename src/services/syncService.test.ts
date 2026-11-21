jest.mock("@react-native-community/netinfo", () => ({
  __esModule: true,
  default: {
    fetch: jest.fn(),
  },
}));

jest.mock("../api/client", () => ({
  apiFetch: jest.fn(),
}));

jest.mock("../repositories/bookRepository", () => ({
  applyRemoteBook: jest.fn(),
  getMeta: jest.fn(),
  getPendingBooksLocal: jest.fn(),
  markBookSyncedLocal: jest.fn(),
  setMeta: jest.fn(),
}));

import NetInfo from "@react-native-community/netinfo";
import { apiFetch } from "../api/client";
import {
  getPendingBooksLocal,
  getMeta,
} from "../repositories/bookRepository";
import { synchronizeBooks } from "./syncService";

describe("synchronizeBooks", () => {
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
    jest.mocked(apiFetch).mockResolvedValue(
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
});
