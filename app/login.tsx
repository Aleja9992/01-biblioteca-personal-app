import { useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { apiFetch, ApiClientError } from "../src/api/client";
import { saveDemoSession, saveSession } from "../src/session/session";

export default function LoginScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "registro">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (
      __DEV__ &&
      mode === "login" &&
      email.trim().toLowerCase() === "demo@biblioteca.local" &&
      password === "biblioteca123"
    ) {
      try {
        await saveDemoSession();
        router.replace("/(tabs)");
      } catch {
        setError("No se pudo iniciar la sesión de prueba");
      }
      return;
    }

    if (!email.includes("@")) {
      setError("Introduce un correo válido");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    try {
      const response = await apiFetch(
        mode === "login" ? "/api/auth/login" : "/api/auth/registro",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        },
        false,
      );
      const session = (await response.json()) as {
        token: string;
        refreshToken: string;
      };
      await saveSession(session);
      router.replace("/(tabs)");
    } catch (caught) {
      setError(
        caught instanceof ApiClientError
          ? caught.details.error
          : "No se pudo iniciar sesión",
      );
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
      </Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Correo"
        accessibilityLabel="Correo electrónico"
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Contraseña"
        accessibilityLabel="Contraseña"
        secureTextEntry
        style={styles.input}
      />
      {__DEV__ && mode === "login" ? (
        <Text style={styles.demoHint}>
          Usuario de prueba: demo@biblioteca.local · Contraseña: biblioteca123
        </Text>
      ) : null}
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={mode === "login" ? "Iniciar sesión" : "Registrarse"}
        onPress={submit}
        style={styles.button}
      >
        <Text>{mode === "login" ? "Entrar" : "Registrarse"}</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          mode === "login" ? "Cambiar a registro" : "Cambiar a inicio de sesión"
        }
        onPress={() =>
          setMode((current) => (current === "login" ? "registro" : "login"))
        }
      >
        <Text>
          {mode === "login" ? "Crear una cuenta" : "Ya tengo una cuenta"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 16, gap: 12 },
  title: { fontSize: 24, textAlign: "center" },
  input: { borderWidth: 1, borderRadius: 8, padding: 12 },
  error: { color: "#b91c1c" },
  demoHint: { color: "#4b5563", textAlign: "center" },
  button: { borderWidth: 1, borderRadius: 8, padding: 12, alignItems: "center" },
});
