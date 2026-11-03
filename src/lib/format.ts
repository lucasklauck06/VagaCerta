export const formatDistance = (m: number) => (m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1).replace('.', ',')} km`);
export const formatPrice = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}/h`;
export const formatFreeSpots = (n: number) => `${n} ${n === 1 ? 'vaga livre' : 'vagas livres'}`;
