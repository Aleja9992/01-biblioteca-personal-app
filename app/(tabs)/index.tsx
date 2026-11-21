import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import type { LibroRecord } from "../../src/db/database";
import {
  searchBooksLocal,
  type LibroCounters,
} from "../../src/repositories/bookRepository";
import {
  deshacerEliminacion,
  eliminarLibro,
  marcarLeido,
  obtenerContadores,
} from "../../src/services/bookService";
import { pickRandomPendingBook } from "../../src/sensors/shake";
import { useShake } from "../../src/sensors/useShake";

type EstadoFilter = "todos" | "pendiente" | "leyendo" | "leido";

type BookRowProps = {
  book: LibroRecord;
  selected: boolean;
  onOpen: (id: number) => void;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onMarkRead: (id: number) => void;
};

function BookRow({
  book,
  selected,
  onOpen,
  onSelect,
  onDelete,
  onMarkRead,
}: BookRowProps) {
  const pan = Gesture.Pan().onEnd((event) => {
    if (event.translationX < -80) {
      runOnJS(onDelete)(book.id);
    } else if (event.translationX > 80) {
      runOnJS(onMarkRead)(book.id);
    }
  });
  const longPress = Gesture.LongPress()
    .minDuration(500)
    .onStart(() => runOnJS(onSelect)(book.id));
  const gestures = Gesture.Race(pan, longPress);

  return (
    <GestureDetector gesture={gestures}>
      <View style={[styles.row, selected && styles.rowSelected]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Abrir ${book.titulo} de ${book.autor}`}
          onPress={() => onOpen(book.id)}
        >
          <Text>{book.titulo}</Text>
          <Text>{book.autor}</Text>
          <Text>{book.estado}</Text>
        </Pressable>
        <View style={styles.rowActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Seleccionar ${book.titulo} para préstamo múltiple`}
            onPress={() => onSelect(book.id)}
          >
            <Text>Seleccionar</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Marcar ${book.titulo} como leído`}
            onPress={() => onMarkRead(book.id)}
          >
            <Text>Leído</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Eliminar ${book.titulo}`}
            onPress={() => onDelete(book.id)}
          >
            <Text>Eliminar</Text>
          </Pressable>
        </View>
      </View>
    </GestureDetector>
  );
}

export default function BooksScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState<EstadoFilter>("todos");
  const [books, setBooks] = useState<LibroRecord[]>([]);
  const [counters, setCounters] = useState<LibroCounters>({
    total: 0,
    leidos: 0,
    prestados: 0,
  });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [undoId, setUndoId] = useState<number | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    searchBooksLocal(search, estado).then((result) => {
      if (active) {
        setBooks(result);
      }
    });
    obtenerContadores().then(setCounters);

    return () => {
      active = false;
    };
  }, [search, estado]);

  const filters: { label: string; value: EstadoFilter }[] = [
    { label: "Todos", value: "todos" },
    { label: "Pendiente", value: "pendiente" },
    { label: "Leyendo", value: "leyendo" },
    { label: "Leído", value: "leido" },
  ];

  function suggestBook() {
    const selected = pickRandomPendingBook(books);
    setSuggestion(
      selected
        ? `Te sugerimos «${selected.titulo}» de ${selected.autor}`
        : "No hay libros pendientes",
    );
  }

  useShake(suggestBook);

  async function refresh() {
    const [result, countResult] = await Promise.all([
      searchBooksLocal(search, estado),
      obtenerContadores(),
    ]);
    setBooks(result);
    setCounters(countResult);
  }

  async function deleteWithUndo(id: number) {
    await eliminarLibro(id);
    setUndoId(id);
    setTimeout(() => setUndoId((current) => (current === id ? null : current)), 5000);
    await refresh();
  }

  async function markRead(id: number) {
    await marcarLeido(id);
    await refresh();
  }

  async function undoDelete() {
    if (undoId === null) return;
    await deshacerEliminacion(undoId);
    setUndoId(null);
    await refresh();
  }

  return (
    <View style={styles.container}>
      <View style={styles.counters}>
        <Text>Total: {counters.total}</Text>
        <Text>Leídos: {counters.leidos}</Text>
        <Text>Prestados: {counters.prestados}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Sorpréndeme con un libro pendiente"
        onPress={suggestBook}
        style={styles.filter}
      >
        <Text>Sorpréndeme</Text>
      </Pressable>
      {suggestion ? (
        <Text accessibilityRole="alert">{suggestion}</Text>
      ) : null}
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar por título o autor"
        accessibilityLabel="Buscar libros por título o autor"
        style={styles.search}
      />

      <View style={styles.filters}>
        {filters.map((filter) => (
          <Pressable
            key={filter.value}
            accessibilityRole="button"
            accessibilityLabel={`Filtrar por ${filter.label}`}
            onPress={() => setEstado(filter.value)}
            style={[
              styles.filter,
              estado === filter.value && styles.filterSelected,
            ]}
          >
            <Text>{filter.label}</Text>
          </Pressable>
        ))}
      </View>

      {books.length === 0 ? (
        <View style={styles.empty}>
          <Text>No hay libros</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Agregar libro"
            onPress={() => router.push("/libro/nuevo")}
          >
            <Text>Agregar libro</Text>
          </Pressable>
        </View>
      ) : (
        books.map((book) => (
          <BookRow
            key={book.id}
            book={book}
            selected={selectedIds.includes(book.id)}
            onOpen={(id) => router.push(`/libro/${id}`)}
            onSelect={(id) =>
              setSelectedIds((current) =>
                current.includes(id)
                  ? current.filter((selectedId) => selectedId !== id)
                  : [...current, id],
              )
            }
            onDelete={deleteWithUndo}
            onMarkRead={markRead}
          />
        ))
      )}
      {selectedIds.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Prestar los libros seleccionados"
          onPress={() =>
            router.push({
              pathname: "/libro/prestar",
              params: { ids: selectedIds.join(",") },
            })
          }
          style={styles.filter}
        >
          <Text>Prestar seleccionados ({selectedIds.length})</Text>
        </Pressable>
      ) : null}
      {undoId !== null ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Deshacer eliminación"
          onPress={undoDelete}
          style={styles.filter}
        >
          <Text>Deshacer</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  counters: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  search: { borderWidth: 1, borderRadius: 8, padding: 12 },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filter: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
  filterSelected: { backgroundColor: "#dbeafe" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  row: { borderBottomWidth: 1, borderBottomColor: "#d1d5db", paddingVertical: 12 },
  rowSelected: { backgroundColor: "#fef3c7" },
  rowActions: { flexDirection: "row", gap: 12, marginTop: 8 },
});
