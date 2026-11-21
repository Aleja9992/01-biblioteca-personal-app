import { useCallback, useState } from "react";
import { AppState } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { useFocusEffect, useRouter } from "expo-router";
import { ApiClientError } from "../api/client";
import { isDemoSession } from "../session/session";
import { synchronizeBooks } from "./syncService";

type SyncState = {
  syncing: boolean;
  error: string | null;
  revision: number;
};

export function useBookSynchronization(): SyncState & { retry: () => void } {
  const router = useRouter();
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<SyncState>({
    syncing: false,
    error: null,
    revision: 0,
  });

  const retry = useCallback(() => {
    setAttempt((current) => current + 1);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      let running = false;

      async function synchronize() {
        if (!active || running) return;
        running = true;

        try {
          if (await isDemoSession()) {
            if (active) {
              setState((current) => ({
                ...current,
                syncing: false,
                error: null,
              }));
            }
            return;
          }
          setState((current) => ({ ...current, syncing: true, error: null }));
          await synchronizeBooks();
          if (active) {
            setState((current) => ({
              syncing: false,
              error: null,
              revision: current.revision + 1,
            }));
          }
        } catch (error) {
          if (active && error instanceof ApiClientError && error.status === 401) {
            router.replace("/login");
          } else if (active) {
            setState((current) => ({
              ...current,
              syncing: false,
              error:
                error instanceof Error
                  ? `No se pudo sincronizar: ${error.message}`
                  : "No se pudo sincronizar. Inténtalo nuevamente.",
            }));
          }
        } finally {
          running = false;
        }
      }

      const unsubscribe = NetInfo.addEventListener((connection) => {
        if (connection.isConnected) void synchronize();
      });
      const appStateSubscription = AppState.addEventListener(
        "change",
        (appState) => {
          if (appState === "active") void synchronize();
        },
      );

      void synchronize();

      return () => {
        active = false;
        unsubscribe();
        appStateSubscription.remove();
      };
    }, [attempt, router]),
  );

  return { ...state, retry };
}
