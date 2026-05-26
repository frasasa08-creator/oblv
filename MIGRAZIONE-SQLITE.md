# 🗄️ Migrazione: PostgreSQL (Aiven) → SQLite Locale

## Cosa è cambiato

Il database è stato convertito da **PostgreSQL remoto (Aiven)** a **SQLite locale**.  
Il file del database viene creato automaticamente in `data/bot.db` all'avvio del bot.

### File modificati
| File | Modifica |
|------|----------|
| `db.js` | Completamente riscritto con `better-sqlite3` + wrapper compatibile con l'API `pg` |
| `database.js` | Aggiornato per usare il nuovo `db.js` |
| `config/database.js` | Aggiornato per usare il nuovo `db.js` |
| `index.js` | Rimosso blocco `new Pool(...)` e fix query SQL incompatibili |
| `package.json` | Sostituito `pg` con `better-sqlite3` |
| `.env.example` | Rimossi `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_SSL` |

### Variabili `.env` rimosse
Le seguenti variabili **non servono più**:
```
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
DB_SSL
```

## Installazione

```bash
npm install
```

## Avvio

```bash
node index.js
```

Il file `data/bot.db` viene creato automaticamente con tutte le tabelle al primo avvio.

## Struttura DB (invariata)

Le tabelle sono le stesse di prima:
- `guild_settings` — configurazione per ogni server Discord
- `tickets` — ticket aperti/chiusi
- `messages` — messaggi nei ticket

## Note tecniche

- Il wrapper in `db.js` traduce le query PostgreSQL (`$1`, `$2`, ...) in SQLite (`?`)
- `RETURNING *` è gestito automaticamente recuperando la riga appena inserita
- `JSONB` → `TEXT` (i dati JSON vengono salvati come stringa)
- `SERIAL` → `INTEGER PRIMARY KEY AUTOINCREMENT`
- `NOW()` → `datetime('now')` in SQLite
- `INTERVAL` → `datetime('now', '-X seconds/hours')`
