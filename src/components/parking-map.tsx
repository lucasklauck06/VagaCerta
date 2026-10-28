import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { STATUS_STYLE } from '@/components/status-badge';
import { formatPrice } from '@/lib/format';
import type { LatLng, ParkingSummary } from '@/lib/parking-api';

export type ParkingMapProps = {
  parkings: ParkingSummary[];
  center: LatLng;
  showsUserLocation: boolean;
  onPressParking: (id: string) => void;
};

const DELTA = 0.03; // ~3 km de altura visível

const toRegion = (c: LatLng) => ({ latitude: c.lat, longitude: c.lng, latitudeDelta: DELTA, longitudeDelta: DELTA });

export function ParkingMap({ parkings, center, showsUserLocation, onPressParking }: ParkingMapProps) {
  const mapRef = useRef<MapView>(null);

  // Recentra quando o ponto de busca muda (ex.: localização chegou ou busca por endereço).
  useEffect(() => {
    mapRef.current?.animateToRegion(toRegion(center), 400);
  }, [center]);

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      initialRegion={toRegion(center)}
      showsUserLocation={showsUserLocation}
      showsMyLocationButton={showsUserLocation}
      toolbarEnabled={false}>
      {parkings.map((p) => (
        <Marker
          // status na key: remonta o marcador para a cor mudar quando o Realtime altera as vagas
          key={`${p.id}:${p.status}`}
          identifier={p.id}
          coordinate={{ latitude: p.lat, longitude: p.lng }}
          pinColor={STATUS_STYLE[p.status].pin}
          accessibilityLabel={`${p.name}, ${STATUS_STYLE[p.status].label}, ${formatPrice(p.pricePerHour)}`}
          onPress={() => onPressParking(p.id)}
        />
      ))}
    </MapView>
  );
}
