import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

// Same values as the expo-splash-screen plugin in app.json, so the native splash hands off seamlessly.
const BACKGROUND = '#0B1B3A';
const LOGO_SIZE = 120;
// ponytail: fixed duration, wait on real app loading (fonts, session) once there is some
const DURATION = 1800;
const BAR_WIDTH = 64;

export function SplashOverlay() {
  const [visible, setVisible] = useState(true);
  const progress = useSharedValue(0);
  const barStyle = useAnimatedStyle(() => ({ width: progress.value * BAR_WIDTH }));

  useEffect(() => {
    progress.value = withTiming(1, { duration: DURATION });
    const timer = setTimeout(() => setVisible(false), DURATION);
    return () => clearTimeout(timer);
  }, [progress]);

  if (!visible) return null;

  return (
    <Animated.View
      exiting={FadeOut.duration(400)}
      onLayout={() => SplashScreen.hideAsync()}
      style={styles.overlay}>
      <StatusBar style="light" />
      <Image source={require('@/assets/images/logo-mark.png')} style={styles.logo} />

      <Animated.View entering={FadeIn.delay(150).duration(500)} style={styles.texts}>
        <Text style={styles.title}>VagaCerta</Text>
        <Text style={styles.tagline}>Encontre sua vaga. Sem perder tempo.</Text>
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFill, barStyle]} />
        </View>
        <Text style={styles.loading}>Carregando...</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE * 0.225,
    boxShadow: '0 0 60px rgba(56, 189, 248, 0.35)',
  },
  // Absolutely positioned so the logo stays exactly centered, like the native splash.
  texts: {
    position: 'absolute',
    top: '50%',
    marginTop: LOGO_SIZE / 2 + 28,
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  tagline: {
    color: '#94A3B8',
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 64,
    alignItems: 'center',
    gap: 12,
  },
  barTrack: {
    width: BAR_WIDTH,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  barFill: {
    height: 3,
    borderRadius: 2,
    backgroundColor: '#38BDF8',
  },
  loading: {
    color: '#64748B',
    fontSize: 12,
  },
});
