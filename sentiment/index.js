require('dotenv').config({ quiet: true });
const express = require('express');
const natural = require('natural');
const logger = require('./logger');
const expressPino = require('express-pino-logger')({ logger });

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '32kb' }));
app.use(expressPino);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.post('/sentiment', (req, res) => {
    const { sentence } = req.body || {};
    if (typeof sentence !== 'string' || !sentence.trim() || sentence.length > 10000) {
        logger.error('A non-empty sentence of at most 10000 characters is required');
        return res.status(400).json({ error: 'A non-empty sentence of at most 10000 characters is required' });
    }

    try {
        const analyzer = new natural.SentimentAnalyzer(
            'English',
            natural.PorterStemmer,
            'afinn'
        );
        const sentimentScore = analyzer.getSentiment(sentence.trim().split(/\s+/));
        const sentiment = sentimentScore > 0 ? 'positive' : sentimentScore < 0 ? 'negative' : 'neutral';
        return res.status(200).json({ sentimentScore, sentiment });
    } catch (error) {
        logger.error({ err: error }, 'Error performing sentiment analysis');
        return res.status(500).json({ message: 'Error performing sentiment analysis' });
    }
});

if (require.main === module) {
    app.listen(port, () => logger.info(`Sentiment service listening on port ${port}`));
}

module.exports = app;
