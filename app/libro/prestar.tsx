import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { prestarVarios } from "../../src/services/bookService";

export default function LoanMultipleScreen() {
  const router = useRouter();
  const { ids } = useLocalSearchParams<{ ids: string }>();
  const [prestadoA, setPrestadoA] = useState("");
  const [fechaPrestamo, setFechaPrestamo] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function guardar() {
    setError(null);
    const selectedIds = String(ids ?? "")
      .split(",")
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id));

    try {
      await prestarVarios(selectedIds, prestadoA, fechaPrestamo);
      router.replace("/(tabs)/prestamos");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo prestar");
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        value={prestadoA}
        onChangeText={setPrestadoA}
        placeholder="Persona a quien se presta"
        accessibilityLabel="Persona para los préstamos múltiples"
        style={styles.input}
      />
      <TextInput
        value={fechaPrestamo}
        onChangeText={setFechaPrestamo}
        placeholder="Fecha YYYY-MM-DD"
        accessibilityLabel="Fecha de los préstamos múltiples"
        style={styles.input}
      />
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Confirmar préstamos múltiples"
        onPress={guardar}
        style={styles.button}
      >
        <Text>Prestar seleccionados</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12 },
  error: { color: "#b91c1c" },
  button: { borderWidth: 1, borderRadius: 8, padding: 12, alignItems: "center" },
});
