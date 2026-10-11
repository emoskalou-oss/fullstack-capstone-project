const provisionalSecrets = new Set([
    'changeme',
    'change-me',
    'change_me',
    'password',
    'secret',
    'secretkey',
    'setasecret',
    'your-secret-key',
    'replace-with-a-random-secret-of-at-least-32-characters',
]);

function validateJwtSecret(secret = process.env.JWT_SECRET) {
    if (typeof secret !== 'string' || !secret.trim()) {
        throw new Error('JWT_SECRET must be configured');
    }
    if (secret.trim().length < 32) {
        throw new Error('JWT_SECRET must contain at least 32 characters');
    }

    const normalizedSecret = secret.trim().toLowerCase();
    if (secret !== secret.trim()
        || provisionalSecrets.has(normalizedSecret)
        || normalizedSecret.includes('<')
        || normalizedSecret.includes('>')) {
        throw new Error('JWT_SECRET must not be a placeholder value');
    }

    return secret;
}

module.exports = { validateJwtSecret };
