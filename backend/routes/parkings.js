const { Router } = require('express');
const supabase = require('../lib/supabase');
const parkingStatus = require('../lib/parkingStatus');
const { isOpenNow, formatWeek } = require('../lib/hours');

const router = Router();
const BUCKET = 'parking-images';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const publicUrl = (path) => supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
const bad = (message) => Object.assign(new Error(message), { status: 400 });

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
