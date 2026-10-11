/*jshint esversion: 8 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./logger');
const connectToDatabase = require('./models/db');
const { validateJwtSecret } = require('./util/jwtSecret');
const giftRoutes = require('./routes/giftRoutes');
const searchRoutes = require('./routes/searchRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const pinoHttp = require('pino-http');
const port = Number(process.env.PORT) || 3060;
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        const error = new Error('Origin is not allowed by CORS');
        error.status = 403;
        return callback(error);
    },
}));
app.use(express.json({ limit: '1mb' }));
app.use(pinoHttp({ logger }));

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/gifts/search', searchRoutes);
app.use('/api/gifts', giftRoutes);

app.use((err, req, res, next) => {
    logger.error({ err }, 'Request failed');
    const status = Number.isInteger(err.status) ? err.status : 500;
    res.status(status).json({
        error: status < 500 ? err.message : 'Internal Server Error',
    });
});

if (require.main === module) {
    let jwtConfigurationValid = true;
    try {
        validateJwtSecret();
    } catch (error) {
        jwtConfigurationValid = false;
        logger.error({ reason: error.message }, 'Invalid JWT configuration; server will not start');
        process.exitCode = 1;
    }

    if (jwtConfigurationValid) {
        connectToDatabase()
            .then(() => {
                app.listen(port, () => logger.info(`Server listening on port ${port}`));
            })
            .catch((error) => {
                logger.error({ err: error }, 'Failed to connect to MongoDB');
                process.exitCode = 1;
            });
    }
}

module.exports = app;
