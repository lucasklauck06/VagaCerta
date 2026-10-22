import { router } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Brand } from '@/constants/theme';

const FEATURES: { label: string; icon: SymbolViewProps['name']; color: string; active: boolean }[] = [
  {
    label: 'Localização em tempo real',
    icon: { ios: 'location.circle', android: 'my_location', web: 'my_location' },
    color: Brand.success,
    active: true,
  },
  {
    label: 'Mapa de estacionamentos',
    icon: { ios: 'map', android: 'map', web: 'map' },
    color: Brand.primary,
    active: true,
  },
  {
    label: 'Notificações de vagas',
    icon: { ios: 'bell', android: 'notifications', web: 'notifications' },
    color: Brand.textSecondary,
    active: false,
  },
];

export default function LocationPermissionScreen() {
  // Somente frontend: a permissão real (expo-location) entra aqui depois
  const next = () => router.push('/notificacoes');

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.ringOuter}>
            <View style={styles.ringInner}>
              <View style={styles.circle}>
                <SymbolView
                  name={{ ios: 'scope', android: 'my_location', web: 'my_location' }}
                  size={44}
                  tintColor={Brand.white}
                />
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.title}>Ativar Localização</Text>
        <Text style={styles.subtitle}>
          Para encontrar estacionamentos próximos a você, o VagaCerta precisa acessar sua
          localização em tempo real.
        </Text>

        <View style={styles.card}>
          {FEATURES.map((item, index) => (
            <View key={item.label} style={[styles.feature, index > 0 && styles.featureBorder]}>
              <SymbolView name={item.icon} size={22} tintColor={item.color} />
              <Text style={styles.featureLabel}>{item.label}</Text>
              <SymbolView
                name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                size={18}
                weight="bold"
                tintColor={item.active ? Brand.success : Brand.border}
              />
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <Button title="Permitir acesso à localização" onPress={next} />
          <Button title="Agora não" variant="secondary" onPress={next} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Brand.background,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ringOuter: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: '#DCE7FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    width: 196,
    height: 196,
    borderRadius: 98,
    borderWidth: 1.5,
    borderColor: '#CFDDF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 16px 32px rgba(47, 123, 246, 0.35)',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Brand.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 26,
    color: Brand.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 8,
  },
  card: {
    marginTop: 28,
    backgroundColor: Brand.white,
    borderRadius: 20,
    paddingHorizontal: 20,
    boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 18,
  },
  featureBorder: {
    borderTopWidth: 1,
    borderTopColor: Brand.border,
  },
  featureLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Brand.text,
  },
  actions: {
    marginTop: 32,
    gap: 12,
  },
});
