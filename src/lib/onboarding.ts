import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Flag local: já passou por Localização/Notificações/Microfone neste aparelho.
const KEY = 'onboarding_done';

export function hasOnboarded() {
  try {
    return (Platform.OS === 'web' ? localStorage.getItem(KEY) : SecureStore.getItem(KEY)) === '1';
  } catch {
    return false;
  }
}

export function markOnboarded() {
  try {
    if (Platform.OS === 'web') localStorage.setItem(KEY, '1');
    else SecureStore.setItem(KEY, '1');
  } catch {}
}
