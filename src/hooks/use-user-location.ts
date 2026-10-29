import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

type Coords = { latitude: number; longitude: number };

/**
 * Permissão de localização (primeiro plano) + posição atual.
 * `coords` fica só em memória (RNF06) e é null enquanto não há permissão.
 * Uso: const { status, coords, request } = useUserLocation();
 */
export function useUserLocation() {
  const [permission, requestPermission] = Location.useForegroundPermissions();
  const [coords, setCoords] = useState<Coords | null>(null);
  const granted = permission?.granted ?? false;

  useEffect(() => {
    if (!granted) return;
    let cancelled = false;
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      .then(({ coords }) => !cancelled && setCoords(coords))
      .catch(() => {}); // GPS desligado etc.: a Home segue sem a posição
    return () => {
      cancelled = true;
    };
  }, [granted]);

  return {
    status: permission?.status ?? Location.PermissionStatus.UNDETERMINED,
    coords,
    request: requestPermission,
  };
}
