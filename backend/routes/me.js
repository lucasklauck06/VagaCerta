const { Router } = require('express');

const router = Router();

router.get('/', (req, res) => {
    res.json({ userId: req.userId });
});

module.exports = router;