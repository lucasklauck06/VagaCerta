import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Brand } from '@/constants/theme';

type InputProps = TextInputProps & {
  /** Texto exibido acima do campo */
  label?: string;
  /** Ícone à esquerda */
  icon?: SymbolViewProps['name'];
  /** Campo de senha com botão de mostrar/ocultar */
  secure?: boolean;
};

export function Input({ label, icon, secure, style, ...rest }: InputProps) {
  const [hidden, setHidden] = useState(true);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.field}>
        {icon && <SymbolView name={icon} size={20} tintColor={Brand.textSecondary} />}

        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Brand.textMuted}
          secureTextEntry={secure && hidden}
          autoCapitalize={secure ? 'none' : rest.autoCapitalize}
          accessibilityLabel={label}
          {...rest}
        />

        {secure && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}>
            <SymbolView
              name={
                hidden
                  ? { ios: 'eye.slash', android: 'visibility_off', web: 'visibility_off' }
                  : { ios: 'eye', android: 'visibility', web: 'visibility' }
              }
              size={20}
              tintColor={Brand.textMuted}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Brand.text,
  },
  field: {
    height: 56,
    borderRadius: 16,
    backgroundColor: Brand.inputBackground,
    borderWidth: 1,
    borderColor: Brand.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: Brand.text,
  },
});
