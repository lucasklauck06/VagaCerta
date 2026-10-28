import { StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/theme';
import type { ParkingStatus } from '@/lib/parking-api';

// ponytail: versão mínima; o Artur é o dono deste componente (substituir pela dele no merge).
const MAP = {
  disponivel: { label: 'Disponível', bg: Brand.successLight, fg: '#15803D' },
  poucas_vagas: { label: 'Poucas vagas', bg: Brand.warningLight, fg: '#B45309' },
  lotado: { label: 'Lotado', bg: '#FDECEC', fg: '#B91C1C' },
} as const;

export function StatusBadge({ status }: { status: ParkingStatus }) {
  const s = MAP[status];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]} accessibilityLabel={`Disponibilidade: ${s.label}`}>
      <Text style={[styles.text, { color: s.fg }]}>{s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  text: { fontSize: 13, fontWeight: '700' },
});
