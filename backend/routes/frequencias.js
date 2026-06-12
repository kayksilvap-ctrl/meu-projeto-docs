const express = require('express');
const router = express.Router();
const db = require('../database');

// GET / - Listar frequencias com dados da crianca
router.get('/', (req, res) => {
  const { data, turma_id, crianca_id } = req.query;

  let query = `
    SELECT f.*, c.nome as crianca_nome, c.turma_id, t.nome as turma_nome
    FROM frequencias f
    JOIN criancas c ON f.crianca_id = c.id
    LEFT JOIN turmas t ON c.turma_id = t.id
  `;
  let params = [];
  const where = [];

  if (data) { where.push('f.data = ?'); params.push(data); }
  if (turma_id) { where.push('c.turma_id = ?'); params.push(turma_id); }
  if (crianca_id) { where.push('f.crianca_id = ?'); params.push(crianca_id); }
  if (where.length) query += ' WHERE ' + where.join(' AND ');
  query += ' ORDER BY c.nome';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST / - Registrar frequencia (upsert)
router.post('/', (req, res) => {
  const { crianca_id, data, status, motivo, observacao } = req.body;
  if (!crianca_id || !data || !status) {
    return res.status(400).json({ error: 'crianca_id, data e status obrigatórios' });
  }
  if (!['presente','ausente_justificada','ausente_nao_justificada'].includes(status)) {
    return res.status(400).json({ error: 'Status inválido' });
  }

  const stmt = db.prepare(
    `INSERT OR REPLACE INTO frequencias (crianca_id, data, status, motivo, observacao, created_at)
     VALUES (?, ?, ?, ?, ?, datetime('now','localtime'))`
  );
  stmt.run(crianca_id, data, status, motivo||null, observacao||null, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Registrado', id: this.lastID });
  });
  stmt.finalize();
});

// GET /dashboard - KPIs
router.get('/dashboard', (req, res) => {
  const { data, turma_id } = req.query;
  const dataFilter = data || new Date().toISOString().split('T')[0];

  let criancaFilter = '';
  let params = [dataFilter];
  if (turma_id) { criancaFilter = ' AND c.turma_id = ?'; params.push(turma_id); }

  db.get(`
    SELECT
      (SELECT COUNT(*) FROM criancas c ${turma_id ? 'WHERE c.turma_id = ?' : ''}) as total_criancas,
      (SELECT COUNT(*) FROM frequencias f JOIN criancas c ON f.crianca_id = c.id WHERE f.data = ? AND f.status = 'presente' ${criancaFilter}) as presentes,
      (SELECT COUNT(*) FROM frequencias f JOIN criancas c ON f.crianca_id = c.id WHERE f.data = ? AND f.status = 'ausente_justificada' ${criancaFilter}) as ausentes_justificadas,
      (SELECT COUNT(*) FROM frequencias f JOIN criancas c ON f.crianca_id = c.id WHERE f.data = ? AND f.status = 'ausente_nao_justificada' ${criancaFilter}) as ausentes_nao_justificadas
  `, turma_id ? [turma_id, dataFilter, dataFilter, dataFilter, dataFilter] : [dataFilter, dataFilter, dataFilter, dataFilter], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    const total_registrados = row.presentes + row.ausentes_justificadas + row.ausentes_nao_justificadas;
    const taxa = total_registrados > 0 ? Math.round((row.presentes / total_registrados) * 100) : 0;

    res.json({
      total_criancas: row.total_criancas || 0,
      presentes: row.presentes || 0,
      ausentes_justificadas: row.ausentes_justificadas || 0,
      ausentes_nao_justificadas: row.ausentes_nao_justificadas || 0,
      taxa_presenca: taxa,
      data: dataFilter
    });
  });
});

// GET /relatorios - Dados para gráficos (últimos 30 dias)
router.get('/relatorios', (req, res) => {
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

    // Totais agrupados por turma
    db.all(`
      SELECT t.nome, t.id,
        COUNT(CASE WHEN f.status = 'presente' THEN 1 END) as presentes,
        COUNT(CASE WHEN f.status != 'presente' THEN 1 END) as faltas
      FROM frequencias f
      JOIN criancas c ON f.crianca_id = c.id
      JOIN turmas t ON c.turma_id = t.id
      WHERE f.data >= date('now', '-30 days')
      GROUP BY t.id
    `, [], (err2, turmas) => {
      res.json({ dias: rows || [], turmas: turmas || [] });
    });
  });
});

// GET /resumo - Acumulado por crianca (presencas, faltas justificadas/nao justificadas + contatos)
router.get('/resumo', (req, res) => {
  const { turma_id, de, ate } = req.query;

  let query = `
    SELECT c.id, c.nome as crianca_nome, c.turma_id, t.nome as turma_nome,
      COUNT(CASE WHEN f.status = 'presente' THEN 1 END) as presencas,
      COUNT(CASE WHEN f.status = 'ausente_justificada' THEN 1 END) as faltas_justificadas,
      COUNT(CASE WHEN f.status = 'ausente_nao_justificada' THEN 1 END) as faltas_nao_justificadas,
      COUNT(f.id) as total_chamadas
    FROM criancas c
    LEFT JOIN turmas t ON c.turma_id = t.id
    LEFT JOIN frequencias f ON f.crianca_id = c.id`;
  const params = [];
  if (de)  { query += ' AND f.data >= ?'; params.push(de); }
  if (ate) { query += ' AND f.data <= ?'; params.push(ate); }
  if (turma_id) { query += ' WHERE c.turma_id = ?'; params.push(turma_id); }
  query += ' GROUP BY c.id ORDER BY t.nome, c.nome';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const criancas = rows || [];
    if (!criancas.length) return res.json([]);

    const ids = criancas.map(r => r.id);
    const ph = ids.map(() => '?').join(',');
    db.all(`SELECT crianca_id, tipo, nome, telefone, whatsapp, email FROM responsaveis WHERE crianca_id IN (${ph})`, ids, (err2, responsaveis) => {
      if (err2) return res.status(500).json({ error: err2.message });
      db.all(`SELECT crianca_id, cep, rua, numero, complemento, bairro, cidade, estado FROM enderecos WHERE crianca_id IN (${ph})`, ids, (err3, enderecos) => {
        if (err3) return res.status(500).json({ error: err3.message });
        const respMap = {};
        (responsaveis || []).forEach(r => { (respMap[r.crianca_id] = respMap[r.crianca_id] || []).push({ tipo: r.tipo, nome: r.nome, telefone: r.telefone, whatsapp: r.whatsapp, email: r.email }); });
        const endMap = {};
        (enderecos || []).forEach(e => { endMap[e.crianca_id] = { cep: e.cep, rua: e.rua, numero: e.numero, complemento: e.complemento, bairro: e.bairro, cidade: e.cidade, estado: e.estado }; });
        res.json(criancas.map(c => ({
          id: c.id,
          nome: c.crianca_nome,
          turma_id: c.turma_id,
          turma_nome: c.turma_nome || 'Sem turma',
          presencas: c.presencas || 0,
          faltas_justificadas: c.faltas_justificadas || 0,
          faltas_nao_justificadas: c.faltas_nao_justificadas || 0,
          total_chamadas: c.total_chamadas || 0,
          pct_presenca: c.total_chamadas > 0 ? Math.round((c.presencas / c.total_chamadas) * 100) : null,
          responsaveis: respMap[c.id] || [],
          endereco: endMap[c.id] || null
        })));
      });
    });
  });
});

module.exports = router;