const BCRYPT_MAX_PASSWORD_BYTES = 72;

function isBcryptPasswordLengthValid(password) {
    return typeof password === 'string'
        && Buffer.byteLength(password, 'utf8') <= BCRYPT_MAX_PASSWORD_BYTES;
}

module.exports = { isBcryptPasswordLengthValid };
