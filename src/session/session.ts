import * as SecureStore from "expo-secure-store";

export type StoredSession = {
  token: string;
  refreshToken: string;
};

const tokenKey = "biblioteca_personal_token";
const refreshKey = "biblioteca_personal_refresh_token";

export async function saveSession(session: StoredSession): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(tokenKey, session.token),
    SecureStore.setItemAsync(refreshKey, session.refreshToken),
  ]);
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
  ]);
}
