import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { FavoriteButton } from '@/components/favorite-button';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Brand } from '@/constants/theme';
import { formatDistance, formatFreeSpots, formatPrice } from '@/lib/format';
import { getParking, type ParkingDetail } from '@/lib/parking-api';

async function open(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Não foi possível abrir', 'Nenhum aplicativo de mapas conseguiu abrir o destino.');
  }
}

export default function ParkingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const [parking, setParking] = useState<ParkingDetail | null>(null);
  const [state, setState] = useState<'loading' | 'ok' | 'error' | 'notfound'>('loading');
  const [attempt, setAttempt] = useState(0);

  // Busca ao abrir e a cada "Tentar de novo"; `active` descarta resposta de um id anterior.
  useEffect(() => {
    let active = true;
    getParking(id).then(
      (p) => {
        if (!active) return;
        setParking(p);
        setState(p ? 'ok' : 'notfound');
      },
      () => active && setState('error'),
    );
    return () => {
      active = false;
    };
  }, [id, attempt]);

  const header = (
    <Stack.Screen
      options={{
        headerShown: true,
        title: 'Detalhes',
        headerBackTitle: 'Voltar',
        headerRight: () => <FavoriteButton parkingId={id} />,
      }}
    />
  );

  if (state === 'loading') {
    return (
      <View style={styles.center}>
        {header}
        <ActivityIndicator size="large" color={Brand.primary} accessibilityLabel="Carregando" />
      </View>
    );
  }

  if (state !== 'ok' || !parking) {
    return (
      <View style={styles.center}>
        {header}
        <Text style={styles.title}>
          {state === 'notfound' ? 'Estacionamento não encontrado' : 'Não foi possível carregar'}
        </Text>
        {state === 'error' && (
          <Button
            title="Tentar de novo"
            onPress={() => {
              setState('loading');
              setAttempt((n) => n + 1);
            }}
            style={{ marginTop: 16, alignSelf: 'stretch' }} />
        )}
      </View>
    );
  }

  const { lat, lng } = parking;
  const todayIndex = new Date().getDay();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {header}
      {parking.images.length > 0 ? (
        <FlatList
          data={parking.images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(uri) => uri}
          renderItem={({ item }) => (
            <Image
              source={item}
              style={{ width, height: 220 }}
              contentFit="cover"
              accessibilityLabel={`Foto de ${parking.name}`}
            />
          )}
        />
      ) : (
        <View style={styles.placeholder} accessibilityLabel="Sem fotos disponíveis">
          <Text style={styles.placeholderText}>Sem fotos</Text>
        </View>
      )}

      <View style={styles.body}>
        <Text style={styles.name}>{parking.name}</Text>
        <Text style={styles.muted}>{parking.address}</Text>
        {parking.distanceM !== null && <Text style={styles.muted}>A {formatDistance(parking.distanceM)} de você</Text>}

        <View style={styles.row}>
          <Text style={styles.price}>{formatPrice(parking.pricePerHour)}</Text>
          <StatusBadge status={parking.status} />
        </View>
        {parking.freeSpots > 0 && (
          <Text style={styles.text}>{formatFreeSpots(parking.freeSpots)}</Text>
        )}

        <Text style={styles.section}>Horário de funcionamento</Text>
        {parking.hours.length === 0 ? (
          <Text style={styles.muted}>Horário não informado</Text>
        ) : (
          <>
            <Text style={[styles.open, { color: parking.openNow ? '#15803D' : '#B91C1C' }]}>
              {parking.openNow ? 'Aberto agora' : 'Fechado agora'}
            </Text>
            {parking.hours.map((h) => (
              <View key={h.weekday} style={styles.hourRow}>
                <Text style={[styles.text, h.weekday === todayIndex && styles.bold]}>{h.day}</Text>
                <Text style={[styles.text, h.weekday === todayIndex && styles.bold]}>
                  {h.closed ? 'Fechado' : `${h.opensAt} – ${h.closesAt}`}
                </Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.section}>Como chegar</Text>
        <Button
          title="Google Maps"
          icon="map"
          accessibilityLabel={`Abrir rota até ${parking.name} no Google Maps`}
          onPress={() => open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`)}
        />
        <Button
          title="Waze"
          variant="secondary"
          icon="location"
          accessibilityLabel={`Abrir rota até ${parking.name} no Waze`}
          onPress={() => open(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`)}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.background },
  content: { paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: Brand.background },
  placeholder: { height: 220, backgroundColor: Brand.primaryLight, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: Brand.textSecondary, fontWeight: '600' },
  body: { padding: 20, gap: 8 },
  title: { fontSize: 18, fontWeight: '700', color: Brand.text, textAlign: 'center' },
  name: { fontSize: 24, fontWeight: '800', color: Brand.text },
  muted: { fontSize: 15, color: Brand.textSecondary },
  text: { fontSize: 15, color: Brand.text },
  bold: { fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  price: { fontSize: 22, fontWeight: '800', color: Brand.primary },
  section: { fontSize: 17, fontWeight: '800', color: Brand.text, marginTop: 20 },
  open: { fontSize: 16, fontWeight: '800' },
  hourRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
});
