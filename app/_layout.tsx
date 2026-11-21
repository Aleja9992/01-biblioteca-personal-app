import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { getSession, isDemoSession } from "../src/session/session";
import { ApiClientError, apiFetch } from "../src/api/client";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const isLoginRoute = segments[0] === "login";
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        if (await isDemoSession()) {
          if (active) {
            setReady(true);
            if (isLoginRoute) router.replace("/(tabs)");
          }
          return;
        }

        const session = await getSession();
        if (!session) {
          if (active) {
            setReady(true);
            if (!isLoginRoute) router.replace("/login");
          }
          return;
        }

        await apiFetch("/api/auth/yo", {}, true);
        if (active) {
          setReady(true);
          if (isLoginRoute) router.replace("/(tabs)");
        }
      } catch (error) {
        if (active) {
          setReady(true);
          if (error instanceof ApiClientError && error.status === 401) {
            if (!isLoginRoute) router.replace("/login");
          } else if (isLoginRoute) {
            router.replace("/(tabs)");
          }
        }
      }
    }

    void checkSession();
    return () => {
      active = false;
    };
  }, [isLoginRoute, router]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack />
    </GestureHandlerRootView>
  );
}
