import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

function read(key: string) {
  try {
    return Platform.OS === 'web' ? localStorage.getItem(key) : SecureStore.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    if (Platform.OS === 'web') localStorage.setItem(key, value);
    else SecureStore.setItem(key, value);
  } catch {}
}

// Flag local: já passou por Localização/Notificações/Microfone neste aparelho.
export const hasOnboarded = () => read('onboarding_done') === '1';
export const markOnboarded = () => write('onboarding_done', '1');

// "Lembrar de mim": se desmarcado, a sessão do Clerk é encerrada ao reabrir o app.
export const shouldRemember = () => read('remember_me') !== '0';
export const setRemember = (value: boolean) => write('remember_me', value ? '1' : '0');

// Preferências dos switches da tela de Notificações (o Perfil pode ler/alterar).
export type NotificationPrefs = { vagas: boolean; lembretes: boolean; ofertas: boolean };
const DEFAULT_PREFS: NotificationPrefs = { vagas: true, lembretes: true, ofertas: false };

export function getNotificationPrefs(): NotificationPrefs {
  try {
    return { ...DEFAULT_PREFS, ...JSON.parse(read('notification_prefs') ?? '{}') };
  } catch {
    return DEFAULT_PREFS;
  }
}
export const setNotificationPrefs = (prefs: NotificationPrefs) =>
  write('notification_prefs', JSON.stringify(prefs));
