const path = require('path');
const fs = require('fs');

// Try better-sqlite3 (synchronous, works in Lambda), fallback to sql.js (pure JS)
let BetterDatabase, initSqlJs;

try {
  BetterDatabase = require('better-sqlite3');
} catch (e) {
  // better-sqlite3 not available
}

try {
  initSqlJs = require('sql.js');
} catch (e) {
  // sql.js not available  
}

const isVercel = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME;
const useTurso = isVercel && process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN;

// Schema definitions
const SCHEMA_SQL = [
  `CREATE TABLE IF NOT EXISTS turmas (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, professor TEXT, created_at TEXT DEFAULT (datetime('now','localtime')))`,
  `CREATE TABLE IF NOT EXISTS criancas (id INTEGER PRIMARY KEY AUTOINCREMENT, turma_id INTEGER, nome TEXT NOT NULL, data_nascimento TEXT, sexo TEXT, foto TEXT, observacoes TEXT, created_at TEXT DEFAULT (datetime('now','localtime')))`,
  `CREATE TABLE IF NOT EXISTS responsaveis (id INTEGER PRIMARY KEY AUTOINCREMENT, crianca_id INTEGER NOT NULL, tipo TEXT, nome TEXT NOT NULL, telefone TEXT, whatsapp TEXT, email TEXT, created_at TEXT DEFAULT (datetime('now','localtime')))`,
  `CREATE TABLE IF NOT EXISTS enderecos (id INTEGER PRIMARY KEY AUTOINCREMENT, crianca_id INTEGER NOT NULL, cep TEXT, rua TEXT, numero TEXT, complemento TEXT, bairro TEXT, cidade TEXT, estado TEXT)`,
  `CREATE TABLE IF NOT EXISTS frequencias (id INTEGER PRIMARY KEY AUTOINCREMENT, crianca_id INTEGER NOT NULL, data TEXT NOT NULL, status TEXT NOT NULL, motivo TEXT, observacao TEXT, created_at TEXT DEFAULT (datetime('now','localtime')), UNIQUE(crianca_id, data))`,
  `CREATE INDEX IF NOT EXISTS idx_frequencias_data ON frequencias(data)`,
  `CREATE INDEX IF NOT EXISTS idx_frequencias_crianca ON frequencias(crianca_id)`,
];

module.exports = createDatabase();

