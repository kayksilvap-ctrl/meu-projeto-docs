const express = require('express');
const cors = require('cors');

const turmasRouter = require('./routes/turmas');
const criancasRouter = require('./routes/criancas');
const frequenciasRouter = require('./routes/frequencias');
const db = require('./database');

const app = express();

// CORS: em produção defina CORS_ORIGIN (ex.: https://seu-projeto.vercel.app)
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Aceita as rotas com ou sem o prefixo /api (local usa /api/..., no Vercel o rewrite preserva o caminho original)
app.use((req, res, next) => {
  if (req.url === '/api' || req.url.startsWith('/api/')) {
    req.url = req.url.slice(4) || '/';
  }
  next();
});

// Proteção por token compartilhado: ativa automaticamente quando API_TOKEN existe no ambiente.
// O frontend envia o mesmo valor via VITE_API_TOKEN (header x-api-token).
app.use((req, res, next) => {
  if (!process.env.API_TOKEN || req.path === '/health') return next();
  if (req.headers['x-api-token'] === process.env.API_TOKEN) return next();
  res.status(401).json({ error: 'Token inválido ou ausente (header x-api-token)' });
});

app.use('/turmas', turmasRouter);
app.use('/criancas', criancasRouter);
app.use('/frequencias', frequenciasRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API do Sistema de Chamada funcionando!' });
});

app.get('/dashboard', (req, res) => {
  const data = req.query.data || new Date().toISOString().split('T')[0];
  db.get(`SELECT
    (SELECT COUNT(*) FROM criancas) as total_criancas,
    (SELECT COUNT(*) FROM frequencias WHERE data=? AND status='presente') as presentes,
    (SELECT COUNT(*) FROM frequencias WHERE data=? AND status='ausente_justificada') as ausentes_justificadas,
    (SELECT COUNT(*) FROM frequencias WHERE data=? AND status='ausente_nao_justificada') as ausentes_nao_justificadas
  `, [data, data, data], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    const t = (row.presentes || 0) + (row.ausentes_justificadas || 0) + (row.ausentes_nao_justificadas || 0);
    res.json({
      total_criancas: row.total_criancas || 0, presentes: row.presentes || 0,
      ausentes_justificadas: row.ausentes_justificadas || 0, ausentes_nao_justificadas: row.ausentes_nao_justificadas || 0,
      taxa_presenca: t > 0 ? Math.round((row.presentes / t) * 100) : 0, data
    });
  });
});

app.get('/export', (req, res) => {
  let t = [], c = [];
  db.serialize(() => {
    db.all('SELECT * FROM turmas ORDER BY id', [], (e, r) => { t.push(...r || []);
    db.all('SELECT * FROM criancas ORDER BY id', [], (e, r) => { c.push(...r || []);
    db.all('SELECT * FROM responsaveis ORDER BY id', [], (e, r) => { let resp = r || [];
    db.all('SELECT * FROM enderecos ORDER BY id', [], (e, r) => { let end = r || [];
    db.all('SELECT * FROM frequencias ORDER BY data,crianca_id', [], (e, r) => {
      res.json({ exportado_em: new Date().toISOString(), turmas: t, criancas: c, responsaveis: resp, enderecos: end, frequencias: r || [] });
    }); }); }); }); });
  });
});

app.post('/import', (req, res) => {
  const { turmas, criancas, responsaveis, enderecos, frequencias } = req.body;
  if (!criancas || !Array.isArray(criancas)) return res.status(400).json({ error: 'Array de criancas obrigatório' });
  let cnt = { turmas: 0, criancas: 0, frequencias: 0, erros: 0 };
  db.serialize(() => {
    db.run('PRAGMA foreign_keys=OFF');
    db.run('DELETE FROM frequencias'); db.run('DELETE FROM enderecos'); db.run('DELETE FROM responsaveis'); db.run('DELETE FROM criancas'); db.run('DELETE FROM turmas');
    if (turmas?.length) { const s = db.prepare('INSERT INTO turmas(id,nome,professor,created_at)VALUES(?,?,?,?)'); turmas.forEach(t => s.run(t.id, t.nome, t.professor || null, t.created_at || new Date().toISOString(), function (err) { if (!err) cnt.turmas++; else cnt.erros++; })); s.finalize(); }
    const s2 = db.prepare('INSERT INTO criancas(id,nome,data_nascimento,sexo,turma_id,observacoes,created_at)VALUES(?,?,?,?,?,?,?)');
    criancas.forEach(c => s2.run(c.id, c.nome, c.data_nascimento || null, c.sexo || null, c.turma_id || null, c.observacoes || null, c.created_at || new Date().toISOString(), function (err) { if (!err) cnt.criancas++; else cnt.erros++; })); s2.finalize();
    if (responsaveis?.length) { const s = db.prepare('INSERT INTO responsaveis(crianca_id,tipo,nome,telefone,whatsapp,email)VALUES(?,?,?,?,?,?)'); responsaveis.forEach(r => s.run(r.crianca_id, r.tipo || 'outro', r.nome, r.telefone || null, r.whatsapp || null, r.email || null)); s.finalize(); }
    if (enderecos?.length) { const s = db.prepare('INSERT INTO enderecos(crianca_id,cep,rua,numero,complemento,bairro,cidade,estado)VALUES(?,?,?,?,?,?,?,?)'); enderecos.forEach(e => s.run(e.crianca_id, e.cep || null, e.rua || null, e.numero || null, e.complemento || null, e.bairro || null, e.cidade || null, e.estado || null)); s.finalize(); }
    if (frequencias?.length) { const s = db.prepare('INSERT OR IGNORE INTO frequencias(crianca_id,data,status,motivo,observacao,created_at)VALUES(?,?,?,?,?,?)'); frequencias.forEach(f => s.run(f.crianca_id, f.data, f.status, f.motivo || null, f.observacao || null, f.created_at || new Date().toISOString())); s.finalize(); }
    db.run('PRAGMA foreign_keys=ON');
    res.json({ message: 'Importação concluída', ...cnt });
  });
});

app.delete('/reset', (req, res) => {
  db.serialize(() => {
    db.run('DELETE FROM frequencias'); db.run('DELETE FROM enderecos'); db.run('DELETE FROM responsaveis'); db.run('DELETE FROM criancas'); db.run('DELETE FROM turmas');
    db.run("DELETE FROM sqlite_sequence WHERE name IN ('turmas','criancas','frequencias')");
    res.json({ message: 'Todos os dados foram resetados' });
  });
});

app.get('/estatisticas', (req, res) => {
  db.all(`SELECT data,COUNT(CASE WHEN status='presente' THEN 1 END) as presentes,
    COUNT(CASE WHEN status='ausente_justificada' THEN 1 END) as ausentes_justificadas,
    COUNT(CASE WHEN status='ausente_nao_justificada' THEN 1 END) as ausentes_nao_justificadas
    FROM frequencias WHERE data>=date('now','-30 days') GROUP BY data ORDER BY data`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const tp = rows.reduce((s, r) => s + r.presentes, 0), ta = rows.reduce((s, r) => s + r.ausentes_justificadas + r.ausentes_nao_justificadas, 0);
    res.json({ dias: rows || [], total_presentes: tp, total_ausentes: ta, media_presenca: (tp + ta) > 0 ? Math.round((tp / (tp + ta)) * 100) : 0 });
  });
});

module.exports = app;
