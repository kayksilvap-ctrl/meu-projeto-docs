const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/salas - Listar todas as salas
router.get('/', (req, res) => {
  db.all(`
    SELECT s.*, (SELECT COUNT(*) FROM alunos WHERE sala_id = s.id) as total_alunos
    FROM salas s ORDER BY s.nome ASC
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET /api/salas/:id - Obter sala específica
router.get('/:id', (req, res) => {
  db.get(`
    SELECT s.*, (SELECT COUNT(*) FROM alunos WHERE sala_id = s.id) as total_alunos
    FROM salas s WHERE s.id = ?
  `, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Sala não encontrada' });
    res.json(row);
  });
});

// POST /api/salas - Criar sala
router.post('/', (req, res) => {
  const { nome, professor, descricao } = req.body;
  if (!nome || !nome.trim()) {
    return res.status(400).json({ error: 'Nome da sala é obrigatório' });
  }

  const stmt = db.prepare('INSERT INTO salas (nome, professor, descricao) VALUES (?, ?, ?)');
  stmt.run(nome.trim(), professor || null, descricao || null, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT * FROM salas WHERE id = ?', [this.lastID], (err, sala) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json(sala);
    });
  });
  stmt.finalize();
});

// PUT /api/salas/:id - Atualizar sala
router.put('/:id', (req, res) => {
  const { nome, professor, descricao } = req.body;
  if (!nome || !nome.trim()) {
    return res.status(400).json({ error: 'Nome da sala é obrigatório' });
  }

  const stmt = db.prepare('UPDATE salas SET nome = ?, professor = ?, descricao = ? WHERE id = ?');
  stmt.run(nome.trim(), professor || null, descricao || null, req.params.id, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Sala não encontrada' });
    db.get('SELECT * FROM salas WHERE id = ?', [req.params.id], (err, sala) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(sala);
    });
  });
  stmt.finalize();
});

// DELETE /api/salas/:id - Remover sala
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM salas WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Sala não encontrada' });
    res.json({ message: 'Sala removida com sucesso' });
  });
});

module.exports = router;