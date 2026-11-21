import {
  clearSession,
  getSession,
  isDemoSession,
  saveSession,
} from "../session/session";

export type ApiErrorShape = {
  error: string;
  detalles?: { campo: string; mensaje: string }[];
};

export class ApiClientError extends Error {
  constructor(
    readonly status: number,
    readonly details: ApiErrorShape,
  ) {
    super(details.error);
    this.name = "ApiClientError";
  }
}

function apiUrl(): string {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error("EXPO_PUBLIC_API_URL no está configurada");
  }

  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    throw new Error("EXPO_PUBLIC_API_URL debe ser una URL válida");
  }
  if (url.protocol !== "https:") {
    throw new Error("EXPO_PUBLIC_API_URL debe usar HTTPS");
  }
  return baseUrl.replace(/\/+$/, "");
}

async function request(
  path: string,
  init: RequestInit,
  token?: string,
): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${apiUrl()}${path}`, { ...init, headers });
}

async function responseOrThrow(response: Response): Promise<Response> {
  if (response.ok) return response;
  let body: ApiErrorShape;
  try {
    body = (await response.json()) as ApiErrorShape;
  } catch {
    body = { error: "Error interno" };
  }
  throw new ApiClientError(response.status, body);
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
  allowRefresh = true,
): Promise<Response> {
  if (await isDemoSession()) {
    throw new Error("La sesión demo solo permite operaciones locales");
  }

  const session = await getSession();

  try {
    const first = await request(path, init, session?.token);
    if (first.status !== 401 || !allowRefresh || !session?.refreshToken) {
      return responseOrThrow(first);
    }
  } catch (error) {
    if (error instanceof ApiClientError) {
      if (error.status !== 401) throw error;
    } else {
      throw error;
    }
  }

  try {
    const refreshResponse = await request(
      "/api/auth/refresh",
      {
        method: "POST",
        body: JSON.stringify({ refreshToken: session?.refreshToken }),
      },
      undefined,
    );
    const refreshed = (await responseOrThrow(refreshResponse)) as Response;
    const body = (await refreshed.json()) as {
      token: string;
      refreshToken: string;
    };
    await saveSession({
      token: body.token,
      refreshToken: body.refreshToken,
    });

    const retried = await request(path, init, body.token);
    return responseOrThrow(retried);
  } catch {
    await clearSession();
    throw new ApiClientError(401, {
      error: "Sesión caducada. Inicia sesión nuevamente",
    });
  }
}
