jest.mock("../session/session", () => ({
  getSession: jest.fn().mockResolvedValue(null),
  isDemoSession: jest.fn().mockResolvedValue(false),
}));

import { isDemoSession } from "../session/session";
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
});
