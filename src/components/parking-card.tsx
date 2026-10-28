import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FavoriteButton } from '@/components/favorite-button';
import { StatusBadge } from '@/components/status-badge';
import { Brand } from '@/constants/theme';
import { formatDistance, formatFreeSpots, formatPrice } from '@/lib/format';
import type { ParkingSummary } from '@/lib/parking-api';

type ParkingCardProps = {
  parking: ParkingSummary;
  onPress?: () => void;
};

// Card reutilizável (Home, resultados da busca do Vinicius e favoritos do Erico).
export function ParkingCard({ parking, onPress }: ParkingCardProps) {
  const { name, address, distanceM, pricePerHour, freeSpots, status } = parking;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${name}, a ${formatDistance(distanceM)}, ${formatPrice(pricePerHour)}`}
      accessibilityHint="Abre os detalhes do estacionamento"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.header}>
        <View style={styles.titleBox}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.address} numberOfLines={1}>
            {address}
          </Text>
        </View>
        <FavoriteButton parkingId={parking.id} />
      </View>

      <View style={styles.meta}>
        <Text style={styles.price}>{formatPrice(pricePerHour)}</Text>
        <Text style={styles.distance}>{formatDistance(distanceM)}</Text>
      </View>

      <View style={styles.footer}>
        <StatusBadge status={status} size="sm" />
        {freeSpots > 0 && <Text style={styles.spots}>{formatFreeSpots(freeSpots)}</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Brand.white,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    boxShadow: '0 4px 16px rgba(15, 23, 42, 0.06)',
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  titleBox: { flex: 1, gap: 2 },
  name: { fontSize: 16, fontWeight: '800', color: Brand.text },
  address: { fontSize: 13, color: Brand.textSecondary },
  meta: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  price: { fontSize: 17, fontWeight: '800', color: Brand.primary },
  distance: { fontSize: 14, fontWeight: '600', color: Brand.textSecondary },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  spots: { fontSize: 13, fontWeight: '600', color: Brand.text },
});
