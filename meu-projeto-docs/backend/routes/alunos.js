const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/alunos - Listar alunos (com filtro opcional por sala e texto)
router.get('/', (req, res) => {
  const { q, sala_id } = req.query;

  let query = `
    SELECT a.*, s.nome as sala_nome 
    FROM alunos a 
    LEFT JOIN salas s ON a.sala_id = s.id
  `;
  let params = [];
  const where = [];

  if (q && q.trim()) {
    const term = `%${q.trim()}%`;
    where.push(`(a.nome LIKE ? OR a.endereco LIKE ? OR CAST(a.idade AS TEXT) LIKE ?)`);
    params.push(term, term, term);
  }

  if (sala_id) {
    where.push(`a.sala_id = ?`);
    params.push(sala_id);
  }

  if (where.length > 0) {
    query += ' WHERE ' + where.join(' AND ');
  }

  query += ' ORDER BY a.nome ASC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET /api/alunos/:id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get(`
    SELECT a.*, s.nome as sala_nome 
    FROM alunos a LEFT JOIN salas s ON a.sala_id = s.id 
    WHERE a.id = ?
  `, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Aluno não encontrado' });
    res.json(row);
  });
});

// POST /api/alunos
router.post('/', (req, res) => {
  const { nome, idade, responsavel, endereco, telefone, sala_id } = req.body;

  if (!nome || !nome.trim()) {
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }

  const stmt = db.prepare(
    'INSERT INTO alunos (nome, idade, responsavel, endereco, telefone, sala_id) VALUES (?, ?, ?, ?, ?, ?)'
  );

  stmt.run(
    nome.trim(),
    idade || null,
    responsavel || null,
    endereco || null,
    telefone || null,
    sala_id || null,
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      db.get('SELECT a.*, s.nome as sala_nome FROM alunos a LEFT JOIN salas s ON a.sala_id = s.id WHERE a.id = ?', [this.lastID], (err, aluno) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json(aluno);
      });
    }
  );

  stmt.finalize();
});

// PUT /api/alunos/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nome, idade, responsavel, endereco, telefone, sala_id } = req.body;

  if (!nome || !nome.trim()) {
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }

  const stmt = db.prepare(
    'UPDATE alunos SET nome = ?, idade = ?, responsavel = ?, endereco = ?, telefone = ?, sala_id = ? WHERE id = ?'
  );

  stmt.run(
    nome.trim(),
    idade || null,
    responsavel || null,
    endereco || null,
    telefone || null,
    sala_id || null,
    id,
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Aluno não encontrado' });

      db.get('SELECT a.*, s.nome as sala_nome FROM alunos a LEFT JOIN salas s ON a.sala_id = s.id WHERE a.id = ?', [id], (err, aluno) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(aluno);
      });
    }
  );

  stmt.finalize();
});

// DELETE /api/alunos/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM chamadas WHERE aluno_id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    db.run('DELETE FROM alunos WHERE id = ?', [id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Aluno não encontrado' });
      res.json({ message: 'Aluno removido com sucesso' });
    });
  });
});

module.exports = router;