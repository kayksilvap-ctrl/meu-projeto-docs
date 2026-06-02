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

  db.all(query, params, (err, rows) => { if (err) return res.status(500).json({ error: err.message }); res.json(rows); });
});

router.get('/:id', (req, res) => {
  db.get(`SELECT c.*, t.nome as turma_nome FROM criancas c LEFT JOIN turmas t ON c.turma_id = t.id WHERE c.id = ?`,
    [req.params.id], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'Não encontrada' });
      // Get responsaveis and endereco
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

  const stmt = db.prepare('INSERT INTO criancas (nome, data_nascimento, sexo, turma_id, observacoes) VALUES (?,?,?,?,?)');
  stmt.run(nome.trim(), data_nascimento||null, sexo||null, turma_id||null, observacoes||null, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    const criancaId = this.lastID;

    // Insert responsaveis
    if (responsaveis && Array.isArray(responsaveis)) {
      const rStmt = db.prepare('INSERT INTO responsaveis (crianca_id, tipo, nome, telefone, whatsapp, email) VALUES (?,?,?,?,?,?)');
      responsaveis.forEach(r => rStmt.run(criancaId, r.tipo||'outro', r.nome, r.telefone||null, r.whatsapp||null, r.email||null));
      rStmt.finalize();
    }

    // Insert endereco
    if (endereco) {
      db.run('INSERT INTO enderecos (crianca_id, cep, rua, numero, complemento, bairro, cidade, estado) VALUES (?,?,?,?,?,?,?,?)',
        [criancaId, endereco.cep||null, endereco.rua||null, endereco.numero||null, endereco.complemento||null, endereco.bairro||null, endereco.cidade||null, endereco.estado||null]);
    }

    db.get('SELECT * FROM criancas WHERE id = ?', [criancaId], (err2, row) => res.status(201).json(row));
  });
  stmt.finalize();
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