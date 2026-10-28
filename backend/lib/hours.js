// Lógica de horário compartilhada (detalhes do Vitor + filtro "aberto agora" do Vinicius).
// Fuso do projeto: America/Sao_Paulo. weekday: 0 = domingo ... 6 = sábado.
const TZ = process.env.APP_TIMEZONE || 'America/Sao_Paulo';
const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const WEEKDAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

const toMin = (t) => {
    const [h, m] = t.split(':');
    return Number(h) * 60 + Number(m);
};

// Dia da semana e minuto do dia no fuso do projeto.
function localNow(date = new Date()) {
    const p = Object.fromEntries(
        new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
            .formatToParts(date)
            .map((x) => [x.type, x.value]),
    );
    return { weekday: WEEKDAYS[p.weekday], minute: Number(p.hour) * 60 + Number(p.minute) };
}

// hours: [{ weekday, opens_at: 'HH:MM[:SS]', closes_at }]
function isOpenNow(hours, date = new Date()) {
    const { weekday, minute } = localNow(date);
    const yesterday = (weekday + 6) % 7;
    return hours.some((h) => {
        const open = toMin(h.opens_at);
        const close = toMin(h.closes_at);
        const overnight = close <= open;
        if (h.weekday === weekday) return overnight ? minute >= open : minute >= open && minute < close;
        // horário de ontem que atravessa a meia-noite ainda vale até `close` de hoje
        return h.weekday === yesterday && overnight && minute < close;
    });
}

// Lista da semana para o app: sempre 7 itens, "Fechado" onde não há registro.
function formatWeek(hours) {
    return DAYS.map((day, weekday) => {
        const h = hours.find((x) => x.weekday === weekday);
        return { weekday, day, closed: !h, opensAt: h?.opens_at.slice(0, 5) ?? null, closesAt: h?.closes_at.slice(0, 5) ?? null };
    });
}

module.exports = { isOpenNow, formatWeek, localNow };

if (require.main === module) {
    const assert = require('node:assert');
    // 2026-10-27 é terça (2); -03:00 = America/Sao_Paulo
    const at = (iso) => new Date(iso + '-03:00');
    const comercial = [1, 2, 3, 4, 5].map((weekday) => ({ weekday, opens_at: '08:00:00', closes_at: '18:00:00' }));
    const noite = [{ weekday: 2, opens_at: '18:00', closes_at: '02:00' }]; // terça 18h -> quarta 02h
    assert(isOpenNow(comercial, at('2026-10-27T10:00:00')));
    assert(!isOpenNow(comercial, at('2026-10-27T18:00:00'))); // fecha 18:00 exato
    assert(!isOpenNow(comercial, at('2026-10-25T10:00:00'))); // domingo
    assert(isOpenNow(noite, at('2026-10-27T23:00:00')));
    assert(isOpenNow(noite, at('2026-10-28T01:30:00'))); // quarta de madrugada, horário de terça
    assert(!isOpenNow(noite, at('2026-10-28T02:00:00')));
    assert(!isOpenNow(noite, at('2026-10-27T01:30:00'))); // terça de madrugada: segunda não tem registro
    assert(formatWeek(comercial)[0].closed);
    console.log('hours.js ok');
}
