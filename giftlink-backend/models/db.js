require('dotenv').config();
const { MongoClient } = require('mongodb');

const dbName = 'giftdb';
let client;
let dbInstance;
let connectionPromise;

async function connectToDatabase() {
    if (dbInstance) {
        return dbInstance;
    }

    if (connectionPromise) {
        return connectionPromise;
    }

    const url = process.env.MONGO_URL;
    if (!url) {
        throw new Error('MONGO_URL must be configured');
    }

    client = new MongoClient(url);
    connectionPromise = (async () => {
        try {
            await client.connect();
            dbInstance = client.db(dbName);
            return dbInstance;
        } catch (error) {
            await client.close();
            client = undefined;
            connectionPromise = undefined;
            throw error;
        }
    })();

    return connectionPromise;
}

async function closeDatabase() {
    if (client) {
        await client.close();
    }
    client = undefined;
    dbInstance = undefined;
    connectionPromise = undefined;
}

module.exports = connectToDatabase;
module.exports.closeDatabase = closeDatabase;
