import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

import type { LatLng } from '@/lib/parking-api';

export type LocationStatus = 'loading' | 'granted' | 'denied' | 'undetermined';

// Hook compartilhado de localização (Home do Artur + tela de permissão do Lucas).
// - status: 'loading' enquanto consulta a permissão/posição; depois o estado da permissão.
// - coords: posição atual, ou null se negada/indisponível (a Home usa o centro do seed).
// - request(): pede a permissão (usado na tela de Localização) e, se concedida, busca a posição.
// A posição fica só em memória (RNF06/LGPD): nada é salvo no aparelho nem enviado além da busca.
export function useUserLocation() {
  const [status, setStatus] = useState<LocationStatus>('loading');
  const [coords, setCoords] = useState<LatLng | null>(null);

  const resolve = useCallback(async (permission: Location.LocationPermissionResponse) => {
    if (permission.status !== Location.PermissionStatus.GRANTED) {
      setStatus(permission.status === Location.PermissionStatus.DENIED ? 'denied' : 'undetermined');
      return;
    }
    try {
      // Última posição conhecida é instantânea; só pede um fix novo se não houver uma recente.
      const pos =
        (await Location.getLastKnownPositionAsync({ maxAge: 5 * 60 * 1000, requiredAccuracy: 500 })) ??
        (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    } catch {
      setCoords(null); // GPS desligado ou sem sinal: segue sem posição
    }
    setStatus('granted');
  }, []);

  useEffect(() => {
    Location.getForegroundPermissionsAsync()
      .then(resolve)
      .catch(() => setStatus('undetermined'));
  }, [resolve]);

  const request = useCallback(async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    await resolve(permission);
    return permission.status;
  }, [resolve]);

  return { status, coords, request };
}
