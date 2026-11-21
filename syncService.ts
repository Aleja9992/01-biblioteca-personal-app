import NetInfo from "@react-native-community/netinfo";
import { apiFetch, ApiClientError } from "../api/client";
import type { LibroRecord } from "../db/database";
import {
  applyRemoteBook,
  getMeta,
  getPendingBooksLocal,
  markBookSyncedLocal,
  setMeta,
  type RemoteBook,
  updateCoverLocal,
} from "../repositories/bookRepository";
import { reduceAndUploadCover } from "../sensors/coverUpload";

export type SyncResult = {
  enviados: number;
  recibidos: number;
  fallidos: number;
};

let running: Promise<SyncResult> | null = null;

// El layout la dispara en cada navegación: se reutiliza la sincronización en curso.
export function synchronizeBooks(): Promise<SyncResult> {
  running ??= runSync().finally(() => {
    running = null;
  });
  return running;
}

function hasStatus(error: unknown, status: number): boolean {
  return error instanceof ApiClientError && error.status === status;
}

async function deleteRemote(remoteId: string): Promise<void> {
  try {
    await apiFetch(`/api/libros/${remoteId}`, { method: "DELETE" });
  } catch (error) {
    if (hasStatus(error, 404)) return; // nunca llegó al servidor
    if (!hasStatus(error, 409)) throw error;
    // La API no borra libros prestados: primero se registra la devolución.
    await apiFetch(`/api/libros/${remoteId}/prestamo`, { method: "DELETE" });
    await apiFetch(`/api/libros/${remoteId}`, { method: "DELETE" });
  }
}

async function pushBook(book: LibroRecord, remoteId: string): Promise<void> {
  if (book.deleted === 1) {
    await deleteRemote(remoteId);
    return;
  }

  let portadaUrl = book.portada_uri;
  if (portadaUrl && !/^https?:\/\//i.test(portadaUrl)) {
    const uploaded = await reduceAndUploadCover(portadaUrl);
    if (uploaded.ok) {
      portadaUrl = uploaded.url;
      await updateCoverLocal(book.id, portadaUrl);
    } else {
      portadaUrl = null;
    }
  }

  await apiFetch(`/api/libros/${remoteId}`, {
    method: "PUT",
    body: JSON.stringify({
      titulo: book.titulo,
      autor: book.autor,
      isbn: book.isbn,
      estado: book.estado,
      portada_url: portadaUrl,
    }),
  });

  if (book.prestado_a && book.fecha_prestamo) {
    try {
      await apiFetch(`/api/libros/${remoteId}/prestamo`, {
        method: "PUT",
        body: JSON.stringify({
          prestado_a: book.prestado_a,
          fecha_prestamo: book.fecha_prestamo,
        }),
      });
    } catch (error) {
      if (!hasStatus(error, 409)) throw error; // ya estaba prestado en el servidor
    }
  } else {
    await apiFetch(`/api/libros/${remoteId}/prestamo`, { method: "DELETE" });
  }
}

async function runSync(): Promise<SyncResult> {
  const connection = await NetInfo.fetch();
  if (!connection.isConnected) {
    return { enviados: 0, recibidos: 0, fallidos: 0 };
  }

  let enviados = 0;
  let fallidos = 0;
  const pending = await getPendingBooksLocal();

  for (const book of pending) {
    if (!book.remote_id) continue;
    try {
      await pushBook(book, book.remote_id);
      await markBookSyncedLocal(book.id);
      enviados += 1;
    } catch (error) {
      // Sesión caducada: no tiene sentido seguir con el resto.
      if (hasStatus(error, 401)) throw error;
      // Un libro con error queda pending y se reintenta en la próxima sincronización.
      fallidos += 1;
    }
  }

  const since = (await getMeta("sync_since")) ?? undefined;
  let cursor: string | undefined;
  let recibidos = 0;
  let servidorAhora: string | null = null;

  do {
    const params = new URLSearchParams();
    if (since) params.set("since", since);
    if (cursor) params.set("cursor", cursor);

    const response = await apiFetch(
      `/api/libros${params.toString() ? `?${params.toString()}` : ""}`,
    );
    const page = (await response.json()) as {
      items: RemoteBook[];
      servidor_ahora: string;
      next_cursor: string | null;
    };

    for (const remote of page.items) {
      await applyRemoteBook(remote);
      recibidos += 1;
    }

    servidorAhora = page.servidor_ahora;
    cursor = page.next_cursor ?? undefined;
  } while (cursor);

  if (servidorAhora) {
    await setMeta("sync_since", servidorAhora);
  }

  return { enviados, recibidos, fallidos };
}
