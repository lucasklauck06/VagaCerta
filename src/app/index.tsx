import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Brand } from '@/constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);

  return (
    <View style={styles.screen}>
      {/* Círculo decorativo no canto superior direito */}
      <View style={styles.decoration} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets>
          <View style={styles.brand}>
            <Image
              source={require('@/assets/images/logo-mark.png')}
              style={styles.logo}
              accessibilityLabel="Logo VagaCerta"
            />
            <View>
              <Text style={styles.brandName}>VagaCerta</Text>
              <Text style={styles.slogan}>SUA VAGA ESTÁ MAIS PERTO</Text>
            </View>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Bem-vindo de volta</Text>
            <Text style={styles.subtitle}>
              Entre para acessar seus favoritos e encontrar uma vaga sem perder tempo.
            </Text>
          </View>

          <View style={styles.form}>
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
            <Input
              label="Senha"
              icon={{ ios: 'lock', android: 'lock', web: 'lock' }}
              placeholder="Sua senha"
              value={password}
              onChangeText={setPassword}
              autoComplete="password"
              secure
            />

            <View style={styles.row}>
              <Checkbox label="Lembrar de mim" checked={remember} onChange={setRemember} />
              <Pressable hitSlop={8} onPress={() => router.push('/esqueci-senha')}>
                <Text style={styles.link}>Esqueci minha senha</Text>
              </Pressable>
            </View>

            <Button title="Entrar" onPress={() => router.replace('/localizacao')} />
          </View>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>ou continue com</Text>
            <View style={styles.line} />
          </View>

          <Pressable
            style={({ pressed }) => [styles.googleButton, pressed && { opacity: 0.85 }]}
            accessibilityRole="button">
            <Text style={styles.googleG}>G</Text>
            <Text style={styles.googleText}>Entrar com Google</Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Ainda não tem conta?{' '}
              <Text style={styles.link} onPress={() => router.push('/cadastro')}>
                Criar conta
              </Text>
            </Text>
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
    paddingTop: 32,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 12,
    boxShadow: '0 8px 16px rgba(37, 99, 235, 0.3)',
  },
  brandName: {
    fontSize: 22,
    fontWeight: '800',
    color: Brand.text,
  },
  slogan: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: Brand.primary,
    marginTop: 2,
  },
  header: {
    marginTop: 48,
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
    marginTop: 32,
    gap: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  link: {
    fontSize: 14,
    fontWeight: '700',
    color: Brand.primary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 28,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Brand.border,
  },
  dividerText: {
    fontSize: 13,
    color: Brand.textMuted,
  },
  googleButton: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  googleG: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4285F4',
  },
  googleText: {
    fontSize: 16,
    fontWeight: '700',
    color: Brand.text,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 32,
  },
  footerText: {
    fontSize: 14,
    color: Brand.textSecondary,
  },
});
