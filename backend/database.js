const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Check if we're running on Vercel (serverless)
const isVercel = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME;

let db;

if (isVercel) {
  // Vercel: use in-memory database (data resets on cold starts)
  // For persistent data, set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN env vars
  if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
    // Use Turso (SQLite serverless) for persistent data
    const { createClient } = require('@libsql/client');
    const turso = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    
    // Wrap Turso client with sqlite3-like API for compatibility
    db = {
      _turso: turso,
      run: (sql, params, callback) => {
        if (typeof params === 'function') { callback = params; params = []; }
        turso.execute({ sql, args: params || [] }).then(result => {
          callback(null, { changes: result.rowsAffected, lastID: result.lastInsertRowid });
        }).catch(err => callback(err));
      },
      get: (sql, params, callback) => {
        if (typeof params === 'function') { callback = params; params = []; }
        turso.execute({ sql, args: params || [] }).then(result => {
          callback(null, result.rows[0] || null);
        }).catch(err => callback(err));
      },
      all: (sql, params, callback) => {
        if (typeof params === 'function') { callback = params; params = []; }
        turso.execute({ sql, args: params || [] }).then(result => {
          callback(null, result.rows);
        }).catch(err => callback(err));
      },
      prepare: (sql) => {
        return {
          run: (...args) => {
            const callback = args.find(a => typeof a === 'function');
            const params = args.filter(a => typeof a !== 'function');
            turso.execute({ sql, args: params }).then(result => {
              if (callback) callback(null, { changes: result.rowsAffected, lastID: result.lastInsertRowid });
            }).catch(err => { if (callback) callback(err); });
          },
          finalize: () => {}
        };
      },
      serialize: (fn) => fn(),
      _isTurso: true
    };
    console.log('✅ Conectado ao Turso (SQLite serverless)');
  } else {
    // In-memory SQLite for Vercel (no persistence between cold starts)
    db = new sqlite3.Database(':memory:');
    console.log('✅ Conectado ao SQLite em memória (Vercel)');
  }
} else {
  // Local development: use file-based SQLite
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  db = new sqlite3.Database(path.join(dataDir, 'associacao.db'), (err) => {
    if (err) console.error('Erro no banco:', err.message);
    else console.log('✅ Conectado ao SQLite (local)');
  });
}

// Enable WAL mode and foreign keys (not supported in Turso via raw SQL)
if (!db._isTurso) {
  db.run('PRAGMA journal_mode=WAL;');
  db.run('PRAGMA foreign_keys=ON;');
}

// Initialize schema
const initSchema = () => {
  db.run(`CREATE TABLE IF NOT EXISTS turmas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    professor TEXT,
    created_at TEXT DEFAULT (datetime('now','localtime'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS criancas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    turma_id INTEGER,
    nome TEXT NOT NULL,
    data_nascimento TEXT,
    sexo TEXT,
    foto TEXT,
    observacoes TEXT,
    created_at TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE SET NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS responsaveis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    crianca_id INTEGER NOT NULL,
    tipo TEXT CHECK(tipo IN ('mae','pai','outro')),
    nome TEXT NOT NULL,
    telefone TEXT,
    whatsapp TEXT,
    email TEXT,
    created_at TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (crianca_id) REFERENCES criancas(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS enderecos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    crianca_id INTEGER NOT NULL,
    cep TEXT,
    rua TEXT,
    numero TEXT,
    complemento TEXT,
    bairro TEXT,
    cidade TEXT,
    estado TEXT,
    FOREIGN KEY (crianca_id) REFERENCES criancas(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS frequencias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    crianca_id INTEGER NOT NULL,
    data TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('presente','ausente_justificada','ausente_nao_justificada')),
    motivo TEXT,
    observacao TEXT,
    created_at TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (crianca_id) REFERENCES criancas(id) ON DELETE CASCADE,
    UNIQUE(crianca_id, data)
  )`);

  db.run(`CREATE INDEX IF NOT EXISTS idx_frequencias_data ON frequencias(data)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_frequencias_crianca ON frequencias(crianca_id)`);
};

if (db._isTurso) {
  // Turso: run schema creation (async)
  const createTable = async (sql) => {
    try { await db._turso.execute({ sql }); } catch (e) { console.error('Erro schema:', e.message); }
  };
  Promise.all([
    createTable(`CREATE TABLE IF NOT EXISTS turmas (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, professor TEXT, created_at TEXT DEFAULT (datetime('now','localtime')))`),
    createTable(`CREATE TABLE IF NOT EXISTS criancas (id INTEGER PRIMARY KEY AUTOINCREMENT, turma_id INTEGER, nome TEXT NOT NULL, data_nascimento TEXT, sexo TEXT, foto TEXT, observacoes TEXT, created_at TEXT DEFAULT (datetime('now','localtime')))`),
    createTable(`CREATE TABLE IF NOT EXISTS responsaveis (id INTEGER PRIMARY KEY AUTOINCREMENT, crianca_id INTEGER NOT NULL, tipo TEXT, nome TEXT NOT NULL, telefone TEXT, whatsapp TEXT, email TEXT, created_at TEXT DEFAULT (datetime('now','localtime')))`),
    createTable(`CREATE TABLE IF NOT EXISTS enderecos (id INTEGER PRIMARY KEY AUTOINCREMENT, crianca_id INTEGER NOT NULL, cep TEXT, rua TEXT, numero TEXT, complemento TEXT, bairro TEXT, cidade TEXT, estado TEXT)`),
    createTable(`CREATE TABLE IF NOT EXISTS frequencias (id INTEGER PRIMARY KEY AUTOINCREMENT, crianca_id INTEGER NOT NULL, data TEXT NOT NULL, status TEXT NOT NULL, motivo TEXT, observacao TEXT, created_at TEXT DEFAULT (datetime('now','localtime')), UNIQUE(crianca_id, data))`),
    createTable(`CREATE INDEX IF NOT EXISTS idx_frequencias_data ON frequencias(data)`),
    createTable(`CREATE INDEX IF NOT EXISTS idx_frequencias_crianca ON frequencias(crianca_id)`),
  ]);
} else {
  db.serialize(() => initSchema());
}

module.exports = db;