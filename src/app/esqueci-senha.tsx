import { useSignIn } from '@clerk/expo';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brand } from '@/constants/theme';
import { errorMessage } from '@/lib/clerk-error';

const MIN_PASSWORD = 8;

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useSignIn();

  const valid = /^\S+@\S+\.\S+$/.test(email);
  const canReset = !!code && password.length >= MIN_PASSWORD && password === confirm && !loading;

  // Roda uma ação do Clerk com loading + mensagem de erro amigável.
  const run = async (action: () => Promise<void>) => {
    setError('');
    setLoading(true);
    try {
      await action();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  // Passo 1: pede o código. Avança mesmo se o e-mail não existir, para não revelar quem tem conta.
  const sendCode = () =>
    run(async () => {
      const created = await signIn.create({ identifier: email.trim() });
      if (created.error) {
        if (created.error.code !== 'form_identifier_not_found') throw created.error;
      } else {
        const sent = await signIn.resetPasswordEmailCode.sendCode();
        if (sent.error) throw sent.error;
      }
      setStep('reset');
    });

  // Passo 2: confere o código e grava a nova senha. Não chamamos finalize(): o usuário volta ao login.
  const resetPassword = () =>
    run(async () => {
      const verified = await signIn.resetPasswordEmailCode.verifyCode({ code: code.trim() });
      if (verified.error) throw verified.error;
      const done = await signIn.resetPasswordEmailCode.submitPassword({ password });
      if (done.error) throw done.error;
      router.replace({ pathname: '/', params: { reset: '1' } });
    });

  return (
    <View style={styles.screen}>
      <View style={styles.decoration} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets>
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

          <View style={styles.iconHalo}>
            <View style={styles.iconBox}>
              <SymbolView
                name={{ ios: 'lock', android: 'lock', web: 'lock' }}
                size={30}
                tintColor={Brand.white}
              />
            </View>
            <View style={styles.badge}>
              <SymbolView
                name={{ ios: 'envelope', android: 'mail', web: 'mail' }}
                size={12}
                tintColor={Brand.primary}
              />
            </View>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Esqueceu sua senha?</Text>
            <Text style={styles.subtitle}>
              {step === 'email'
                ? 'Digite o e-mail usado no cadastro e enviaremos um código para você criar uma nova senha.'
                : 'Se existir uma conta com esse e-mail, enviamos um código. Digite-o abaixo e escolha a nova senha.'}
            </Text>
          </View>

          <View style={styles.form}>
            {step === 'email' ? (
              <>
                <Input
                  label="E-mail cadastrado"
                  icon={{ ios: 'envelope', android: 'mail', web: 'mail' }}
                  placeholder="seu@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
                {!!error && <Text style={styles.error}>{error}</Text>}
                <Button
                  title={loading ? 'Enviando...' : 'Enviar código'}
                  disabled={!valid || loading}
                  style={(!valid || loading) && styles.disabled}
                  onPress={sendCode}
                />
              </>
            ) : (
              <>
                <Input
                  label="Código enviado ao seu e-mail"
                  icon={{ ios: 'number', android: 'pin', web: 'pin' }}
                  placeholder="000000"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  autoComplete="one-time-code"
                />
                <Input
                  label="Nova senha"
                  icon={{ ios: 'lock', android: 'lock', web: 'lock' }}
                  placeholder={`Mínimo de ${MIN_PASSWORD} caracteres`}
                  value={password}
                  onChangeText={setPassword}
                  autoComplete="new-password"
                  secure
                />
                <Input
                  label="Confirmar nova senha"
                  icon={{ ios: 'lock', android: 'lock', web: 'lock' }}
                  placeholder="Repita a nova senha"
                  value={confirm}
                  onChangeText={setConfirm}
                  autoComplete="new-password"
                  secure
                />
                {confirm.length > 0 && confirm !== password && (
                  <Text style={styles.error}>As senhas não coincidem</Text>
                )}
                {!!error && <Text style={styles.error}>{error}</Text>}
                <Button
                  title={loading ? 'Salvando...' : 'Redefinir senha'}
                  disabled={!canReset}
                  style={!canReset && styles.disabled}
                  onPress={resetPassword}
                />
              </>
            )}
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
    top: -120,
    left: -120,
    width: 300,
    height: 300,
    borderRadius: 150,
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
  back: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Brand.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconHalo: {
    width: 88,
    height: 88,
    borderRadius: 26,
    backgroundColor: Brand.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 20px rgba(47, 123, 246, 0.3)',
  },
  badge: {
    position: 'absolute',
    right: 0,
    bottom: 4,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Brand.white,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.15)',
  },
  header: {
    marginTop: 28,
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
  error: {
    fontSize: 14,
    fontWeight: '600',
    color: Brand.danger,
  },
  disabled: {
    backgroundColor: '#C3CEDD',
    boxShadow: 'none',
  },
});
