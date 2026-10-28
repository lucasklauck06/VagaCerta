const { Router } = require('express');
const supabase = require('../lib/supabase');
const parkingStatus = require('../lib/parkingStatus');
const { isOpenNow, formatWeek } = require('../lib/hours');

const router = Router();
const BUCKET = 'parking-images';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const publicUrl = (path) => supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
const bad = (message) => Object.assign(new Error(message), { status: 400 });

const RADIUS_DEFAULT_M = 5000;
const RADIUS_MAX_M = 50000;

// Número da query string ou `undefined` se ausente. Rejeita vazio, texto e repetido (?lat=1&lat=2).
function queryNumber(query, name) {
    const v = query[name];
    if (v === undefined) return undefined;
    const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN;
    if (!Number.isFinite(n)) throw bad(`${name} deve ser um número`);
    return n;
}

// GET /parkings?lat=&lng=&radius=
// Contrato (combinado com o Vinicius, que adiciona maxPrice, status, openNow e sort):
//   lat     obrigatório, -90..90
//   lng     obrigatório, -180..180
//   radius  metros, opcional, padrão 5000, de 1 a 50000
// Resposta: array ordenado do mais próximo ao mais distante, cada item com
//   { id, name, address, lat, lng, distanceM, pricePerHour, totalSpots, freeSpots, status, imageUrl }
router.get('/', async (req, res, next) => {
    try {
        const lat = queryNumber(req.query, 'lat');
        const lng = queryNumber(req.query, 'lng');
        const radius = queryNumber(req.query, 'radius') ?? RADIUS_DEFAULT_M;
        if (lat === undefined || lng === undefined) throw bad('informe lat e lng');
        if (Math.abs(lat) > 90 || Math.abs(lng) > 180) throw bad('lat/lng inválidos');
        if (radius < 1 || radius > RADIUS_MAX_M) throw bad(`radius deve estar entre 1 e ${RADIUS_MAX_M} metros`);

        const { data, error } = await supabase.rpc('nearby_parkings', { p_lat: lat, p_lng: lng, p_radius_m: radius });
        if (error) throw error;

        res.json(
            data.map((p) => ({
                id: p.id,
                name: p.name,
                address: p.address,
                lat: p.lat,
                lng: p.lng,
                distanceM: Math.round(p.distance_m),
                pricePerHour: Number(p.price_per_hour),
                totalSpots: p.total_spots,
                freeSpots: p.free_spots,
                status: parkingStatus(p.free_spots, p.total_spots),
                imageUrl: p.image_path ? publicUrl(p.image_path) : null,
            })),
        );
    } catch (err) {
        next(err);
    }
});

// GET /parkings/:id?lat=&lng=
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!UUID.test(id)) throw bad('id inválido');

        const lat = req.query.lat === undefined ? null : Number(req.query.lat);
        const lng = req.query.lng === undefined ? null : Number(req.query.lng);
        if ((lat === null) !== (lng === null)) throw bad('informe lat e lng juntos');
        if (lat !== null && !(Math.abs(lat) <= 90 && Math.abs(lng) <= 180)) throw bad('lat/lng inválidos');

        const [{ data: rows, error }, { data: hours, error: hErr }, { data: files, error: fErr }] = await Promise.all([
            supabase.rpc('get_parking', { p_id: id, p_lat: lat, p_lng: lng }),
            supabase.from('parking_hours').select('weekday, opens_at, closes_at').eq('parking_id', id),
            supabase.storage.from(BUCKET).list(id, { limit: 10, sortBy: { column: 'name', order: 'asc' } }),
        ]);
        if (error || hErr) throw error || hErr;
        const p = rows?.[0];
        if (!p) return res.status(404).json({ error: 'Estacionamento não encontrado' });

        // Falha ao listar imagens não derruba a tela: cai no image_path (ou sem fotos).
        const paths =
            !fErr && files?.length ? files.filter((f) => f.id).map((f) => `${id}/${f.name}`) : p.image_path ? [p.image_path] : [];

        res.json({
            id: p.id,
            name: p.name,
            address: p.address,
            lat: p.lat,
            lng: p.lng,
            distanceM: p.distance_m === null ? null : Math.round(p.distance_m),
            pricePerHour: Number(p.price_per_hour),
            totalSpots: p.total_spots,
            freeSpots: p.free_spots,
            status: parkingStatus(p.free_spots, p.total_spots),
            openNow: isOpenNow(hours),
            hours: formatWeek(hours),
            images: paths.map(publicUrl),
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
