import { router } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Brand } from '@/constants/theme';

const FEATURES: { label: string; icon: SymbolViewProps['name']; color: string; bg: string }[] = [
  {
    label: 'Busque dizendo um endereço ou ponto de referência',
    icon: { ios: 'magnifyingglass', android: 'search', web: 'search' },
    color: Brand.primary,
    bg: Brand.primaryLight,
  },
  {
    label: 'Use comandos como “vagas perto de mim”',
    icon: { ios: 'scope', android: 'my_location', web: 'my_location' },
    color: Brand.success,
    bg: Brand.successLight,
  },
  {
    label: 'O áudio só é usado enquanto você pesquisa',
    icon: { ios: 'lock', android: 'lock', web: 'lock' },
    color: Brand.textSecondary,
    bg: Brand.white,
  },
];

export default function MicPermissionScreen() {
  // Somente frontend: a permissão real do microfone entra aqui depois
  const close = () => router.replace('/home');

  return (
    <View style={styles.screen}>
      <View style={styles.decorationTop} />
      <View style={styles.decorationBottom} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable style={styles.skip} onPress={close} hitSlop={8} accessibilityRole="button">
            <Text style={styles.skipText}>Agora não</Text>
          </Pressable>

          <View style={styles.hero}>
            <View style={styles.ringOuter}>
              <View style={styles.ringInner}>
                <View style={styles.micBox}>
                  <SymbolView
                    name={{ ios: 'mic', android: 'mic', web: 'mic' }}
                    size={40}
                    tintColor={Brand.white}
                  />
                </View>
                <View style={styles.waveBadge}>
                  <SymbolView
                    name={{ ios: 'waveform', android: 'graphic_eq', web: 'graphic_eq' }}
                    size={20}
                    tintColor={Brand.success}
                  />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.pill}>
            <SymbolView
              name={{ ios: 'mic', android: 'mic', web: 'mic' }}
              size={12}
              tintColor={Brand.primary}
            />
            <Text style={styles.pillText}>PESQUISA POR VOZ</Text>
          </View>

          <Text style={styles.title}>Encontre vagas falando</Text>
          <Text style={styles.subtitle}>
            Permita o uso do microfone para auxiliar na pesquisa de estacionamentos de forma rápida e
            prática.
          </Text>

          <View style={styles.card}>
            {FEATURES.map((item) => (
              <View key={item.label} style={styles.feature}>
                <View style={[styles.featureIcon, { backgroundColor: item.bg }]}>
                  <SymbolView name={item.icon} size={16} tintColor={item.color} />
                </View>
                <Text style={styles.featureLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actions}>
            <Button
              title="Permitir acesso ao microfone"
              icon={{ ios: 'mic', android: 'mic', web: 'mic' }}
              onPress={close}
            />
            <Text style={styles.note}>Você pode alterar essa permissão nas configurações.</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Brand.white,
    overflow: 'hidden',
  },
  decorationTop: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: Brand.primaryLight,
    opacity: 0.6,
  },
  decorationBottom: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: Brand.successLight,
    opacity: 0.6,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 8,
  },
  skip: {
    alignSelf: 'flex-end',
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Brand.textSecondary,
  },
  hero: {
    alignItems: 'center',
    marginTop: 8,
  },
  ringOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#E3ECFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#F2F6FE',
    borderWidth: 1,
    borderColor: '#DCE7FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBox: {
    width: 96,
    height: 96,
    borderRadius: 26,
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 14px 28px rgba(47, 123, 246, 0.35)',
  },
  waveBadge: {
    position: 'absolute',
    right: 10,
    bottom: 18,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Brand.white,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)',
  },
  pill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Brand.primaryLight,
    marginTop: 12,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: Brand.primary,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Brand.text,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 24,
    color: Brand.textMuted,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 8,
  },
  card: {
    marginTop: 24,
    backgroundColor: Brand.background,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 20,
    padding: 16,
    gap: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    color: Brand.text,
  },
  actions: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingTop: 32,
    gap: 12,
  },
  note: {
    fontSize: 12,
    color: Brand.textMuted,
    textAlign: 'center',
  },
});
