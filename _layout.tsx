import { Tabs } from "expo-router";

export default function TabsLayout() {
  // expo-router 58 solo pinta las pantallas declaradas aquí.
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Libros" }} />
      <Tabs.Screen name="prestamos" options={{ title: "Préstamos" }} />
    </Tabs>
  );
}
