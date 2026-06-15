const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  const { q, turma_id } = req.query;
  let query = `SELECT c.*, t.nome as turma_nome FROM criancas c LEFT JOIN turmas t ON c.turma_id = t.id`;
  let params = [];
  const where = [];

  if (q?.trim()) {
    const term = `%${q.trim()}%`;
    where.push(`(c.nome LIKE ? OR c.observacoes LIKE ?)`);
    params.push(term, term);
  }
  if (turma_id) { where.push('c.turma_id = ?'); params.push(turma_id); }
  if (where.length) query += ' WHERE ' + where.join(' AND ');
  query += ' ORDER BY c.nome';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows.length) return res.json([]);

    const ids = rows.map(r => r.id);
    const ph = ids.map(() => '?').join(',');

    db.all(`SELECT * FROM responsaveis WHERE crianca_id IN (${ph})`, ids, (err2, responsaveis) => {
      if (err2) return res.status(500).json({ error: err2.message });
      const respMap = {};
      (responsaveis || []).forEach(r => {
        (respMap[r.crianca_id] = respMap[r.crianca_id] || []).push(r);
      });

      db.all(`SELECT * FROM enderecos WHERE crianca_id IN (${ph})`, ids, (err3, enderecos) => {
        if (err3) return res.status(500).json({ error: err3.message });
        const endMap = {};
        (enderecos || []).forEach(e => { endMap[e.crianca_id] = e; });

        res.json(rows.map(r => ({
          ...r,
          responsaveis: respMap[r.id] || [],
          endereco: endMap[r.id] || null
        })));
      });
    });
  });
});

router.get('/:id', (req, res) => {
  db.get(`SELECT c.*, t.nome as turma_nome FROM criancas c LEFT JOIN turmas t ON c.turma_id = t.id WHERE c.id = ?`,
    [req.params.id], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'Não encontrada' });
      db.all('SELECT * FROM responsaveis WHERE crianca_id = ?', [row.id], (err2, responsaveis) => {
        db.get('SELECT * FROM enderecos WHERE crianca_id = ?', [row.id], (err3, endereco) => {
          res.json({ ...row, responsaveis: responsaveis || [], endereco: endereco || null });
        });
      });
    });
});

router.post('/', (req, res) => {
  const { nome, data_nascimento, sexo, turma_id, observacoes, responsaveis, endereco } = req.body;
  if (!nome?.trim()) return res.status(400).json({ error: 'Nome obrigatório' });

  // Use db.run (compatível com Turso e better-sqlite3)
  db.run('INSERT INTO criancas (nome, data_nascimento, sexo, turma_id, observacoes) VALUES (?,?,?,?,?)',
    [nome.trim(), data_nascimento||null, sexo||null, turma_id||null, observacoes||null],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      const criancaId = this.lastID;

      if (responsaveis && Array.isArray(responsaveis) && responsaveis.length) {
        const rStmt = db.prepare('INSERT INTO responsaveis (crianca_id, tipo, nome, telefone, whatsapp, email) VALUES (?,?,?,?,?,?)');
        responsaveis.forEach(r => rStmt.run(criancaId, r.tipo||'outro', r.nome, r.telefone||null, r.whatsapp||null, r.email||null));
        rStmt.finalize();
      }

      if (endereco) {
        db.run('INSERT INTO enderecos (crianca_id, cep, rua, numero, complemento, bairro, cidade, estado) VALUES (?,?,?,?,?,?,?,?)',
          [criancaId, endereco.cep||null, endereco.rua||null, endereco.numero||null, endereco.complemento||null, endereco.bairro||null, endereco.cidade||null, endereco.estado||null]);
      }

      db.get('SELECT * FROM criancas WHERE id = ?', [criancaId], (err2, row) => res.status(201).json(row));
    });
});

router.put('/:id', (req, res) => {
  const { nome, data_nascimento, sexo, turma_id, observacoes } = req.body;
  if (!nome?.trim()) return res.status(400).json({ error: 'Nome obrigatório' });
  db.run('UPDATE criancas SET nome=?, data_nascimento=?, sexo=?, turma_id=?, observacoes=? WHERE id=?',
    [nome.trim(), data_nascimento||null, sexo||null, turma_id||null, observacoes||null, req.params.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Não encontrada' });
      res.json({ message: 'Atualizada' });
    });
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM criancas WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Não encontrada' });
    res.json({ message: 'Removida' });
  });
});

module.exports = router;