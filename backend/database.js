const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new sqlite3.Database(path.join(dataDir, 'associacao.db'), (err) => {
  if (err) console.error('Erro no banco:', err.message);
  else console.log('✅ Conectado ao SQLite');
});

db.run('PRAGMA journal_mode=WAL;');
db.run('PRAGMA foreign_keys=ON;');

db.serialize(() => {
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
});

module.exports = db;