// db.js - Database SQLite locale (sostituisce PostgreSQL/Aiven)
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'data', 'bot.db');

// Crea cartella data se non esiste
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

const sqlite = new Database(DB_PATH);

// Abilita WAL per performance migliori
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

/**
 * Wrapper che emula l'API di node-postgres (pg):
 *   db.query('SELECT * FROM foo WHERE id = $1', [42])
 * restituisce una Promise con { rows: [...] }
 */
const db = {
    query: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            try {
                // Converti placeholder $1, $2, ... in ? per SQLite
                let sqliteSQL = sql.replace(/\$(\d+)/g, '?');

                // Normalizza parametri (gestisce undefined → null)
                const safeParams = params.map(p => (p === undefined ? null : p));

                const upper = sqliteSQL.trim().toUpperCase();

                if (
                    upper.startsWith('SELECT') ||
                    upper.startsWith('WITH') ||
                    upper.startsWith('PRAGMA')
                ) {
                    const stmt = sqlite.prepare(sqliteSQL);
                    const rows = stmt.all(...safeParams);
                    resolve({ rows, rowCount: rows.length });
                } else if (upper.startsWith('INSERT')) {
                    const stmt = sqlite.prepare(sqliteSQL);
                    const info = stmt.run(...safeParams);
                    // Emula RETURNING: restituisce l'ultima riga inserita se richiesto
                    if (sqliteSQL.toUpperCase().includes('RETURNING')) {
                        const table = sqliteSQL.match(/INTO\s+(\w+)/i)?.[1];
                        const row = table
                            ? sqlite.prepare(`SELECT * FROM ${table} WHERE rowid = ?`).get(info.lastInsertRowid)
                            : { id: info.lastInsertRowid };
                        resolve({ rows: [row], rowCount: 1 });
                    } else {
                        resolve({ rows: [{ id: info.lastInsertRowid }], rowCount: info.changes });
                    }
                } else if (
                    upper.startsWith('UPDATE') ||
                    upper.startsWith('DELETE') ||
                    upper.startsWith('ALTER') ||
                    upper.startsWith('CREATE') ||
                    upper.startsWith('DROP')
                ) {
                    const stmt = sqlite.prepare(sqliteSQL);
                    const info = stmt.run(...safeParams);
                    resolve({ rows: [], rowCount: info.changes });
                } else {
                    const stmt = sqlite.prepare(sqliteSQL);
                    const rows = stmt.all(...safeParams);
                    resolve({ rows, rowCount: rows.length });
                }
            } catch (err) {
                console.error('❌ SQLite query error:', err.message);
                console.error('   SQL:', sql);
                console.error('   Params:', params);
                reject(err);
            }
        });
    },

    // Alias usato da alcuni moduli
    end: () => Promise.resolve(),
};

module.exports = db;
