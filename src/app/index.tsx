import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Brand } from '@/constants/theme';
import { errorMessage } from '@/lib/clerk-error';
import { setRemember as saveRemember } from '@/lib/onboarding';
import { useSignIn, useSSO } from '@clerk/expo';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [code, setCode] = useState('');
  const [needsCode, setNeedsCode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useSignIn();
  const { startSSOFlow } = useSSO();
  const { reset } = useLocalSearchParams<{ reset?: string }>();

  // Roda uma ação do Clerk com loading + mensagem de erro amigável.
  const run = async (action: () => Promise<void>) => {
    setError('');
    setLoading(true);
    saveRemember(remember);
    try {
      await action();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  // Após o login, o _layout troca de tela sozinho (Stack.Protected).
  const finish = async () => {
    if (signIn.status !== 'complete') throw new Error(`Login incompleto (${signIn.status}).`);
    const { error } = await signIn.finalize();
    if (error) throw error;
  };

  const signInWithPassword = () =>
    run(async () => {
      if (!email || !password) throw new Error('Preencha e-mail e senha.');
      const { error } = await signIn.password({ identifier: email.trim(), password });
      if (error) throw error;
      // Aparelho novo (device trust) ou 2FA: Clerk pede código enviado ao e-mail.
      if (signIn.status === 'needs_client_trust' || signIn.status === 'needs_second_factor') {
        const { error } = await signIn.mfa.sendEmailCode();
        if (error) throw error;
        setNeedsCode(true);
        return;
      }
      await finish();
    });

  const verifyCode = () =>
    run(async () => {
      const { error } = await signIn.mfa.verifyEmailCode({ code: code.trim() });
      if (error) throw error;
      await finish();
    });

  const signInWithProvider = (strategy: 'oauth_google' | 'oauth_apple') =>
    run(async () => {
      const { createdSessionId, setActive } = await startSSOFlow({ strategy });
      if (createdSessionId) await setActive?.({ session: createdSessionId });
    });

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
            {needsCode && (
              <Input
                label="Código enviado ao seu e-mail"
                icon={{ ios: 'number', android: 'pin', web: 'pin' }}
                placeholder="000000"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                autoComplete="one-time-code"
              />
            )}

            <View style={styles.row}>
              <Checkbox label="Lembrar de mim" checked={remember} onChange={setRemember} />
              <Pressable hitSlop={8} onPress={() => router.push('/esqueci-senha')}>
                <Text style={styles.link}>Esqueci minha senha</Text>
              </Pressable>
            </View>

            {reset === '1' && !error && (
              <Text style={styles.success}>Senha redefinida! Entre com a nova senha.</Text>
            )}
            {!!error && <Text style={styles.error}>{error}</Text>}

            <Button
              title={loading ? 'Entrando...' : needsCode ? 'Confirmar código' : 'Entrar'}
              disabled={loading}
              style={loading && { opacity: 0.6 }}
              onPress={needsCode ? verifyCode : signInWithPassword}
            />
          </View>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>ou continue com</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.social}>
            <Pressable
              style={({ pressed }) => [styles.googleButton, pressed && { opacity: 0.85 }]}
              disabled={loading}
              onPress={() => signInWithProvider('oauth_google')}
              accessibilityRole="button">
              <Image source={require('@/assets/images/google.svg')} style={styles.socialIcon} />
              <Text style={styles.googleText}>Entrar com Google</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.googleButton, pressed && { opacity: 0.85 }]}
              disabled={loading}
              onPress={() => signInWithProvider('oauth_apple')}
              accessibilityRole="button">
              <Image source={require('@/assets/images/apple.svg')} style={styles.socialIcon} />
              <Text style={styles.googleText}>Entrar com Apple</Text>
            </Pressable>
          </View>

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
  error: {
    fontSize: 14,
    fontWeight: '600',
    color: Brand.danger,
  },
  success: {
    fontSize: 14,
    fontWeight: '600',
    color: Brand.success,
  },
  social: {
    gap: 12,
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
  socialIcon: {
    width: 20,
    height: 20,
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
