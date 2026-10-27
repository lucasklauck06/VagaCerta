const express = require('express');

const app = express();

app.use('/health', require('./routes/health'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`API rodando na porta ${PORT}`);
});
