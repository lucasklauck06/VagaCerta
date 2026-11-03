export type ParkingStatus = 'disponivel' | 'poucas_vagas' | 'lotado';

// Mesma regra de backend/lib/parkingStatus.js (fonte oficial). Repetida aqui só para recalcular o
// badge quando o Realtime avisa que `free_spots` mudou, sem chamar a API de novo.
const POUCAS_VAGAS_MAX = 0.2;

export function parkingStatus(freeSpots: number, totalSpots: number): ParkingStatus {
  if (freeSpots <= 0) return 'lotado';
  if (totalSpots > 0 && freeSpots / totalSpots <= POUCAS_VAGAS_MAX) return 'poucas_vagas';
  return 'disponivel';
}
