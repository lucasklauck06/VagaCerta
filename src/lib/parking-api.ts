export type ParkingStatus = 'disponivel' | 'poucas_vagas' | 'lotado';

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

// ponytail: fetch direto sem token; trocar por `api` de '@/lib/api' (Lucas) quando entrar na develop.
// Sem EXPO_PUBLIC_API_URL usa o mock, para a tela funcionar antes do backend.
export async function getParking(id: string, pos?: { lat: number; lng: number }): Promise<ParkingDetail | null> {
  if (!API_URL) return { ...MOCK, id };
  const qs = pos ? `?lat=${pos.lat}&lng=${pos.lng}` : '';
  const res = await fetch(`${API_URL}/parkings/${id}${qs}`);
  if (res.status === 404 || res.status === 400) return null;
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}
