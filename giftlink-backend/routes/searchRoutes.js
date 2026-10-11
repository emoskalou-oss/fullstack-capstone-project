const express = require('express');
const router = express.Router();
const connectToDatabase = require('../models/db');
const { buildGiftQuery } = require('../util/giftValidation');

router.get('/', async (req, res, next) => {
    try {
        const query = buildGiftQuery(req.query);
        const db = await connectToDatabase();
        const gifts = await db.collection('gifts').find(query).toArray();
        res.json(gifts);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
