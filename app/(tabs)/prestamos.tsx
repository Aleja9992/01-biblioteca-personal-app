import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import type { LibroRecord } from "../../src/db/database";
import { listarPrestados } from "../../src/services/bookService";
import { useBookSynchronization } from "../../src/services/useBookSynchronization";

export default function LoansScreen() {
  const router = useRouter();
  const [books, setBooks] = useState<LibroRecord[]>([]);
  const {
    syncing,
    error: syncError,
    revision: syncRevision,
    retry: retrySync,
  } = useBookSynchronization();

  useEffect(() => {
    let active = true;
    listarPrestados().then((result) => {
      if (active) setBooks(result);
    });
    return () => {
      active = false;
    };
  }, [syncRevision]);

  return (
    <View>
      {syncing ? (
        <Text accessibilityRole="text">Sincronizando con la API...</Text>
      ) : null}
      {syncError ? (
        <View>
          <Text accessibilityRole="alert">{syncError}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Reintentar sincronización"
            onPress={retrySync}
          >
            <Text>Reintentar</Text>
          </Pressable>
        </View>
      ) : null}
      {books.length === 0 ? (
        <Text>No hay libros prestados</Text>
      ) : (
        books.map((book) => (
          <Pressable
            key={book.id}
            accessibilityRole="button"
            accessibilityLabel={`Abrir préstamo de ${book.titulo} a ${book.prestado_a}`}
            onPress={() => router.push(`/libro/${book.id}`)}
          >
            <Text>{book.titulo}</Text>
            <Text>Prestado a: {book.prestado_a}</Text>
            <Text>Fecha: {book.fecha_prestamo}</Text>
          </Pressable>
        ))
      )}
    </View>
  );
}
