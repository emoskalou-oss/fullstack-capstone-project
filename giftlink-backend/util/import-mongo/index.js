require('dotenv').config();
const fs = require('fs');
const path = require('path');
const connectToDatabase = require('../../models/db');
const { validateGiftInput } = require('../../util/giftValidation');
const { closeDatabase } = connectToDatabase;

function buildSeedOperations(data) {
    if (!Array.isArray(data) || data.length !== 16) {
        throw new Error('gifts.json must contain exactly 16 gifts');
    }

    const giftIds = new Set();
    for (const [index, gift] of data.entries()) {
        if (!gift || typeof gift.id !== 'string' || !gift.id.trim()) {
            throw new Error(`Gift at index ${index} must have a non-empty string ID`);
        }
        if (giftIds.has(gift.id)) {
            throw new Error(`Duplicate gift ID at index ${index}`);
        }
        giftIds.add(gift.id);

        const validationError = validateGiftInput(gift);
        if (validationError) {
            throw new Error(`Gift ${gift.id} is invalid: ${validationError}`);
        }
    }

    return data.map((gift) => ({
        updateOne: {
            filter: { id: gift.id },
            update: { $setOnInsert: gift },
            upsert: true,
        },
    }));
}

async function loadData() {
    try {
        const filename = path.join(__dirname, 'gifts.json');
        const data = JSON.parse(fs.readFileSync(filename, 'utf8')).docs;
        const operations = buildSeedOperations(data);

        const db = await connectToDatabase();
        const collection = db.collection('gifts');
        await collection.createIndex({ id: 1 }, { unique: true });
        const result = await collection.bulkWrite(operations, { ordered: true });
        const importedCount = result.upsertedCount;
        console.log(`Seed complete: ${importedCount} inserted; ${data.length - importedCount} already present.`);
        return { importedCount, documentCount: data.length };
    } finally {
        await closeDatabase();
    }
}

if (require.main === module) {
    loadData().catch((error) => {
        console.error('Failed to import gift data:', error.message);
        process.exitCode = 1;
    });
}

module.exports = { buildSeedOperations, loadData };
