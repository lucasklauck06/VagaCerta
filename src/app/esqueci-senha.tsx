import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brand } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const valid = /^\S+@\S+\.\S+$/.test(email);

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
              Digite o e-mail usado no cadastro e enviaremos um link para você criar uma nova senha.
            </Text>
          </View>

          <View style={styles.form}>
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
            {/* Somente frontend: o envio real do link entra aqui depois */}
            <Button
              title="Enviar link de recuperação"
              disabled={!valid}
              style={!valid && styles.disabled}
              onPress={() => router.back()}
            />
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
  disabled: {
    backgroundColor: '#C3CEDD',
    boxShadow: 'none',
  },
});
