// Simulação de disponibilidade (seção 5.6 do doc): sem sensores, o backend mexe em `free_spots`
// de alguns estacionamentos de tempos em tempos. O app recebe a mudança pelo Realtime do Supabase.
// Liga com SIMULATE_SPOTS=true; intervalo em SIMULATE_INTERVAL_MS (10000 a 30000, padrão 15000).
const supabase = require('../lib/supabase');

const PER_TICK = 4; // estacionamentos alterados por rodada

const randomInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

// ±1 a 5 vagas, sem sair de 0..total.
function nextFreeSpots(free, total) {
    const delta = randomInt(1, 5) * (Math.random() < 0.5 ? -1 : 1);
    return Math.min(total, Math.max(0, free + delta));
}

async function tick() {
    const { data, error } = await supabase.from('parkings').select('id, free_spots, total_spots');
    if (error) throw error;

    const picked = data.sort(() => Math.random() - 0.5).slice(0, PER_TICK);
    await Promise.all(
        picked.map(async (p) => {
            const free = nextFreeSpots(p.free_spots, p.total_spots);
            if (free === p.free_spots) return;
            const { error: uErr } = await supabase.from('parkings').update({ free_spots: free }).eq('id', p.id);
            if (uErr) throw uErr;
        }),
    );
}

function startSpotSimulation() {
    if (process.env.SIMULATE_SPOTS !== 'true') return;
    const interval = Math.min(30000, Math.max(10000, Number(process.env.SIMULATE_INTERVAL_MS) || 15000));

    // setTimeout encadeado em vez de setInterval puro: uma rodada lenta não se sobrepõe à próxima.
    const loop = () =>
        tick()
            .catch((err) => console.error('[simulação de vagas]', err.message))
            .finally(() => setTimeout(loop, interval).unref());
    setTimeout(loop, interval).unref();
    console.log(`Simulação de vagas ligada (a cada ${interval / 1000}s)`);
}

module.exports = { startSpotSimulation };
