const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'associacao.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('✅ Conectado ao SQLite:', dbPath);
  }
});

// Ativar WAL mode e foreign keys
db.run('PRAGMA journal_mode=WAL;');
db.run('PRAGMA foreign_keys=ON;');

// Criar tabelas
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS alunos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      idade INTEGER,
      responsavel TEXT,
      endereco TEXT,
      telefone TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS chamadas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      aluno_id INTEGER NOT NULL,
      data TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('presente', 'ausente')),
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
      UNIQUE(aluno_id, data)
    )
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_chamadas_data ON chamadas(data)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_chamadas_aluno ON chamadas(aluno_id)
  `);
});

module.exports = db;