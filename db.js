// db.js - Database PostgreSQL Neon (gratuito, persistente)
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const db = {
    query: (sql, params = []) => pool.query(sql, params),
    end: () => pool.end(),
};

module.exports = db;
