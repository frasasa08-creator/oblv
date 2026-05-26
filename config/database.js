// database.js - Compatibilità con il vecchio codice che importa database.js
// Usa il db SQLite locale tramite db.js
const db = require('./db');

function createDatabase() {
    return db;
}

// dbConfig vuoto per compatibilità (non più necessario)
const dbConfig = {};

module.exports = { createDatabase, dbConfig };
