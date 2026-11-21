import { useEffect, useRef } from "react";
import { Accelerometer } from "expo-sensors";

export function useShake(onShake: () => void): void {
  const callbackRef = useRef(onShake);
  callbackRef.current = onShake;

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    void Accelerometer.isAvailableAsync()
      .then((available) => {
        if (!available) return;
        Accelerometer.setUpdateInterval(100);
        subscription = Accelerometer.addListener((data) => {
          const magnitude = Math.sqrt(
            data.x * data.x + data.y * data.y + data.z * data.z,
          );
          if (magnitude > 1.8) {
            callbackRef.current();
          }
        });
      })
      .catch(() => {
        subscription = null;
      });

    return () => {
      subscription?.remove();
      subscription = null;
    };
  }, []);
}
