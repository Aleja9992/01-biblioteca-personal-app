import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Libros" }} />
      <Tabs.Screen name="prestamos" options={{ title: "Préstamos" }} />
    </Tabs>
  );
}
