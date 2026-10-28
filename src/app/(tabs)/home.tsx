import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ParkingCard } from '@/components/parking-card';
import { ParkingMap } from '@/components/parking-map';
import { Button } from '@/components/ui/button';
import { BottomTabInset, Brand } from '@/constants/theme';
import { useUserLocation } from '@/hooks/use-user-location';
import { getNearbyParkings, SEED_CENTER, type ParkingSummary } from '@/lib/parking-api';
import { parkingStatus } from '@/lib/parking-status';
import { supabase } from '@/lib/supabase';

type SpotsRow = { id: string; free_spots: number; total_spots: number };
type Mode = 'map' | 'list';

// Aplica as vagas vindas do Supabase sem refazer a busca (distância e ordem continuam as mesmas).
function withSpots(list: ParkingSummary[], rows: SpotsRow[]) {
  const byId = new Map(rows.map((r) => [r.id, r]));
  return list.map((p) => {
    const r = byId.get(p.id);
    if (!r || (r.free_spots === p.freeSpots && r.total_spots === p.totalSpots)) return p;
    return { ...p, freeSpots: r.free_spots, totalSpots: r.total_spots, status: parkingStatus(r.free_spots, r.total_spots) };
  });
}

const openParking = (id: string) => router.push({ pathname: '/parking/[id]', params: { id } });

export default function HomeScreen() {
  const location = useUserLocation();
  // Sem permissão (ou sem GPS) a busca é feita no centro do seed.
  const center = useMemo(() => location.coords ?? SEED_CENTER, [location.coords]);
  const usingUserLocation = location.coords !== null;

  const [mode, setMode] = useState<Mode>('map');
  const [parkings, setParkings] = useState<ParkingSummary[]>([]);
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // Busca quando a localização se resolve (concedida ou não) e a cada "Tentar de novo".
  // Trocar mapa/lista não busca de novo. `active` descarta resposta de uma busca antiga.
  useEffect(() => {
    if (location.status === 'loading') return;
    let active = true;
    getNearbyParkings(center).then(
      (list) => {
        if (!active) return;
        setParkings(list);
        setState('ok');
      },
      () => active && setState('error'),
    );
    return () => {
      active = false;
    };
  }, [location.status, center, attempt]);

  const retry = () => {
    setState('loading');
    setAttempt((n) => n + 1);
  };

  // Pull-to-refresh na lista: mantém os dados atuais na tela se falhar.
  const refresh = async () => {
    setRefreshing(true);
    try {
      setParkings(await getNearbyParkings(center));
    } catch {
      // segue com a lista anterior
    } finally {
      setRefreshing(false);
    }
  };

  // Ids carregados, para a ressincronização do Realtime ler só o que está na tela.
  const idsRef = useRef<string[]>([]);
  useEffect(() => {
    idsRef.current = parkings.map((p) => p.id);
  }, [parkings]);

  // Realtime: enquanto a tela está em foco, recebe as mudanças de vagas da tabela `parkings`.
  // Ao sair (detalhes, outra aba) a assinatura é cancelada; ao voltar, relê as vagas do que está na tela.
  useFocusEffect(
    useCallback(() => {
      const client = supabase;
      if (!client) return;
      const apply = (rows: SpotsRow[]) => setParkings((list) => withSpots(list, rows));

      const channel = client
        .channel('home-parkings')
        .on<SpotsRow>('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'parkings' }, (payload) => {
          apply([payload.new as SpotsRow]);
        })
        .subscribe((status) => {
          if (status !== 'SUBSCRIBED' || idsRef.current.length === 0) return;
          client
            .from('parkings')
            .select('id, free_spots, total_spots')
            .in('id', idsRef.current)
            .then(({ data }) => data && apply(data));
        });

      return () => {
        client.removeChannel(channel);
      };
    }, []),
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Estacionamentos</Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {usingUserLocation ? 'Perto de você' : 'Perto da Av. Paulista · localização desativada'}
        </Text>
        {/* Barra de busca e botão de filtros (Vinicius) entram aqui. */}
        <View style={styles.toggle} accessibilityRole="tablist">
          {(['map', 'list'] as const).map((m) => (
            <Pressable
              key={m}
              onPress={() => setMode(m)}
              accessibilityRole="tab"
              accessibilityState={{ selected: mode === m }}
              style={[styles.toggleItem, mode === m && styles.toggleItemActive]}>
              <Text style={[styles.toggleText, mode === m && styles.toggleTextActive]}>
                {m === 'map' ? 'Mapa' : 'Lista'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {state === 'loading' ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Brand.primary} />
          <Text style={styles.muted}>Buscando estacionamentos…</Text>
        </View>
      ) : state === 'error' ? (
        <View style={styles.center}>
          <Text style={styles.message}>Não foi possível carregar os estacionamentos.</Text>
          <Text style={styles.muted}>Verifique sua conexão e tente de novo.</Text>
          <Button title="Tentar de novo" onPress={retry} style={styles.retry} />
        </View>
      ) : mode === 'map' ? (
        <View style={styles.mapBox}>
          <ParkingMap
            parkings={parkings}
            center={center}
            showsUserLocation={location.status === 'granted'}
            onPressParking={openParking}
          />
          {parkings.length === 0 && (
            <View style={styles.mapEmpty} pointerEvents="none">
              <Text style={styles.mapEmptyText}>Nenhum estacionamento nesta região</Text>
            </View>
          )}
        </View>
      ) : (
        <FlatList
          data={parkings}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => <ParkingCard parking={item} onPress={() => openParking(item.id)} />}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={refresh}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.message}>Nenhum estacionamento por perto</Text>
              <Text style={styles.muted}>Tente buscar outra região.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.background },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, gap: 4 },
  title: { fontSize: 26, fontWeight: '800', color: Brand.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: Brand.textSecondary },
  toggle: {
    flexDirection: 'row',
    marginTop: 12,
    padding: 4,
    borderRadius: 12,
    backgroundColor: Brand.inputBackground,
  },
  toggleItem: { flex: 1, height: 36, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  toggleItemActive: { backgroundColor: Brand.white, boxShadow: '0 1px 4px rgba(15, 23, 42, 0.1)' },
  toggleText: { fontSize: 14, fontWeight: '700', color: Brand.textSecondary },
  toggleTextActive: { color: Brand.primary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8 },
  message: { fontSize: 17, fontWeight: '700', color: Brand.text, textAlign: 'center' },
  muted: { fontSize: 14, color: Brand.textSecondary, textAlign: 'center' },
  retry: { marginTop: 16, alignSelf: 'stretch' },
  mapBox: { flex: 1 },
  mapEmpty: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Brand.white,
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.12)',
  },
  mapEmptyText: { fontSize: 13, fontWeight: '600', color: Brand.text },
  list: { padding: 16, gap: 12, paddingBottom: BottomTabInset + 16, flexGrow: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 48 },
});
