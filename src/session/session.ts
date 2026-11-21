import * as SecureStore from "expo-secure-store";

export type StoredSession = {
  token: string;
  refreshToken: string;
};

const tokenKey = "biblioteca_personal_token";
const refreshKey = "biblioteca_personal_refresh_token";
const demoSessionKey = "biblioteca_personal_demo_session";

export async function saveSession(session: StoredSession): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(tokenKey, session.token),
    SecureStore.setItemAsync(refreshKey, session.refreshToken),
    SecureStore.deleteItemAsync(demoSessionKey),
  ]);
}

export async function saveDemoSession(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(tokenKey),
    SecureStore.deleteItemAsync(refreshKey),
    SecureStore.setItemAsync(demoSessionKey, "1"),
  ]);
}

export async function isDemoSession(): Promise<boolean> {
  return (
    __DEV__ &&
    (await SecureStore.getItemAsync(demoSessionKey)) === "1"
  );
}

export async function getSession(): Promise<StoredSession | null> {
  const [token, refreshToken] = await Promise.all([
    SecureStore.getItemAsync(tokenKey),
    SecureStore.getItemAsync(refreshKey),
  ]);

  if (!token || !refreshToken) return null;
  return { token, refreshToken };
}

export async function clearSession(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(tokenKey),
    SecureStore.deleteItemAsync(refreshKey),
    SecureStore.deleteItemAsync(demoSessionKey),
  ]);
}
