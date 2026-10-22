import { router } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Brand } from '@/constants/theme';

type Option = {
  key: 'vagas' | 'lembretes' | 'ofertas';
  title: string;
  description: string;
  icon: SymbolViewProps['name'];
  color: string;
  background: string;
};

const OPTIONS: Option[] = [
  {
    key: 'vagas',
    title: 'Vagas disponíveis',
    description: 'Avise quando surgir uma vaga nos locais salvos',
    icon: { ios: 'car', android: 'directions_car', web: 'directions_car' },
    color: Brand.success,
    background: Brand.successLight,
  },
  {
    key: 'lembretes',
    title: 'Lembretes de estacionamento',
    description: 'Receba alertas antes do tempo contratado acabar',
    icon: { ios: 'clock', android: 'schedule', web: 'schedule' },
    color: Brand.primary,
    background: Brand.primaryLight,
  },
  {
    key: 'ofertas',
    title: 'Ofertas e novidades',
    description: 'Promoções de estacionamentos perto de você',
    icon: { ios: 'bell', android: 'notifications', web: 'notifications' },
    color: Brand.warning,
    background: Brand.warningLight,
  },
];

export default function NotificationsPermissionScreen() {
  const [enabled, setEnabled] = useState({ vagas: true, lembretes: true, ofertas: false });

  // Somente frontend: a permissão real (expo-notifications) entra aqui depois
  const finish = () => router.replace('/home');

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.iconCard}>
            <View style={styles.iconSquare}>
              <SymbolView
                name={{ ios: 'bell', android: 'notifications', web: 'notifications' }}
                size={44}
                tintColor={Brand.white}
              />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.title}>Não perca nenhuma vaga</Text>
        <Text style={styles.subtitle}>
          Permita notificações para receber alertas úteis no momento certo. Você pode ajustar tudo
          depois.
        </Text>

        <View style={styles.card}>
          {OPTIONS.map((option, index) => (
            <View key={option.key} style={[styles.option, index > 0 && styles.optionBorder]}>
              <View style={[styles.optionIcon, { backgroundColor: option.background }]}>
                <SymbolView name={option.icon} size={22} tintColor={option.color} />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <Switch
                value={enabled[option.key]}
                onValueChange={(value) => setEnabled((prev) => ({ ...prev, [option.key]: value }))}
                trackColor={{ true: Brand.primary, false: Brand.border }}
                thumbColor={Brand.white}
                accessibilityLabel={option.title}
              />
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Button
            title="Permitir notificações"
            icon={{ ios: 'bell', android: 'notifications', web: 'notifications' }}
            onPress={finish}
          />
          <Button title="Agora não" variant="secondary" onPress={finish} />
          <Text style={styles.privacy}>O VagaCerta respeita sua privacidade e não envia spam.</Text>
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
  },
  hero: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 28,
  },
  iconCard: {
    width: 168,
    height: 168,
    borderRadius: 40,
    backgroundColor: Brand.white,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 12px 32px rgba(15, 23, 42, 0.08)',
  },
  iconSquare: {
    width: 104,
    height: 104,
    borderRadius: 28,
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 12px 24px rgba(47, 123, 246, 0.35)',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Brand.danger,
    borderWidth: 2,
    borderColor: Brand.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: Brand.white,
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
  },
  card: {
    marginTop: 28,
    backgroundColor: Brand.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 18,
  },
  optionBorder: {
    borderTopWidth: 1,
    borderTopColor: Brand.border,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Brand.text,
  },
  optionDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: Brand.textMuted,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    gap: 16,
    paddingTop: 32,
  },
  privacy: {
    fontSize: 12,
    color: Brand.textMuted,
    textAlign: 'center',
  },
});
