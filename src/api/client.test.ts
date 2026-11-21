jest.mock("../session/session", () => ({
  clearSession: jest.fn(),
  getSession: jest.fn().mockResolvedValue(null),
  isDemoSession: jest.fn().mockResolvedValue(false),
  saveSession: jest.fn(),
}));

import {
  clearSession,
  getSession,
  isDemoSession,
} from "../session/session";
import { apiFetch } from "./client";

describe("apiFetch", () => {
  const originalApiUrl = process.env.EXPO_PUBLIC_API_URL;
  const originalFetch = global.fetch;

  afterEach(() => {
    if (originalApiUrl === undefined) {
      delete process.env.EXPO_PUBLIC_API_URL;
    } else {
      process.env.EXPO_PUBLIC_API_URL = originalApiUrl;
    }
    jest.mocked(getSession).mockResolvedValue(null);
    jest.mocked(isDemoSession).mockResolvedValue(false);
    global.fetch = originalFetch;
  });

  it("rechaza URLs que no usan HTTPS", async () => {
    process.env.EXPO_PUBLIC_API_URL = "http://api.example.test";

    await expect(apiFetch("/api/libros")).rejects.toThrow(
      "EXPO_PUBLIC_API_URL debe usar HTTPS",
    );
  });

  it("no envía solicitudes a la API durante la sesión demo", async () => {
    jest.mocked(isDemoSession).mockResolvedValue(true);
    const fetchSpy = jest.fn();
    global.fetch = fetchSpy;

    await expect(apiFetch("/api/libros")).rejects.toThrow(
      "La sesión demo solo permite operaciones locales",
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("conserva la sesión si el refresh falla temporalmente en el servidor", async () => {
    process.env.EXPO_PUBLIC_API_URL = "https://api.example.test";
    jest.mocked(getSession).mockResolvedValue({
      token: "expired-token",
      refreshToken: "refresh-token",
    });
    const fetchSpy = jest
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "Error interno" }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }),
      );
    global.fetch = fetchSpy;

    await expect(apiFetch("/api/libros")).rejects.toMatchObject({
      status: 503,
    });
    expect(clearSession).not.toHaveBeenCalled();
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("limpia la sesión cuando el refresh token fue rechazado", async () => {
    process.env.EXPO_PUBLIC_API_URL = "https://api.example.test";
    jest.mocked(getSession).mockResolvedValue({
      token: "expired-token",
      refreshToken: "invalid-refresh-token",
    });
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "No autorizado" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      );

    await expect(apiFetch("/api/libros")).rejects.toMatchObject({
      status: 401,
      message: "Sesión caducada. Inicia sesión nuevamente",
    });
    expect(clearSession).toHaveBeenCalledTimes(1);
  });
});
