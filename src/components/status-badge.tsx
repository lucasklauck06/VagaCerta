import { StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/theme';
import type { ParkingStatus } from '@/lib/parking-status';

// Cores e textos de cada status (RF04). `pin` é a cor do marcador no mapa.
export const STATUS_STYLE = {
  disponivel: { label: 'Disponível', bg: Brand.successLight, fg: '#15803D', pin: '#16A34A' },
  poucas_vagas: { label: 'Poucas vagas', bg: Brand.warningLight, fg: '#B45309', pin: Brand.warning },
  lotado: { label: 'Lotado', bg: '#FDECEC', fg: '#B91C1C', pin: Brand.danger },
} as const;

type StatusBadgeProps = {
  status: ParkingStatus;
  /** sm = cards e listas, md = tela de detalhes */
  size?: 'sm' | 'md';
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const s = STATUS_STYLE[status];
  return (
    <View
      style={[styles.badge, size === 'sm' && styles.badgeSm, { backgroundColor: s.bg }]}
      accessibilityLabel={`Disponibilidade: ${s.label}`}>
      <View style={[styles.dot, { backgroundColor: s.fg }]} />
      <Text style={[styles.text, size === 'sm' && styles.textSm, { color: s.fg }]}>{s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeSm: { paddingHorizontal: 10, paddingVertical: 4 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  text: { fontSize: 13, fontWeight: '700' },
  textSm: { fontSize: 12 },
});
