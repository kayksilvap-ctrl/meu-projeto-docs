const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/alunos - Listar todos os alunos
router.get('/', (req, res) => {
  const { q } = req.query;

  let query = 'SELECT * FROM alunos';
  let params = [];

  if (q && q.trim()) {
    const searchTerm = `%${q.trim()}%`;
    query += ` WHERE nome LIKE ? OR endereco LIKE ? OR CAST(idade AS TEXT) LIKE ?`;
    params = [searchTerm, searchTerm, searchTerm];
  }

  query += ' ORDER BY nome ASC';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET /api/alunos/:id - Obter um aluno específico
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM alunos WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
    res.json(row);
  });
});

// POST /api/alunos - Criar novo aluno
router.post('/', (req, res) => {
  const { nome, idade, responsavel, endereco, telefone } = req.body;

  if (!nome || !nome.trim()) {
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }

  const stmt = db.prepare(
    'INSERT INTO alunos (nome, idade, responsavel, endereco, telefone) VALUES (?, ?, ?, ?, ?)'
  );

  stmt.run(
    nome.trim(),
    idade || null,
    responsavel || null,
    endereco || null,
    telefone || null,
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      db.get('SELECT * FROM alunos WHERE id = ?', [this.lastID], (err, aluno) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json(aluno);
      });
    }
  );

  stmt.finalize();
});

// PUT /api/alunos/:id - Atualizar aluno
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nome, idade, responsavel, endereco, telefone } = req.body;

  if (!nome || !nome.trim()) {
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }

  const stmt = db.prepare(
    'UPDATE alunos SET nome = ?, idade = ?, responsavel = ?, endereco = ?, telefone = ? WHERE id = ?'
  );

  stmt.run(
    nome.trim(),
    idade || null,
    responsavel || null,
    endereco || null,
    telefone || null,
    id,
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Aluno não encontrado' });
      }

      db.get('SELECT * FROM alunos WHERE id = ?', [id], (err, aluno) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(aluno);
      });
    }
  );

  stmt.finalize();
});

// DELETE /api/alunos/:id - Remover aluno
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  // Deletar chamadas do aluno primeiro (cascade deve funcionar, mas garantimos)
  db.run('DELETE FROM chamadas WHERE aluno_id = ?', [id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    db.run('DELETE FROM alunos WHERE id = ?', [id], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Aluno não encontrado' });
      }
      res.json({ message: 'Aluno removido com sucesso' });
    });
  });
});

module.exports = router;