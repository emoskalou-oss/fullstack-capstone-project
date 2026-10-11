const categories = new Set(['Living', 'Bedroom', 'Bathroom', 'Kitchen', 'Office']);
const conditions = new Set(['New', 'Like New', 'Older']);

function validateGiftInput(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        return 'Gift details must be provided';
    }
    if (typeof input.name !== 'string' || !input.name.trim() || input.name.trim().length > 120) {
        return 'Name must contain between 1 and 120 characters';
    }
    if (!categories.has(input.category)) {
        return 'Choose a valid category';
    }
    if (!conditions.has(input.condition)) {
        return 'Choose a valid condition';
    }
    const ageYears = Number(input.age_years);
    if (!Number.isFinite(ageYears) || ageYears < 0 || ageYears > 100) {
        return 'Age must be a number between 0 and 100';
    }
    if (typeof input.description !== 'string' || !input.description.trim()
        || input.description.trim().length > 5000) {
        return 'Description must contain between 1 and 5000 characters';
    }
    if (input.image !== undefined && typeof input.image !== 'string') {
        return 'Image must be a URL or path';
    }
    return null;
}

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildGiftQuery(params) {
    const query = {};
    const name = params.name === undefined ? params.search : params.name;
    if (name !== undefined) {
        if (typeof name !== 'string' || name.length > 120) {
            const error = new Error('Name search must be at most 120 characters');
            error.status = 400;
            throw error;
        }
        if (name.trim()) {
            query.name = { $regex: escapeRegex(name.trim()), $options: 'i' };
        }
    }

    if (params.category !== undefined) {
        if (typeof params.category !== 'string' || !categories.has(params.category)) {
            const error = new Error('Choose a valid category');
            error.status = 400;
            throw error;
        }
        query.category = params.category;
    }
    if (params.condition !== undefined) {
        if (typeof params.condition !== 'string' || !conditions.has(params.condition)) {
            const error = new Error('Choose a valid condition');
            error.status = 400;
            throw error;
        }
        query.condition = params.condition;
    }
    if (params.age_years !== undefined && params.age_years !== '') {
        const ageYears = Number(params.age_years);
        if (!Number.isFinite(ageYears) || ageYears < 0 || ageYears > 100) {
            const error = new Error('Age must be a number between 0 and 100');
            error.status = 400;
            throw error;
        }
        query.age_years = { $lte: ageYears };
    }
    return query;
}

module.exports = { buildGiftQuery, validateGiftInput };
