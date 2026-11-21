import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import type { LibroRecord } from "../../src/db/database";
import {
  devolver,
  editarLibro,
  eliminarLibro,
  obtenerLibro,
  prestar,
} from "../../src/services/bookService";

export default function BookDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [book, setBook] = useState<LibroRecord | null>(null);
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [prestadoA, setPrestadoA] = useState("");
  const [fechaPrestamo, setFechaPrestamo] = useState("");
  const [coverScale, setCoverScale] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const pinch = Gesture.Pinch().onUpdate((event) => {
    runOnJS(setCoverScale)(Math.max(1, Math.min(3, event.scale)));
  });

  useEffect(() => {
    obtenerLibro(Number(id)).then((result) => {
      if (result) {
        setBook(result);
        setTitulo(result.titulo);
        setAutor(result.autor);
        setIsbn(result.isbn ?? "");
        setPrestadoA(result.prestado_a ?? "");
        setFechaPrestamo(result.fecha_prestamo ?? "");
      }
    });
  }, [id]);

  async function guardar() {
    if (!book) return;
    setError(null);

    try {
      await editarLibro(book.id, {
        titulo,
        autor,
        isbn: isbn.trim() === "" ? null : isbn.trim(),
        estado: book.estado,
        portada_uri: book.portada_uri,
        prestado_a: book.prestado_a,
        fecha_prestamo: book.fecha_prestamo,
      });
      router.back();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo guardar");
    }
  }

  function confirmarEliminacion() {
    if (!book) return;
    Alert.alert(
      "Eliminar libro",
      `¿Eliminar «${book.titulo}»?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            await eliminarLibro(book.id);
            router.replace("/(tabs)");
          },
        },
      ],
    );
  }

  async function registrarPrestamo() {
    if (!book) return;
    setError(null);
    try {
      const updated = await prestar(book.id, prestadoA, fechaPrestamo);
      if (updated) {
        setBook(updated);
        setPrestadoA(updated.prestado_a ?? "");
        setFechaPrestamo(updated.fecha_prestamo ?? "");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo prestar");
    }
  }

  async function registrarDevolucion() {
    if (!book) return;
    setError(null);
    const updated = await devolver(book.id);
    if (updated) {
      setBook(updated);
      setPrestadoA("");
      setFechaPrestamo("");
    }
  }

  return (
    <View style={styles.container}>
      {book?.portada_uri ? (
        <View>
          <GestureDetector gesture={pinch}>
            <Image
              source={{ uri: book.portada_uri }}
              accessibilityLabel={`Portada ampliable de ${book.titulo}`}
              style={{
                width: 160 * coverScale,
                height: 240 * coverScale,
                alignSelf: "center",
              }}
              resizeMode="contain"
            />
          </GestureDetector>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ampliar portada"
            onPress={() =>
              setCoverScale((current) => (current === 1 ? 1.5 : 1))
            }
            style={styles.button}
          >
            <Text>{coverScale === 1 ? "Ampliar portada" : "Reducir portada"}</Text>
          </Pressable>
        </View>
      ) : null}
      <TextInput
        value={titulo}
        onChangeText={setTitulo}
        accessibilityLabel="Título del libro"
        style={styles.input}
      />
      <TextInput
        value={autor}
        onChangeText={setAutor}
        accessibilityLabel="Autor del libro"
        style={styles.input}
      />
      <TextInput
        value={isbn}
        onChangeText={setIsbn}
        accessibilityLabel="ISBN del libro"
        keyboardType="number-pad"
        style={styles.input}
      />
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
      <TextInput
        value={prestadoA}
        onChangeText={setPrestadoA}
        placeholder="Persona a quien se presta"
        accessibilityLabel="Persona a quien se presta el libro"
        style={styles.input}
        editable={book?.prestado_a === null}
      />
      <TextInput
        value={fechaPrestamo}
        onChangeText={setFechaPrestamo}
        placeholder="Fecha YYYY-MM-DD"
        accessibilityLabel="Fecha del préstamo"
        style={styles.input}
        editable={book?.prestado_a === null}
      />
      {book?.prestado_a === null ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Registrar préstamo"
          onPress={registrarPrestamo}
          style={styles.button}
        >
          <Text>Prestar</Text>
        </Pressable>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Registrar devolución"
          onPress={registrarDevolucion}
          style={styles.button}
        >
          <Text>Devolver</Text>
        </Pressable>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Guardar cambios"
        onPress={guardar}
        style={styles.button}
      >
        <Text>Guardar cambios</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Eliminar libro"
        onPress={confirmarEliminacion}
        style={styles.buttonDanger}
      >
        <Text>Eliminar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12 },
  error: { color: "#b91c1c" },
  button: { borderWidth: 1, borderRadius: 8, padding: 12, alignItems: "center" },
  buttonDanger: { borderWidth: 1, borderColor: "#b91c1c", borderRadius: 8, padding: 12, alignItems: "center" },
});
