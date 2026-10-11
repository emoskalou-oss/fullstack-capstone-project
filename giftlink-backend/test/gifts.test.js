const assert = require('assert');
const request = require('supertest');
const { spawnSync } = require('child_process');
const crypto = require('crypto');
const path = require('path');
process.env.NODE_ENV = 'production';
const app = require('../app');
const { buildGiftQuery, validateGiftInput } = require('../util/giftValidation');
const { validateJwtSecret } = require('../util/jwtSecret');
const { isBcryptPasswordLengthValid } = require('../util/passwordValidation');

describe('Gift API', () => {
    it('returns a health response without requiring a database connection', async () => {
        const response = await request(app).get('/health').expect(200);
        assert.deepStrictEqual(response.body, { status: 'ok' });
    });

    it('mounts category search before the gift ID route', async () => {
        const response = await request(app)
            .get('/api/search?category=not-a-category')
            .expect(400);
        assert.match(response.body.error, /category/i);
    });

    it('requires authentication for gift creation', async () => {
        await request(app).post('/api/gifts').send({}).expect(401);
    });

    it('validates registration input before attempting a database connection', async () => {
        const invalidResponse = await request(app)
            .post('/api/auth/register')
            .send({ name: '', email: 'not-an-email', password: 'short' })
            .expect(400);
        assert.match(invalidResponse.body.error, /valid name/i);
        await request(app).post('/api/auth/register').expect(400);
    });

    it('rejects passwords over bcrypt’s UTF-8 byte limit before hashing or database access', async () => {
        const previousSecret = process.env.JWT_SECRET;
        process.env.JWT_SECRET = 'invalid-test-secret';
        try {
            for (const password of ['a'.repeat(73), '😀'.repeat(19)]) {
                const response = await request(app)
                    .post('/api/auth/register')
                    .send({ name: 'Test User', email: 'test@example.com', password })
                    .expect(400);
                assert.match(response.body.error, /72 UTF-8 bytes/i);
            }
        } finally {
            if (previousSecret === undefined) {
                delete process.env.JWT_SECRET;
            } else {
                process.env.JWT_SECRET = previousSecret;
            }
        }
    });
});

describe('Bcrypt password byte-length validation', () => {
    it('accepts exactly 72 ASCII bytes and rejects 73', () => {
        assert.strictEqual(isBcryptPasswordLengthValid('a'.repeat(72)), true);
        assert.strictEqual(isBcryptPasswordLengthValid('a'.repeat(73)), false);
    });

    it('accepts 18 four-byte characters and rejects 19', () => {
        assert.strictEqual(isBcryptPasswordLengthValid('😀'.repeat(18)), true);
        assert.strictEqual(isBcryptPasswordLengthValid('😀'.repeat(19)), false);
    });
});

describe('Gift validation and search queries', () => {
    it('accepts a valid gift and rejects unsupported categories', () => {
        const gift = {
            name: 'Desk lamp',
            category: 'Living',
            condition: 'Like New',
            age_years: 2,
            description: 'A working lamp.',
        };
        assert.strictEqual(validateGiftInput(gift), null);
        assert.match(validateGiftInput({ ...gift, category: 'Unknown' }), /category/i);
    });

    it('escapes search text and applies category, condition and age filters', () => {
        assert.deepStrictEqual(
            buildGiftQuery({ name: 'lamp.*', category: 'Living', condition: 'New', age_years: '3' }),
            {
                name: { $regex: 'lamp\\.\\*', $options: 'i' },
                category: 'Living',
                condition: 'New',
                age_years: { $lte: 3 },
            }
        );
        assert.throws(() => buildGiftQuery({ category: 'invalid' }), { status: 400 });
    });
});

describe('JWT secret configuration', () => {
    it('accepts a randomly generated secret of at least 32 characters', () => {
        const secret = crypto.randomBytes(32).toString('hex');
        assert.strictEqual(
            validateJwtSecret(secret),
            secret
        );
    });

    it('rejects a missing environment variable', () => {
        const previousSecret = process.env.JWT_SECRET;
        delete process.env.JWT_SECRET;
        try {
            assert.throws(() => validateJwtSecret(), /JWT_SECRET must be configured/);
        } finally {
            if (previousSecret === undefined) {
                delete process.env.JWT_SECRET;
            } else {
                process.env.JWT_SECRET = previousSecret;
            }
        }
    });

    it('rejects short and recognized placeholder values without echoing them', () => {
        const invalidSecrets = [
            'short-test-secret',
            '<generate-a-private-random-secret-of-at-least-32-characters>',
            'replace-with-a-random-secret-of-at-least-32-characters',
        ];

        for (const secret of invalidSecrets) {
            assert.throws(
                () => validateJwtSecret(secret),
                (error) => !secret || !error.message.includes(secret)
            );
        }
    });

    it('refuses to start with an invalid secret before attempting MongoDB, without logging the secret', () => {
        const invalidSecret = 'test-only-short-secret';
        const result = spawnSync(process.execPath, [path.join(__dirname, '..', 'app.js')], {
            encoding: 'utf8',
            env: {
                ...process.env,
                NODE_ENV: 'production',
                JWT_SECRET: invalidSecret,
                MONGO_URL: 'mongodb://127.0.0.1:1/giftdb',
            },
            timeout: 5000,
        });

        const output = `${result.stdout}\n${result.stderr}`;
        assert.strictEqual(result.status, 1);
        assert.match(output, /Invalid JWT configuration/);
        assert.ok(!output.includes(invalidSecret));
    });
});
