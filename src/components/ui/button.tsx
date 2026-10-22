import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { Brand } from '@/constants/theme';

type ButtonProps = Omit<PressableProps, 'children'> & {
  title: string;
  /** primary = azul, secondary = cinza */
  variant?: 'primary' | 'secondary';
  icon?: SymbolViewProps['name'];
};

export function Button({ title, variant = 'primary', icon, style, ...rest }: ButtonProps) {
  const textColor = variant === 'primary' ? Brand.white : Brand.textMuted;

  return (
    <Pressable
      accessibilityRole="button"
      style={(state) => [
        styles.base,
        styles[variant],
        state.pressed && styles.pressed,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}>
      {icon && <SymbolView name={icon} size={20} tintColor={textColor} />}
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
  },
  primary: {
    backgroundColor: Brand.primary,
    boxShadow: '0 10px 20px rgba(47, 123, 246, 0.3)',
  },
  secondary: {
    backgroundColor: Brand.inputBackground,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
});
