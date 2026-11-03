import { StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/theme';
import type { ParkingMapProps } from '@/components/parking-map';

// react-native-maps não roda na web; lá a Home usa a lista.
export function ParkingMap(_props: ParkingMapProps) {
  return (
    <View style={styles.box}>
      <Text style={styles.text}>O mapa está disponível no app Android e iOS. Use a lista.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', padding: 24 },
  text: { color: Brand.textSecondary, textAlign: 'center' },
});
