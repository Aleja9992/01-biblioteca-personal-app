import NetInfo from "@react-native-community/netinfo";
import { ApiClientError, apiFetch } from "../api/client";
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
};

let synchronization: Promise<SyncResult> | null = null;
let rerunRequested = false;

export function synchronizeBooks(): Promise<SyncResult> {
  if (synchronization) {
    rerunRequested = true;
    return synchronization;
  }

  const current = (async () => {
    let result: SyncResult;
    do {
      rerunRequested = false;
      result = await synchronizeBooksOnce();
    } while (rerunRequested);
    return result;
  })();
  const wrapped = current.finally(() => {
    if (synchronization === wrapped) {
      synchronization = null;
      rerunRequested = false;
    }
  });
  synchronization = wrapped;
  return wrapped;
}

async function synchronizeBooksOnce(): Promise<SyncResult> {
  const connection = await NetInfo.fetch();
  if (!connection.isConnected) {
    return { enviados: 0, recibidos: 0 };
  }

  let enviados = 0;
  const pending = await getPendingBooksLocal();

  for (const book of pending) {
    if (!book.remote_id) {
      throw new Error(`El libro local ${book.id} no tiene un ID remoto`);
    }

    if (book.deleted === 1) {
      try {
        await apiFetch(`/api/libros/${book.remote_id}`, { method: "DELETE" });
      } catch (error) {
        if (!(error instanceof ApiClientError && error.status === 404)) {
          throw error;
        }
      }
      await markBookSyncedLocal(book.id);
      enviados += 1;
      continue;
    }

    let portadaUrl = book.portada_uri;
    if (portadaUrl && !/^https?:\/\//i.test(portadaUrl)) {
      const uploaded = await reduceAndUploadCover(portadaUrl);
      if (uploaded.ok) {
        portadaUrl = uploaded.url;
        await updateCoverLocal(book.id, portadaUrl);
      } else {
        throw new Error(uploaded.message);
      }
    }

    await apiFetch(`/api/libros/${book.remote_id}`, {
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
      await apiFetch(`/api/libros/${book.remote_id}/prestamo`, {
        method: "PUT",
        body: JSON.stringify({
          prestado_a: book.prestado_a,
          fecha_prestamo: book.fecha_prestamo,
        }),
      });
    } else {
      await apiFetch(`/api/libros/${book.remote_id}/prestamo`, {
        method: "DELETE",
      });
    }

    await markBookSyncedLocal(book.id);
    enviados += 1;
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

  return { enviados, recibidos };
}
