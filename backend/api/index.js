const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const helmet = require('helmet');

const turmasRouter = require('../routes/turmas');
const criancasRouter = require('../routes/criancas');
const frequenciasRouter = require('../routes/frequencias');
const salasRouter = require('../routes/salas');
const alunosRouter = require('../routes/alunos');
const chamadaRouter = require('../routes/chamada');

const app = express();

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting (simple)
let requestCount = 0;
const MAX_REQUESTS = 1000;
setInterval(() => { requestCount = 0 }, 60000);
app.use((req, res, next) => {
  requestCount++;
  if (requestCount > MAX_REQUESTS) return res.status(429).json({ error: 'Muitas requisições. Tente novamente em 1 minuto.' });
  next();
});

// Routes
app.use('/api/turmas', turmasRouter);
app.use('/api/criancas', criancasRouter);
app.use('/api/frequencias', frequenciasRouter);
app.use('/api/salas', salasRouter);
app.use('/api/alunos', alunosRouter);
app.use('/api/chamadas', chamadaRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API do Sistema de Chamada funcionando!' });
});

// Dashboard
app.get('/api/dashboard', (req, res) => {
  const data = req.query.data || new Date().toISOString().split('T')[0];
  const db = require('../database');
  db.get(`SELECT
    (SELECT COUNT(*) FROM criancas) as total_criancas,
    (SELECT COUNT(*) FROM frequencias WHERE data = ? AND status = 'presente') as presentes,
    (SELECT COUNT(*) FROM frequencias WHERE data = ? AND status = 'ausente_justificada') as ausentes_justificadas,
    (SELECT COUNT(*) FROM frequencias WHERE data = ? AND status = 'ausente_nao_justificada') as ausentes_nao_justificadas
  `, [data, data, data], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    const total_registrados = (row.presentes||0) + (row.ausentes_justificadas||0) + (row.ausentes_nao_justificadas||0);
    res.json({
      total_criancas: row.total_criancas || 0,
      presentes: row.presentes || 0,
      ausentes_justificadas: row.ausentes_justificadas || 0,
      ausentes_nao_justificadas: row.ausentes_nao_justificadas || 0,
      taxa_presenca: total_registrados > 0 ? Math.round((row.presentes / total_registrados) * 100) : 0,
      data
    });
  });
});

// Export
app.get('/api/export', (req, res) => {
  const db = require('../database');
  db.all('SELECT * FROM turmas ORDER BY id', [], (err, turmas) => {
    if (err) return res.status(500).json({ error: err.message });
    db.all('SELECT * FROM criancas ORDER BY id', [], (err, criancas) => {
      if (err) return res.status(500).json({ error: err.message });
      db.all('SELECT * FROM responsaveis ORDER BY id', [], (err, responsaveis) => {
        db.all('SELECT * FROM enderecos ORDER BY id', [], (err, enderecos) => {
          db.all('SELECT * FROM frequencias ORDER BY data, crianca_id', [], (err, frequencias) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({
              exportado_em: new Date().toISOString(),
              turmas: turmas || [],
              criancas: criancas || [],
              responsaveis: responsaveis || [],
              enderecos: enderecos || [],
              frequencias: frequencias || []
            });
          });
        });
      });
    });
  });
});

