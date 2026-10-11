const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { buildSeedOperations } = require('../util/import-mongo');

const gifts = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../util/import-mongo/gifts.json'), 'utf8')
).docs;

describe('MongoDB seed data', () => {
    it('contains exactly 16 valid gifts with unique IDs', () => {
        const operations = buildSeedOperations(gifts);
        assert.strictEqual(operations.length, 16);
        assert.strictEqual(new Set(gifts.map((gift) => gift.id)).size, 16);
    });

    it('uses insert-only upserts so rerunning the import does not replace existing gifts', () => {
        const operations = buildSeedOperations(gifts);
        for (const { updateOne } of operations) {
            assert.strictEqual(updateOne.upsert, true);
            assert.deepStrictEqual(Object.keys(updateOne.update), ['$setOnInsert']);
            assert.deepStrictEqual(Object.keys(updateOne.filter), ['id']);
        }
    });

    it('rejects duplicate IDs and gifts with unsupported categories before writing', () => {
        assert.throws(
            () => buildSeedOperations([...gifts.slice(0, 15), { ...gifts[0] }]),
            /Duplicate gift ID/
        );
        assert.throws(
            () => buildSeedOperations(gifts.map((gift, index) => (
                index === 0 ? { ...gift, category: 'Office Furniture' } : gift
            ))),
            /Choose a valid category/
        );
    });
});
