import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { getSession } from "../src/session/session";
import { apiFetch } from "../src/api/client";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const session = await getSession();
        if (!session) {
          if (active) {
            setReady(true);
            if (segments[0] !== "login") router.replace("/login");
          }
          return;
        }

        await apiFetch("/api/auth/yo", {}, true);
        if (active) {
          setReady(true);
          if (segments[0] === "login") router.replace("/(tabs)");
        }
      } catch {
        if (active) {
          setReady(true);
          if (segments[0] !== "login") router.replace("/login");
        }
      }
    }

    void checkSession();
    return () => {
      active = false;
    };
  }, [router, segments]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack />
    </GestureHandlerRootView>
  );
}
