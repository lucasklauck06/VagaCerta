require('./lib/supabase');
const express = require('express');
const { clerkMiddleware } = require('@clerk/express');
const requireAuth = require('./middleware/requireAuth');
const { startSpotSimulation } = require('./jobs/simulateSpots');

const app = express();
app.use(require('helmet')());
app.use(require('cors')({ origin: process.env.CORS_ORIGIN || false }));
app.use(require('express-rate-limit')({ windowMs: 15 * 60 * 1000, limit: 100 }));
app.use(express.json({ limit: '100kb' }));
app.use('/health', require('./routes/health'));
app.use(clerkMiddleware());
app.use('/me', requireAuth, require('./routes/me'));
app.use('/parkings', requireAuth, require('./routes/parkings'));
app.use((req, res) => res.status(404).json({ error: 'Rota não encontrada' }));
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`API rodando na porta ${PORT}`);
    startSpotSimulation();
});
