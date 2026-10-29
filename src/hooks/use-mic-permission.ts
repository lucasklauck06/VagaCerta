import { AudioModule } from 'expo-audio';
import { useCallback, useEffect, useState } from 'react';

export type MicStatus = 'undetermined' | 'granted' | 'denied';

type Perm = { granted: boolean; canAskAgain: boolean };

/**
 * Permissão do microfone.
 * `canAskAgain === false` com status 'denied' = negada de forma permanente
 * (só reabilitando nas configurações do sistema).
 * Uso: const { status, canAskAgain, request } = useMicPermission();
 */
export function useMicPermission() {
  const [perm, setPerm] = useState<Perm | null>(null);

  useEffect(() => {
    AudioModule.getRecordingPermissionsAsync().then(setPerm, () => {});
  }, []);

  const request = useCallback(async () => {
    const result = await AudioModule.requestRecordingPermissionsAsync();
    setPerm(result);
    return result.granted;
  }, []);

  const status: MicStatus = perm?.granted ? 'granted' : perm && !perm.canAskAgain ? 'denied' : 'undetermined';
  return { status, canAskAgain: perm?.canAskAgain ?? true, request };
}