function createDatabase() {
  // ===== TURSO (Vercel production - persistent) =====
  if (useTurso) {
    const { createClient } = require('@libsql/client');
    const turso = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    // Init schema async
    Promise.all(SCHEMA_SQL.map(sql => turso.execute({ sql }).catch(() => {})))
      .then(() => console.log('✅ Schema (Turso)'))
      .catch(() => {});

    return {
      _turso: turso,
      run: (sql, params, callback) => {
        if (typeof params === 'function') { callback = params; params = []; }
        turso.execute({ sql, args: params || [] })
          .then(r => callback(null, { changes: r.rowsAffected, lastID: r.lastInsertRowid }))
          .catch(err => callback(err));
      },
      get: (sql, params, callback) => {
        if (typeof params === 'function') { callback = params; params = []; }
        turso.execute({ sql, args: params || [] })
          .then(r => callback(null, r.rows[0] || null))
          .catch(err => callback(err));
      },
      all: (sql, params, callback) => {
        if (typeof params === 'function') { callback = params; params = []; }
        turso.execute({ sql, args: params || [] })
          .then(r => callback(null, r.rows))
          .catch(err => callback(err));
      },
      prepare: (sql) => ({
        run: (...args) => {
          const cb = args.find(a => typeof a === 'function');
          const p = args.filter(a => typeof a !== 'function');
          turso.execute({ sql, args: p || [] })
            .then(r => cb && cb(null, { changes: r.rowsAffected, lastID: r.lastInsertRowid }))
            .catch(err => cb && cb(err));
        },
        finalize: () => {}
      }),
      serialize: (fn) => fn(),
      ready: () => Promise.resolve(),
    };
  }

  // ===== BETTER-SQLITE3 (local + Vercel fallback) =====
  // Synchronous, fast, no callback wrapping issues
  let _db;

  if (BetterDatabase) {
    // Use better-sqlite3
    if (isVercel) {
      _db = new BetterDatabase(':memory:');
    } else {
      const dataDir = path.join(__dirname, 'data');
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
      _db = new BetterDatabase(path.join(dataDir, 'associacao.db'));
      _db.pragma('journal_mode = WAL');
      _db.pragma('foreign_keys = ON');
    }

    // Init schema synchronously
    _db.exec('BEGIN TRANSACTION');
    SCHEMA_SQL.forEach(sql => { try { _db.exec(sql); } catch(e) {} });
    _db.exec('COMMIT');

    console.log('✅ Conectado ao better-sqlite3 (' + (isVercel ? 'Vercel' : 'local') + ')');

    // Create sync wrapper that stays in-memory
    return {
      run: (sql, params, callback) => {
        if (typeof params === 'function') { callback = params; params = []; }
        try {
          const stmt = _db.prepare(sql);
          const result = params && params.length ? stmt.run(...params) : stmt.run();
          callback(null, { changes: result.changes, lastID: Number(result.lastInsertRowid) });
        } catch (err) { callback(err); }
      },
      get: (sql, params, callback) => {
        if (typeof params === 'function') { callback = params; params = []; }
        try {
          const stmt = _db.prepare(sql);
          callback(null, params && params.length ? stmt.get(...params) : stmt.get() || null);
        } catch (err) { callback(err); }
      },
      all: (sql, params, callback) => {
        if (typeof params === 'function') { callback = params; params = []; }
        try {
          const stmt = _db.prepare(sql);
          callback(null, params && params.length ? stmt.all(...params) : stmt.all());
        } catch (err) { callback(err); }
      },
      prepare: (sql) => {
        const stmt = _db.prepare(sql);
        return {
          run: (...args) => {
            const cb = args.find(a => typeof a === 'function');
            const p = args.filter(a => typeof a !== 'function');
            try {
              const r = p.length ? stmt.run(...p) : stmt.run();
              cb && cb(null, { changes: r.changes, lastID: Number(r.lastInsertRowid) });
            } catch (err) { cb && cb(err); }
          },
          finalize: () => {}
        };
      },
      serialize: (fn) => fn(),
      ready: () => Promise.resolve(),
    };
  }

  // ===== SQL.JS (pure JS - Vercel fallback if better-sqlite3 unavailable) =====
  if (initSqlJs && isVercel) {
    // sql.js is async, but we'll handle it at the API level
    const SQL = initSqlJs();
    _db = new SQL.Database();

    SCHEMA_SQL.forEach(sql => { try { _db.run(sql); } catch(e) {} });
    console.log('✅ Conectado ao sql.js (Vercel - pure JS)');

    return {
      _db: _db,
      run: (sql, params, callback) => {
        if (typeof params === 'function') { callback = params; params = []; }
        try {
          _db.run(sql, params || []);
          const r = _db.exec("SELECT last_insert_rowid()");
          const lastID = r?.[0]?.values?.[0]?.[0] || 0;
          callback(null, { changes: _db.getRowsModified(), lastID: Number(lastID) });
        } catch (err) { callback(err); }
      },
      get: (sql, params, callback) => {
        if (typeof params === 'function') { callback = params; params = []; }
        try {
          const stmt = _db.prepare(sql);
          if (params) stmt.bind(params);
          const row = stmt.step() ? stmt.getAsObject() : null;
          stmt.free();
          callback(null, row);
        } catch (err) { callback(err); }
      },
      all: (sql, params, callback) => {
        if (typeof params === 'function') { callback = params; params = []; }
        try {
          let rows;
          if (params) {
            const stmt = _db.prepare(sql);
            stmt.bind(params);
            rows = [];
            while (stmt.step()) rows.push(stmt.getAsObject());
            stmt.free();
          } else {
            const r = _db.exec(sql);
            if (r.length > 0) {
              const cols = r[0].columns;
              rows = r[0].values.map(row => {
                const o = {};
                cols.forEach((c, i) => o[c] = row[i]);
                return o;
              });
            } else { rows = []; }
          }
          callback(null, rows);
        } catch (err) { callback(err); }
      },
      prepare: (sql) => {
        let stmt; try { stmt = _db.prepare(sql); } catch(e) {}
        return {
          run: (...args) => {
            const cb = args.find(a => typeof a === 'function');
            const p = args.filter(a => typeof a !== 'function');
            try {
              if (stmt) {
                if (p.length) stmt.bind(p);
                stmt.step(); stmt.reset();
              }
              const r = _db.exec("SELECT last_insert_rowid()");
              cb && cb(null, { changes: _db.getRowsModified(), lastID: Number(r?.[0]?.values?.[0]?.[0] || 0) });
            } catch (err) { cb && cb(err); }
          },
          finalize: () => { if (stmt) stmt.free(); }
        };
      },
      serialize: (fn) => fn(),
      ready: () => Promise.resolve(),
    };
  }

  // ===== SQLITE3 (last resort fallback - local only) =====
  const sqlite3 = require('sqlite3').verbose();
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  _db = new sqlite3.Database(path.join(dataDir, 'associacao.db'));
  _db.serialize(() => {
    _db.run('PRAGMA journal_mode=WAL;');
    _db.run('PRAGMA foreign_keys=ON;');
    SCHEMA_SQL.forEach(sql => _db.run(sql));
  });
  console.log('✅ Conectado ao SQLite (fallback)');

  return {
    run: (...args) => {
      const cb = args.find(a => typeof a === 'function');
      const params = args.filter(a => typeof a !== 'function');
      const sql = typeof args[0] === 'string' ? args[0] : args[1];
      _db.run(sql, params.length ? params : [], function(err) {
        cb && cb(err, { changes: this?.changes, lastID: this?.lastID });
      });
    },
    get: (sql, params, callback) => {
      if (typeof params === 'function') { callback = params; params = []; }
      _db.get(sql, params || [], callback);
    },
    all: (sql, params, callback) => {
      if (typeof params === 'function') { callback = params; params = []; }
      _db.all(sql, params || [], callback);
    },
    prepare: (sql) => {
      const stmt = _db.prepare(sql);
      return {
        run: (...args) => {
          const cb = args.find(a => typeof a === 'function');
          const p = args.filter(a => typeof a !== 'function');
          stmt.run(p || [], function(err) { cb && cb(err, { changes: this?.changes, lastID: this?.lastID }); });
        },
        finalize: () => stmt.finalize()
      };
    },
    serialize: (fn) => _db.serialize(fn),
    ready: () => Promise.resolve(),
  };
}