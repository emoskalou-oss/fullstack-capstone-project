const assert = require('assert');
const request = require('supertest');
process.env.NODE_ENV = 'production';
const app = require('../index');

describe('Sentiment API', () => {
    it('returns a health response', async () => {
        const response = await request(app).get('/health').expect(200);
        assert.deepStrictEqual(response.body, { status: 'ok' });
    });

    it('rejects missing or blank sentences', async () => {
        await request(app).post('/sentiment').send({}).expect(400);
        await request(app).post('/sentiment').send({ sentence: '   ' }).expect(400);
    });

    it('classifies a positive sentence and returns its score', async () => {
        const response = await request(app)
            .post('/sentiment')
            .send({ sentence: 'This is a wonderful and happy day' })
            .expect(200);
        assert.strictEqual(response.body.sentiment, 'positive');
        assert.strictEqual(typeof response.body.sentimentScore, 'number');
    });

    it('classifies an unknown-word sentence as neutral', async () => {
        const response = await request(app)
            .post('/sentiment')
            .send({ sentence: 'table window river' })
            .expect(200);
        assert.strictEqual(response.body.sentiment, 'neutral');
    });

    it('classifies a negative sentence', async () => {
        const response = await request(app)
            .post('/sentiment')
            .send({ sentence: 'This is a terrible and awful day' })
            .expect(200);
        assert.strictEqual(response.body.sentiment, 'negative');
        assert.strictEqual(typeof response.body.sentimentScore, 'number');
    });

    it('rejects oversized sentences', async () => {
        await request(app)
            .post('/sentiment')
            .send({ sentence: 'a'.repeat(10001) })
            .expect(400);
    });
});
