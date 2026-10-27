import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brand } from '@/constants/theme';

const STRENGTH = [
  { label: 'Senha fraca', color: Brand.danger },
  { label: 'Senha fraca', color: Brand.danger },
  { label: 'Senha média', color: Brand.warning },
  { label: 'Senha forte', color: Brand.success },
  { label: 'Senha muito forte', color: Brand.success },
];

// 0–4: um ponto por critério atendido
function passwordScore(password: string) {
  if (!password) return 0;
  return [
    password.length >= 8,
    /[A-Z]/.test(password) && /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
}

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [accepted, setAccepted] = useState(true);

  const score = passwordScore(password);
  const strength = STRENGTH[score];
  const mismatch = confirm.length > 0 && confirm !== password;
  const canSubmit = accepted && !!password && confirm === password;

  return (
    <View style={styles.screen}>
      <View style={styles.decoration} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets>
          <View style={styles.topBar}>
            <Pressable
              style={styles.back}
              onPress={() => router.back()}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Voltar">
              <SymbolView
                name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
                size={20}
                weight="semibold"
                tintColor={Brand.text}
              />
            </Pressable>
            <Text style={styles.topText}>
              Já tem conta?{' '}
              <Text style={styles.link} onPress={() => router.back()}>
                Entrar
              </Text>
            </Text>
          </View>

          <Image
            source={require('@/assets/images/logo-mark.png')}
            style={styles.logo}
            accessibilityLabel="Logo VagaCerta"
          />

          <View style={styles.header}>
            <Text style={styles.title}>Crie sua conta</Text>
            <Text style={styles.subtitle}>
              Salve seus estacionamentos favoritos e encontre vagas ainda mais rápido.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Nome completo"
              icon={{ ios: 'person', android: 'person', web: 'person' }}
              placeholder="Como você quer ser chamado?"
              value={name}
              onChangeText={setName}
              autoComplete="name"
            />
            <Input
              label="E-mail"
              icon={{ ios: 'envelope', android: 'mail', web: 'mail' }}
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <View style={styles.passwordGroup}>
              <Input
                label="Senha"
                icon={{ ios: 'lock', android: 'lock', web: 'lock' }}
                placeholder="Mínimo de 8 caracteres"
                value={password}
                onChangeText={setPassword}
                autoComplete="new-password"
                secure
              />
              {password.length > 0 && (
                <>
                  <View style={styles.bars}>
                    {[1, 2, 3, 4].map((i) => (
                      <View
                        key={i}
                        style={[styles.bar, i <= score && { backgroundColor: strength.color }]}
                      />
                    ))}
                  </View>
                  <Text style={[styles.strength, { color: strength.color }]}>{strength.label}</Text>
                </>
              )}
            </View>

            <View style={styles.passwordGroup}>
              <Input
                label="Confirmar senha"
                icon={{ ios: 'lock', android: 'lock', web: 'lock' }}
                placeholder="Repita sua senha"
                value={confirm}
                onChangeText={setConfirm}
                autoComplete="new-password"
                secure
              />
              {mismatch && (
                <Text style={[styles.strength, { color: Brand.danger }]}>As senhas não coincidem</Text>
              )}
            </View>

            <Pressable
              style={styles.terms}
              onPress={() => setAccepted((a) => !a)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: accepted }}>
              <View style={[styles.box, accepted && styles.boxChecked]}>
                {accepted && (
                  <SymbolView
                    name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                    size={14}
                    weight="bold"
                    tintColor={Brand.white}
                  />
                )}
              </View>
              <Text style={styles.termsText}>
                Concordo com os <Text style={styles.link}>Termos de Uso</Text> e a{' '}
                <Text style={styles.link}>Política de Privacidade</Text>.
              </Text>
            </Pressable>

            <Button
              title="Criar minha conta"
              disabled={!canSubmit}
              style={!canSubmit && styles.disabled}
              onPress={() => router.replace('/localizacao')}
            />
          </View>

          <View style={styles.footer}>
            <SymbolView
              name={{ ios: 'lock', android: 'lock', web: 'lock' }}
              size={12}
              tintColor={Brand.textMuted}
            />
            <Text style={styles.footerText}>Seus dados estão protegidos</Text>
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
  decoration: {
    position: 'absolute',
    top: -140,
    right: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: Brand.primaryLight,
    opacity: 0.6,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Brand.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topText: {
    fontSize: 14,
    color: Brand.textSecondary,
  },
  link: {
    fontSize: 14,
    fontWeight: '700',
    color: Brand.primary,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 14,
    marginTop: 28,
    boxShadow: '0 8px 16px rgba(37, 99, 235, 0.3)',
  },
  header: {
    marginTop: 24,
    gap: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: Brand.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: Brand.textSecondary,
  },
  form: {
    marginTop: 28,
    gap: 20,
  },
  passwordGroup: {
    gap: 10,
  },
  bars: {
    flexDirection: 'row',
    gap: 6,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Brand.border,
  },
  strength: {
    fontSize: 12,
    fontWeight: '700',
  },
  terms: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Brand.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    backgroundColor: Brand.primary,
    borderColor: Brand.primary,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: Brand.textSecondary,
  },
  disabled: {
    opacity: 0.5,
  },
  footer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 6,
    paddingTop: 32,
  },
  footerText: {
    fontSize: 12,
    color: Brand.textMuted,
  },
});