app.post('/api/import', (req, res) => {
  const db = require('../database');
  const { turmas, criancas, responsaveis, enderecos, frequencias } = req.body;
  if (!criancas || !Array.isArray(criancas)) {
    return res.status(400).json({ error: 'Formato inválido. Array de criancas obrigatório.' });
  }

  let count = { turmas: 0, criancas: 0, frequencias: 0, erros: 0 };

  db.run('PRAGMA foreign_keys=OFF');
  db.run('DELETE FROM frequencias');
  db.run('DELETE FROM enderecos');
  db.run('DELETE FROM responsaveis');
  db.run('DELETE FROM criancas');
  db.run('DELETE FROM turmas');

  if (turmas && Array.isArray(turmas)) {
    const tStmt = db.prepare('INSERT INTO turmas (id, nome, professor, created_at) VALUES (?,?,?,?)');
    turmas.forEach(t => tStmt.run(t.id, t.nome, t.professor||null, t.created_at||null, function(err) { if (!err) count.turmas++; else count.erros++; }));
    tStmt.finalize();
  }

  const cStmt = db.prepare('INSERT INTO criancas (id, nome, data_nascimento, sexo, turma_id, observacoes, created_at) VALUES (?,?,?,?,?,?,?)');
  criancas.forEach(c => cStmt.run(c.id, c.nome, c.data_nascimento||null, c.sexo||null, c.turma_id||null, c.observacoes||null, c.created_at||null, function(err) { if (!err) count.criancas++; else count.erros++; }));
  cStmt.finalize();

  if (responsaveis && Array.isArray(responsaveis)) {
    const rStmt = db.prepare('INSERT INTO responsaveis (crianca_id, tipo, nome, telefone, whatsapp, email) VALUES (?,?,?,?,?,?)');
    responsaveis.forEach(r => rStmt.run(r.crianca_id, r.tipo||'outro', r.nome, r.telefone||null, r.whatsapp||null, r.email||null));
    rStmt.finalize();
  }

  if (enderecos && Array.isArray(enderecos)) {
    const eStmt = db.prepare('INSERT INTO enderecos (crianca_id, cep, rua, numero, complemento, bairro, cidade, estado) VALUES (?,?,?,?,?,?,?,?)');
    enderecos.forEach(e => eStmt.run(e.crianca_id, e.cep||null, e.rua||null, e.numero||null, e.complemento||null, e.bairro||null, e.cidade||null, e.estado||null));
    eStmt.finalize();
  }

  if (frequencias && Array.isArray(frequencias)) {
    const fStmt = db.prepare('INSERT OR IGNORE INTO frequencias (crianca_id, data, status, motivo, observacao, created_at) VALUES (?,?,?,?,?,?)');
    frequencias.forEach(f => fStmt.run(f.crianca_id, f.data, f.status, f.motivo||null, f.observacao||null, f.created_at||null));
    fStmt.finalize();
  }

  db.run('PRAGMA foreign_keys=ON');
  res.json({ message: 'Importação concluída', ...count });
});

app.delete('/api/reset', (req, res) => {
  const db = require('../database');
  db.run('DELETE FROM frequencias');
  db.run('DELETE FROM enderecos');
  db.run('DELETE FROM responsaveis');
  db.run('DELETE FROM criancas');
  db.run('DELETE FROM turmas');
  db.run("DELETE FROM sqlite_sequence WHERE name IN ('turmas','criancas','frequencias')");
  res.json({ message: 'Todos os dados foram resetados' });
});

// Estatisticas
app.get('/api/estatisticas', (req, res) => {
  const db = require('../database');
  db.all(`
    SELECT f.data,
      COUNT(CASE WHEN f.status = 'presente' THEN 1 END) as presentes,
      COUNT(CASE WHEN f.status = 'ausente_justificada' THEN 1 END) as ausentes_justificadas,
      COUNT(CASE WHEN f.status = 'ausente_nao_justificada' THEN 1 END) as ausentes_nao_justificadas
    FROM frequencias f
    WHERE f.data >= date('now', '-30 days')
    GROUP BY f.data ORDER BY f.data
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const totalP = rows.reduce((s, r) => s + r.presentes, 0);
    const totalA = rows.reduce((s, r) => s + r.ausentes_justificadas + r.ausentes_nao_justificadas, 0);
    const total = totalP + totalA;
    res.json({
      dias: rows || [],
      total_presentes: totalP,
      total_ausentes: totalA,
      media_presenca: total > 0 ? Math.round((totalP / total) * 100) : 0
    });
  });
});

// Sanitize helper
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' });
  next(err);
});

exports.handler = serverless(app);