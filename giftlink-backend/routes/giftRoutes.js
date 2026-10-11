const express = require('express');
const { randomUUID } = require('crypto');
const router = express.Router();
const connectToDatabase = require('../models/db');
const authenticate = require('../middleware/authenticate');
const { validateGiftInput } = require('../util/giftValidation');

router.get('/', async (req, res, next) => {
    try {
        const db = await connectToDatabase();
        const gifts = await db.collection('gifts').find({}).toArray();
        res.json(gifts);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const db = await connectToDatabase();
        const gift = await db.collection('gifts').findOne({ id: req.params.id });
        if (!gift) {
            return res.status(404).json({ error: 'Gift not found' });
        }
        res.json(gift);
    } catch (error) {
        next(error);
    }
});

router.post('/', authenticate, async (req, res, next) => {
    try {
        const validationError = validateGiftInput(req.body);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        const ageYears = Number(req.body.age_years);
        const gift = {
            id: randomUUID(),
            name: req.body.name.trim(),
            category: req.body.category,
            condition: req.body.condition,
            posted_by: req.user.userId,
            date_added: Math.floor(Date.now() / 1000),
            age_years: ageYears,
            age_days: Math.round(ageYears * 365),
            description: req.body.description.trim(),
            comments: [],
        };
        if (typeof req.body.image === 'string' && req.body.image.trim()) {
            gift.image = req.body.image.trim();
        }

        const db = await connectToDatabase();
        await db.collection('gifts').insertOne(gift);
        res.status(201).json(gift);
    } catch (error) {
        next(error);
    }
});

router.post('/:id/comments', authenticate, async (req, res, next) => {
    try {
        const commentText = req.body && typeof req.body.comment === 'string'
            ? req.body.comment.trim()
            : '';
        if (!commentText || commentText.length > 1000) {
            return res.status(400).json({ error: 'Comment must contain between 1 and 1000 characters' });
        }

        const db = await connectToDatabase();
        const users = db.collection('users');
        const user = await users.findOne(
            { _id: require('mongodb').ObjectId.createFromHexString(req.user.userId) },
            { projection: { name: 1 } }
        );
        if (!user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const comment = {
            author: user.name,
            comment: commentText,
            createdAt: new Date().toISOString(),
        };
        const result = await db.collection('gifts').updateOne(
            { id: req.params.id },
            { $push: { comments: comment } }
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Gift not found' });
        }
        res.status(201).json(comment);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
