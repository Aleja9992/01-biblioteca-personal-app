import { useState } from "react";
import { useRouter } from "expo-router";
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { crearLibro } from "../../src/services/bookService";
import { pickCover } from "../../src/sensors/imagePicker";
import { reduceAndUploadCover } from "../../src/sensors/coverUpload";

export default function NewBookScreen() {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [portadaUri, setPortadaUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function solicitarPortada() {
    Alert.alert(
      "Agregar portada",
      "La app usará la galería para seleccionar una imagen del libro.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Agregar portada",
          onPress: async () => {
            const result = await pickCover();
            if (result.ok) {
              setPortadaUri(result.uri);
            } else {
              setError(result.message);
            }
          },
        },
      ],
    );
  }

  async function guardar() {
    setError(null);
    if (titulo.trim().length < 2) {
      setError("El título es obligatorio y debe tener al menos 2 caracteres");
      return;
    }

    try {
      let portadaUrl = portadaUri;
      if (portadaUri) {
        const uploaded = await reduceAndUploadCover(portadaUri);
        if (uploaded.ok) portadaUrl = uploaded.url;
      }
      await crearLibro({
        titulo,
        autor,
        isbn: isbn.trim() === "" ? null : isbn.trim(),
        estado: "pendiente",
        portada_uri: portadaUrl,
      });
      router.replace("/(tabs)");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo guardar");
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        value={titulo}
        onChangeText={setTitulo}
        placeholder="Título"
        accessibilityLabel="Título del libro"
        style={styles.input}
      />
      {portadaUri ? (
        <Image
          source={{ uri: portadaUri }}
          accessibilityLabel="Vista previa de la portada seleccionada"
          style={styles.cover}
          resizeMode="contain"
        />
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Agregar portada desde la galería"
        onPress={solicitarPortada}
        style={styles.button}
      >
        <Text>Agregar portada</Text>
      </Pressable>
      <TextInput
        value={autor}
        onChangeText={setAutor}
        placeholder="Autor"
        accessibilityLabel="Autor del libro"
        style={styles.input}
      />
      <TextInput
        value={isbn}
        onChangeText={setIsbn}
        placeholder="ISBN opcional"
        accessibilityLabel="ISBN del libro"
        keyboardType="number-pad"
        style={styles.input}
      />
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Guardar libro"
        onPress={guardar}
        style={styles.button}
      >
        <Text>Guardar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12 },
  error: { color: "#b91c1c" },
  button: { borderWidth: 1, borderRadius: 8, padding: 12, alignItems: "center" },
  cover: { width: 160, height: 240, alignSelf: "center" },
});
