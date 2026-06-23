const express = require('express');
const router = express.Router();
const db = require('../database');

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

router.post('/', (req, res) => {
  const { crianca_id, data, status, motivo, observacao } = req.body;
  if (!crianca_id || !data || !status) {
    return res.status(400).json({ error: 'crianca_id, data e status obrigatórios' });
  }
  if (!['presente','ausente_justificada','ausente_nao_justificada'].includes(status)) {
    return res.status(400).json({ error: 'Status inválido' });
  }

  db.run(
    `INSERT OR REPLACE INTO frequencias (crianca_id, data, status, motivo, observacao, created_at)
     VALUES (?, ?, ?, ?, ?, datetime('now','localtime'))`,
    [crianca_id, data, status, motivo||null, observacao||null],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Registrado', id: this.lastID });
    });
});

router.get('/dashboard', (req, res) => {
  const { data, turma_id } = req.query;
  const dataFilter = data || new Date().toISOString().split('T')[0];

  // Fragmentos de filtro por turma (presentes só quando turma_id é enviado)
  const turmaCount = turma_id ? 'WHERE c.turma_id = ?' : '';
  const turmaWhere = turma_id ? ' AND c.turma_id = ?' : '';

  // Os parâmetros precisam seguir EXATAMENTE a ordem em que os ? aparecem na query.
  // Antes havia descasamento (3 ou 7 placeholders contra 4/5 valores) -> Turso devolvia
  // "Too many parameter values were provided" e a tela inicial quebrava.
  const params = [];
  if (turma_id) params.push(turma_id);                            // total_criancas
  params.push(dataFilter); if (turma_id) params.push(turma_id);   // presentes
  params.push(dataFilter); if (turma_id) params.push(turma_id);   // ausentes_justificadas
  params.push(dataFilter); if (turma_id) params.push(turma_id);   // ausentes_nao_justificadas

  db.get(`
    SELECT
      (SELECT COUNT(*) FROM criancas c ${turmaCount}) as total_criancas,
      (SELECT COUNT(*) FROM frequencias f JOIN criancas c ON f.crianca_id = c.id WHERE f.data = ? AND f.status = 'presente' ${turmaWhere}) as presentes,
      (SELECT COUNT(*) FROM frequencias f JOIN criancas c ON f.crianca_id = c.id WHERE f.data = ? AND f.status = 'ausente_justificada' ${turmaWhere}) as ausentes_justificadas,
      (SELECT COUNT(*) FROM frequencias f JOIN criancas c ON f.crianca_id = c.id WHERE f.data = ? AND f.status = 'ausente_nao_justificada' ${turmaWhere}) as ausentes_nao_justificadas
  `, params, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    const r = row || {};
    const presentes = r.presentes || 0;
    const total_registrados = presentes + (r.ausentes_justificadas || 0) + (r.ausentes_nao_justificadas || 0);
    const taxa = total_registrados > 0 ? Math.round((presentes / total_registrados) * 100) : 0;

    res.json({
      total_criancas: r.total_criancas || 0,
      presentes: presentes,
      ausentes_justificadas: r.ausentes_justificadas || 0,
      ausentes_nao_justificadas: r.ausentes_nao_justificadas || 0,
      taxa_presenca: taxa,
      data: dataFilter
    });
  });
});

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

// ===== ENDPOINT BATCH (salvamento instantâneo) =====
// Salva múltiplas frequências em uma ÚNICA transação.
// Suporta 3 modos:
//   better-sqlite3 -> transação síncrona (< 1ms para 30 inserts)
//   Turso          -> transação assíncrona com BEGIN/COMMIT
//   sqlite3        -> transação com serialize()
// Antes o frontend fazia 1 request por criança = 30 requests para 30 alunos.
router.post('/batch', (req, res) => {
  const { registros } = req.body;
  if (!registros || !Array.isArray(registros) || !registros.length) {
    return res.status(400).json({ error: 'Array de registros obrigatório' });
  }

  // Valida todos antes de começar
  for (const r of registros) {
    if (!r.crianca_id || !r.data || !r.status) {
      return res.status(400).json({ error: 'crianca_id, data e status obrigatórios em todos os registros' });
    }
    if (!['presente','ausente_justificada','ausente_nao_justificada'].includes(r.status)) {
      return res.status(400).json({ error: `Status inválido para criança ${r.crianca_id}: ${r.status}` });
    }
  }

  const SQL = `INSERT OR REPLACE INTO frequencias (crianca_id, data, status, motivo, observacao, created_at)
               VALUES (?, ?, ?, ?, ?, datetime('now','localtime'))`;

  // ===== 1) better-sqlite3 via db.mode ====
  // mode 'sqlite' = local com better-sqlite3 (ou sqlite3)
  // mode 'memoria' = Vercel sem Turso (volátil)
  // Ambos usam db.run/get/all que são síncronos
  if (db.mode === 'sqlite' || db.mode === 'memoria') {
    db.serialize(() => {
      try {
        db.run('BEGIN TRANSACTION');
        const stmt = db.prepare(SQL);
        registros.forEach(r => {
          stmt.run(r.crianca_id, r.data, r.status, r.motivo || null, r.observacao || null);
        });
        stmt.finalize();
        db.run('COMMIT');
        res.json({ message: `${registros.length} registros salvos` });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
    return;
  }

  // ===== 2) Turso (assíncrono) — transação via BEGIN/COMMIT =====
  if (db.mode === 'turso' && db._turso) {
    (async () => {
      try {
        await db._turso.execute({ sql: 'BEGIN TRANSACTION' });
        for (const r of registros) {
          await db._turso.execute({
            sql: SQL,
            args: [r.crianca_id, r.data, r.status, r.motivo || null, r.observacao || null]
          });
        }
        await db._turso.execute({ sql: 'COMMIT' });
        res.json({ message: `${registros.length} registros salvos` });
      } catch (err) {
        try { await db._turso.execute({ sql: 'ROLLBACK' }); } catch (_) {}
        res.status(500).json({ error: err.message });
      }
    })();
    return;
  }

  // ===== 3) Fallback genérico (no-db etc) =====
  res.status(500).json({ error: 'Banco de dados não disponível para escrita em lote' });
});

module.exports = router;
