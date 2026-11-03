import type { ParkingStatus } from '@/lib/parking-status';

export type { ParkingStatus };

export type LatLng = { lat: number; lng: number };

// Item de GET /parkings (Home, resultados da busca e favoritos).
export type ParkingSummary = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distanceM: number;
  pricePerHour: number;
  totalSpots: number;
  freeSpots: number;
  status: ParkingStatus;
  imageUrl: string | null;
};

export type ParkingDetail = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distanceM: number | null;
  pricePerHour: number;
  totalSpots: number;
  freeSpots: number;
  status: ParkingStatus;
  openNow: boolean;
  hours: { weekday: number; day: string; closed: boolean; opensAt: string | null; closesAt: string | null }[];
  images: string[];
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Centro do seed (MASP, Av. Paulista - SP). Usado quando não há permissão de localização.
export const SEED_CENTER: LatLng = { lat: -23.5614, lng: -46.6559 };

const MOCK: ParkingDetail = {
  id: 'mock',
  name: 'Estacionamento Central',
  address: 'Rua das Flores, 123 - Centro',
  lat: -23.55052,
  lng: -46.633308,
  distanceM: 450,
  pricePerHour: 12.5,
  totalSpots: 40,
  freeSpots: 6,
  status: 'poucas_vagas',
  openNow: true,
  hours: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map((day, weekday) => ({
    weekday,
    day,
    closed: weekday === 0,
    opensAt: weekday === 0 ? null : '07:00',
    closesAt: weekday === 0 ? null : '22:00',
  })),
  images: [],
};

// Amostra do seed (backend/sql/001_parkings_seed.sql) para a Home funcionar sem backend.
const MOCK_LIST: Omit<ParkingSummary, 'distanceM'>[] = [
  { id: 'mock-1', name: 'Estacionamento Paulista Center', address: 'Av. Paulista, 1578 - Bela Vista', lat: -23.5616, lng: -46.6563, pricePerHour: 18, totalSpots: 120, freeSpots: 48, status: 'disponivel', imageUrl: null },
  { id: 'mock-2', name: 'Park MASP', address: 'Al. Santos, 1100 - Jardim Paulista', lat: -23.5627, lng: -46.655, pricePerHour: 20, totalSpots: 60, freeSpots: 0, status: 'lotado', imageUrl: null },
  { id: 'mock-3', name: 'Garagem Trianon', address: 'Rua Pamplona, 145 - Jardim Paulista', lat: -23.564, lng: -46.6547, pricePerHour: 15, totalSpots: 45, freeSpots: 4, status: 'poucas_vagas', imageUrl: null },
  { id: 'mock-4', name: 'Auto Park Consolação', address: 'Rua da Consolação, 2310 - Consolação', lat: -23.5555, lng: -46.661, pricePerHour: 12, totalSpots: 80, freeSpots: 35, status: 'disponivel', imageUrl: null },
  { id: 'mock-5', name: 'Park Brigadeiro', address: 'Av. Brigadeiro Luís Antônio, 2367 - Bela Vista', lat: -23.5668, lng: -46.6486, pricePerHour: 13, totalSpots: 90, freeSpots: 60, status: 'disponivel', imageUrl: null },
];

// Distância em metros entre dois pontos (só para o mock; a API calcula com PostGIS).
function haversineM(a: LatLng, b: LatLng) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * 6371000 * Math.asin(Math.sqrt(h)));
}

// ponytail: fetch direto sem token; trocar por `api` de '@/lib/api' (Lucas) quando entrar na develop.
// Sem EXPO_PUBLIC_API_URL usa o mock, para a tela funcionar antes do backend.
export async function getNearbyParkings(pos: LatLng, radius?: number): Promise<ParkingSummary[]> {
  if (!API_URL) {
    return MOCK_LIST.map((p) => ({ ...p, distanceM: haversineM(pos, p) }))
      .filter((p) => radius === undefined || p.distanceM <= radius)
      .sort((a, b) => a.distanceM - b.distanceM);
  }
  const qs = `?lat=${pos.lat}&lng=${pos.lng}${radius === undefined ? '' : `&radius=${radius}`}`;
  const res = await fetch(`${API_URL}/parkings${qs}`);
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

export async function getParking(id: string, pos?: LatLng): Promise<ParkingDetail | null> {
  if (!API_URL) return { ...MOCK, id };
  const qs = pos ? `?lat=${pos.lat}&lng=${pos.lng}` : '';
  const res = await fetch(`${API_URL}/parkings/${id}${qs}`);
  if (res.status === 404 || res.status === 400) return null;
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}
