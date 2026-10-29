import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { useColorScheme } from 'react-native';

import { SplashOverlay } from '@/components/splash-overlay';
import { hasOnboarded, shouldRemember } from '@/lib/onboarding';

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <SplashOverlay />
        <RootStack />
      </ThemeProvider>
    </ClerkProvider>
  );
}

function RootStack() {
  const { isLoaded, isSignedIn, signOut } = useAuth();

  // Só na abertura do app: sem "Lembrar de mim", encerra a sessão salva.
  const checked = useRef(false);
  useEffect(() => {
    if (!isLoaded || checked.current) return;
    checked.current = true;
    if (isSignedIn && !shouldRemember()) signOut();
  }, [isLoaded, isSignedIn, signOut]);

  if (!isLoaded) return null;

  // Ao logar, o Router manda para a primeira tela liberada: onboarding (se nunca viu) ou Home.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* "/" sempre existe: se já logado, o próprio index redireciona (ver index.tsx). */}
      <Stack.Screen name="index" />
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="cadastro" />
        <Stack.Screen name="esqueci-senha" />
      </Stack.Protected>
      <Stack.Protected guard={!!isSignedIn && !hasOnboarded()}>
        <Stack.Screen name="localizacao" />
        <Stack.Screen name="notificacoes" />
        <Stack.Screen name="microfone" />
      </Stack.Protected>
      <Stack.Protected guard={!!isSignedIn}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
    </Stack>
  );
}
