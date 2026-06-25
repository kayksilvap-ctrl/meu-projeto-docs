const path = require('path');
const fs = require('fs');

// Carrega .env local se existir (apenas fora do Vercel)
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    lines.forEach(line => {
      const [key, ...vals] = line.trim().split('=');
      if (key && vals.length && !process.env[key]) {
        process.env[key] = vals.join('=');
      }
    });
  }
} catch (_) {}

// Ordem de escolha: Turso (produção/Vercel) > better-sqlite3 (síncrono) > sqlite3 (fallback local)
let BetterDatabase;

try {
  BetterDatabase = require('better-sqlite3');
} catch (e) {
  // better-sqlite3 not available
}

const isVercel = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME;
const useTurso = !!process.env.TURSO_DATABASE_URL && !!process.env.TURSO_AUTH_TOKEN;

// Schema definitions
const SCHEMA_SQL = [
  `CREATE TABLE IF NOT EXISTS turmas (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, professor TEXT, created_at TEXT DEFAULT (datetime('now','localtime')))`,
  `CREATE TABLE IF NOT EXISTS criancas (id INTEGER PRIMARY KEY AUTOINCREMENT, turma_id INTEGER, nome TEXT NOT NULL, data_nascimento TEXT, sexo TEXT, foto TEXT, observacoes TEXT, created_at TEXT DEFAULT (datetime('now','localtime')))`,
  `CREATE TABLE IF NOT EXISTS responsaveis (id INTEGER PRIMARY KEY AUTOINCREMENT, crianca_id INTEGER NOT NULL, tipo TEXT, nome TEXT NOT NULL, telefone TEXT, whatsapp TEXT, email TEXT, created_at TEXT DEFAULT (datetime('now','localtime')))`,
  `CREATE TABLE IF NOT EXISTS enderecos (id INTEGER PRIMARY KEY AUTOINCREMENT, crianca_id INTEGER NOT NULL, cep TEXT, rua TEXT, numero TEXT, complemento TEXT, bairro TEXT, cidade TEXT, estado TEXT)`,
  `CREATE TABLE IF NOT EXISTS frequencias (id INTEGER PRIMARY KEY AUTOINCREMENT, crianca_id INTEGER NOT NULL, data TEXT NOT NULL, status TEXT NOT NULL, motivo TEXT, observacao TEXT, created_at TEXT DEFAULT (datetime('now','localtime')), UNIQUE(crianca_id, data))`,
  `CREATE INDEX IF NOT EXISTS idx_frequencias_data ON frequencias(data)`,
  `CREATE INDEX IF NOT EXISTS idx_frequencias_crianca ON frequencias(crianca_id)`,
  `CREATE INDEX IF NOT EXISTS idx_frequencias_data_status ON frequencias(data,status)`,
  `CREATE INDEX IF NOT EXISTS idx_criancas_turma ON criancas(turma_id)`,
  `CREATE INDEX IF NOT EXISTS idx_responsaveis_crianca ON responsaveis(crianca_id)`,
  `CREATE INDEX IF NOT EXISTS idx_enderecos_crianca ON enderecos(crianca_id)`,
];

module.exports = createDatabase();

function createDatabase() {
  // ===== TURSO (Vercel production - persistent) =====
  // Defensivo: URL/token inválidos no painel NÃO podem derrubar a função no carregamento
  if (useTurso) try {
    const { createClient } = require('@libsql/client');
    const turso = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    // Init schema async — guardamos a Promise REAL para poder aguardá-la antes dos primeiros writes.
    // Antes era fire-and-forget e ready() devolvia Promise.resolve() (falso), o que permitia
    // INSERT antes do CREATE TABLE terminar ("no such table" intermitente no cold start).
    const schemaReady = Promise.all(
      SCHEMA_SQL.map(sql => turso.execute({ sql }))
    )
      .then(() => { console.log('✅ Schema (Turso)'); return true; })
      .catch(err => { console.error('⚠ Falha ao criar schema no Turso:', err.message); return false; });

    return {
      _turso: turso,
      mode: 'turso',
      persistent: true,
      run: (sql, params, callback) => {
        if (typeof params === 'function') { callback = params; params = []; }
        turso.execute({ sql, args: params || [] })
          .then(r => {
            const info = { changes: r.rowsAffected, lastID: Number(r.lastInsertRowid) };
            // callback com this = info, p/ suportar o padrão sqlite3 "function(err){ this.lastID }"
            callback && callback.call(info, null, info);
          })
          .catch(err => callback && callback(err));
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
            .then(r => {
              const info = { changes: r.rowsAffected, lastID: Number(r.lastInsertRowid) };
              cb && cb.call(info, null, info);
            })
            .catch(err => cb && cb(err));
        },
        finalize: () => {}
      }),
      serialize: (fn) => fn(),
      ready: () => schemaReady,
    };
  } catch (e) {
    console.error('⚠ Turso inválido (' + e.message + ') — confira TURSO_DATABASE_URL/TURSO_AUTH_TOKEN no painel do Vercel; usando o próximo modo de banco.');
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
    if (isVercel) console.warn('⚠ MODO VOLÁTIL (:memory:) — os dados SOMEM no cold start. Configure TURSO_DATABASE_URL/TURSO_AUTH_TOKEN no Vercel para persistir.');

    // Create sync wrapper that stays in-memory
    return {
      // isVercel -> ':memory:' (volátil); local -> arquivo no disco (persistente)
      mode: isVercel ? 'memoria' : 'sqlite',
      persistent: !isVercel,
      run: (sql, params, callback) => {
        if (typeof params === 'function') { callback = params; params = []; }
        try {
          const stmt = _db.prepare(sql);
          const result = params && params.length ? stmt.run(...params) : stmt.run();
          const info = { changes: result.changes, lastID: Number(result.lastInsertRowid) };
          callback && callback.call(info, null, info);
        } catch (err) { callback && callback(err); }
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
              const info = { changes: r.changes, lastID: Number(r.lastInsertRowid) };
              cb && cb.call(info, null, info);
            } catch (err) { cb && cb(err); }
          },
          finalize: () => {}
        };
      },
      serialize: (fn) => fn(),
      ready: () => Promise.resolve(),
    };
  }

  // ===== Sem banco utilizável no Vercel: stub que responde erro claro (NUNCA derrubar a função) =====
  if (isVercel) {
    const err = new Error(
      'Banco não configurado: defina TURSO_DATABASE_URL e TURSO_AUTH_TOKEN no Vercel (crie grátis em turso.tech). ' +
      'Sem isso a API não tem onde gravar os dados.'
    );
    console.error('⚠ ' + err.message);
    const fail = (...args) => { const cb = args.find(a => typeof a === 'function'); if (cb) cb(err); };
    return {
      mode: 'no-db',
      persistent: false,
      run: fail, get: fail, all: fail,
      prepare: () => ({ run: fail, finalize: () => {} }),
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
    mode: 'sqlite',
    persistent: true,
    run: (sql, params, callback) => {
      if (typeof params === 'function') { callback = params; params = []; }
      _db.run(sql, params || [], function (err) {
        // this aqui é o Statement do sqlite3 (tem lastID/changes) — repassa como contexto
        callback && callback.call(this, err, { changes: this && this.changes, lastID: this && this.lastID });
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
          stmt.run(p || [], function (err) {
            cb && cb.call(this, err, { changes: this && this.changes, lastID: this && this.lastID });
          });
        },
        finalize: () => stmt.finalize()
      };
    },
    serialize: (fn) => _db.serialize(fn),
    ready: () => Promise.resolve(),
  };
}