const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  db.all(`SELECT t.*, (SELECT COUNT(*) FROM criancas WHERE turma_id = t.id) as total_criancas FROM turmas t ORDER BY t.nome`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { nome, professor } = req.body;
  if (!nome?.trim()) return res.status(400).json({ error: 'Nome obrigatório' });
  const stmt = db.prepare('INSERT INTO turmas (nome, professor) VALUES (?,?)');
  stmt.run(nome.trim(), professor || null, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT * FROM turmas WHERE id = ?', [this.lastID], (err, row) => {
      res.status(201).json(row);
    });
  });
  stmt.finalize();
});

router.put('/:id', (req, res) => {
  const { nome, professor } = req.body;
  if (!nome?.trim()) return res.status(400).json({ error: 'Nome obrigatório' });
  db.run('UPDATE turmas SET nome=?, professor=? WHERE id=?', [nome.trim(), professor||null, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Turma não encontrada' });
    db.get('SELECT * FROM turmas WHERE id = ?', [req.params.id], (err, row) => res.json(row));
  });
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM turmas WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Turma não encontrada' });
    res.json({ message: 'Removida' });
  });
});

module.exports = router;