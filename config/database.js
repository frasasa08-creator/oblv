const db = require('../db');

function createDatabase() {
    return db;
}

const dbConfig = {};

module.exports = { createDatabase, dbConfig };
