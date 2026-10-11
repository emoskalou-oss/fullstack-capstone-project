const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const router = express.Router();
const connectToDatabase = require('../models/db');
const authenticate = require('../middleware/authenticate');
const { validateJwtSecret } = require('../util/jwtSecret');
const { isBcryptPasswordLengthValid } = require('../util/passwordValidation');

function createToken(userId) {
    return jwt.sign({}, validateJwtSecret(), {
        subject: userId,
        expiresIn: '1d',
    });
}

function publicUser(user) {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
    };
}

function requestBody(body) {
    return body && typeof body === 'object' && !Array.isArray(body) ? body : {};
}

router.post('/register', async (req, res, next) => {
    try {
        const body = requestBody(req.body);
        const name = typeof body.name === 'string' ? body.name.trim() : '';
        const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
        const password = typeof body.password === 'string' ? body.password : '';
        if (!name || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
            || password.length < 8 || !isBcryptPasswordLengthValid(password)) {
            return res.status(400).json({
                error: 'Provide a valid name, email, and a password of at least 8 characters and at most 72 UTF-8 bytes',
            });
        }
        validateJwtSecret();

        const db = await connectToDatabase();
        const users = db.collection('users');
        await users.createIndex({ email: 1 }, { unique: true });
        if (await users.findOne({ email })) {
            return res.status(409).json({ error: 'An account with this email already exists' });
        }

        const user = {
            name,
            email,
            passwordHash: await bcrypt.hash(password, 12),
            createdAt: new Date(),
        };
        const result = await users.insertOne(user);
        user._id = result.insertedId;
        res.status(201).json({ token: createToken(user._id.toString()), user: publicUser(user) });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ error: 'An account with this email already exists' });
        }
        next(error);
    }
});

router.post('/login', async (req, res, next) => {
    try {
        validateJwtSecret();
        const body = requestBody(req.body);
        const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
        const password = typeof body.password === 'string' ? body.password : '';
        const db = await connectToDatabase();
        const user = await db.collection('users').findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        res.json({ token: createToken(user._id.toString()), user: publicUser(user) });
    } catch (error) {
        next(error);
    }
});

router.get('/me', authenticate, async (req, res, next) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('users');
        const user = await collection.findOne(
            { _id: new ObjectId(req.user.userId) },
            { projection: { passwordHash: 0 } }
        );
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(publicUser(user));
    } catch (error) {
        next(error);
    }
});

router.put('/update', authenticate, async (req, res, next) => {
    try {
        const body = requestBody(req.body);
        const name = typeof body.name === 'string' ? body.name.trim() : '';
        if (!name || name.length > 100) {
            return res.status(400).json({ error: 'Name must contain between 1 and 100 characters' });
        }

        const db = await connectToDatabase();
        const users = db.collection('users');
        const userId = new ObjectId(req.user.userId);
        const result = await users.updateOne({ _id: userId }, { $set: { name } });
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user = await users.findOne({ _id: userId }, { projection: { passwordHash: 0 } });
        res.json(publicUser(user));
    } catch (error) {
        next(error);
    }
});

module.exports = router;
