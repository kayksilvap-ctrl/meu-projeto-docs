const express = require('express');
const router = express.Router();
const db = require('../database');

// POST /api/chamadas - Registrar ou atualizar presença/ausência (upsert)
router.post('/', (req, res) => {
  const { aluno_id, data, status } = req.body;

  if (!aluno_id || !data || !status) {
    return res.status(400).json({ error: 'aluno_id, data e status são obrigatórios' });
  }

  if (!['presente', 'ausente'].includes(status)) {
    return res.status(400).json({ error: 'Status deve ser "presente" ou "ausente"' });
  }

  // Usar INSERT OR REPLACE para fazer upsert
  const stmt = db.prepare(
    'INSERT OR REPLACE INTO chamadas (aluno_id, data, status, created_at) VALUES (?, ?, ?, datetime(\'now\', \'localtime\'))'
  );

  stmt.run(aluno_id, data, status, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    db.get(
      'SELECT c.*, a.nome as aluno_nome FROM chamadas c JOIN alunos a ON c.aluno_id = a.id WHERE c.aluno_id = ? AND c.data = ?',
      [aluno_id, data],
      (err, chamada) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(chamada);
      }
    );
  });

  stmt.finalize();
});

// GET /api/chamadas?data=YYYY-MM-DD&sala_id=X - Obter chamada de uma data
router.get('/', (req, res) => {
  const { data, sala_id } = req.query;

  if (!data) {
    return res.status(400).json({ error: 'Parâmetro data é obrigatório (YYYY-MM-DD)' });
  }

  let query = `
    SELECT a.id, a.nome, a.idade, a.responsavel, a.endereco, a.telefone, a.sala_id,
           s.nome as sala_nome,
           c.status, c.data as chamada_data
    FROM alunos a
    LEFT JOIN salas s ON a.sala_id = s.id
    LEFT JOIN chamadas c ON a.id = c.aluno_id AND c.data = ?
  `;
  let params = [data];

  if (sala_id) {
    query += ` WHERE a.sala_id = ?`;
    params.push(sala_id);
  }

  query += ' ORDER BY a.nome ASC';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET /api/dashboard?data=YYYY-MM-DD&sala_id=X - Estatísticas do dia
router.get('/dashboard', (req, res) => {
  const { data, sala_id } = req.query;
  const dataFilter = data || new Date().toISOString().split('T')[0];

  let countQuery = 'SELECT COUNT(*) as total FROM alunos';
  let countParams = [];

  if (sala_id) {
    countQuery += ' WHERE sala_id = ?';
    countParams.push(sala_id);
  }

  let chamadaQuery = `
    SELECT
      (SELECT COUNT(*) FROM chamadas c
       JOIN alunos a ON c.aluno_id = a.id
       WHERE c.data = ? AND c.status = 'presente'
  `;
  let chamadaParams = [dataFilter];

  if (sala_id) {
    chamadaQuery += ' AND a.sala_id = ?';
    chamadaParams.push(sala_id);
  }

  chamadaQuery += ') as presentes, (SELECT COUNT(*) FROM chamadas c JOIN alunos a ON c.aluno_id = a.id WHERE c.data = ? AND c.status = \'ausente\'';
  chamadaParams.push(dataFilter);

  if (sala_id) {
    chamadaQuery += ' AND a.sala_id = ?';
    chamadaParams.push(sala_id);
  }

  chamadaQuery += ') as ausentes, (SELECT COUNT(*) FROM chamadas c JOIN alunos a ON c.aluno_id = a.id WHERE c.data = ?';
  chamadaParams.push(dataFilter);

  if (sala_id) {
    chamadaQuery += ' AND a.sala_id = ?';
    chamadaParams.push(sala_id);
  }

  chamadaQuery += ') as total_registrados';

  db.get(countQuery, countParams, (err, countRow) => {
    if (err) return res.status(500).json({ error: err.message });

    db.get(chamadaQuery, chamadaParams, (err, row) => {
      if (err) return res.status(500).json({ error: err.message });

      const taxaPresenca = row.total_registrados > 0
        ? Math.round((row.presentes / row.total_registrados) * 100)
        : 0;

      res.json({
        total_alunos: countRow.total,
        presentes: row.presentes,
        ausentes: row.ausentes,
        taxa_presenca: taxaPresenca,
        data: dataFilter
      });
    });
  });
});

// GET /api/export - Exportar todos os dados como JSON
router.get('/export', (req, res) => {
  const alunos = [];
  const chamadas = [];
  const salas = [];

  db.serialize(() => {
    db.all('SELECT * FROM salas ORDER BY id', [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      salas.push(...rows);

      db.all('SELECT * FROM alunos ORDER BY id', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        alunos.push(...rows);

        db.all('SELECT * FROM chamadas ORDER BY data, aluno_id', [], (err, rows) => {
          if (err) return res.status(500).json({ error: err.message });
          chamadas.push(...rows);

          res.json({
            exportado_em: new Date().toISOString(),
            salas,
            alunos,
            chamadas
          });
        });
      });
    });
  });
});

// POST /api/import - Importar dados de JSON
router.post('/import', (req, res) => {
  const { alunos, chamadas, salas } = req.body;

  if (!alunos || !Array.isArray(alunos)) {
    return res.status(400).json({ error: 'Formato inválido. É necessário um array de alunos.' });
  }

  let importadosAlunos = 0;
  let importadosSalas = 0;
  let erros = 0;

  db.serialize(() => {
    db.run('PRAGMA foreign_keys=OFF');

    db.run('DELETE FROM chamadas');
    db.run('DELETE FROM alunos');
    db.run('DELETE FROM salas');

    // Importar salas primeiro
    if (salas && Array.isArray(salas)) {
      const insertSala = db.prepare(
        'INSERT INTO salas (id, nome, professor, descricao, created_at) VALUES (?, ?, ?, ?, ?)'
      );
      salas.forEach((s) => {
        insertSala.run(s.id, s.nome, s.professor || null, s.descricao || null, s.created_at || new Date().toISOString(), function(err) {
          if (!err) importadosSalas++;
          else erros++;
        });
      });
      insertSala.finalize();
    }

    const insertAluno = db.prepare(
      'INSERT INTO alunos (id, nome, idade, responsavel, endereco, telefone, sala_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );

    alunos.forEach((aluno) => {
      insertAluno.run(
        aluno.id, aluno.nome, aluno.idade || null, aluno.responsavel || null,
        aluno.endereco || null, aluno.telefone || null, aluno.sala_id || null,
        aluno.created_at || new Date().toISOString(),
        function (err) { if (err) erros++; else importadosAlunos++; }
      );
    });

    insertAluno.finalize();

    if (chamadas && Array.isArray(chamadas)) {
      const insertChamada = db.prepare(
        'INSERT OR IGNORE INTO chamadas (aluno_id, data, status, created_at) VALUES (?, ?, ?, ?)'
      );
      chamadas.forEach((c) => {
        insertChamada.run(c.aluno_id, c.data, c.status, c.created_at || new Date().toISOString());
      });
      insertChamada.finalize();
    }

    db.run('PRAGMA foreign_keys=ON');

    res.json({
      message: 'Importação concluída',
      salas_importadas: importadosSalas,
      alunos_importados: importadosAlunos,
      erros
    });
  });
});

// GET /api/estatisticas - Estatísticas gerais (últimos 30 dias)
router.get('/estatisticas', (req, res) => {
  const query = `
    SELECT 
      c.data,
      COUNT(CASE WHEN c.status = 'presente' THEN 1 END) as presentes,
      COUNT(CASE WHEN c.status = 'ausente' THEN 1 END) as ausentes
    FROM chamadas c
    WHERE c.data >= date('now', '-30 days')
    GROUP BY c.data
    ORDER BY c.data ASC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Calcular média de presença no período
    const totalPresentes = rows.reduce((sum, r) => sum + r.presentes, 0);
    const totalRegistros = rows.reduce((sum, r) => sum + r.presentes + r.ausentes, 0);

    res.json({
      dias: rows,
      total_presentes: totalPresentes,
      total_ausentes: totalRegistros - totalPresentes,
      media_presenca: totalRegistros > 0 ? Math.round((totalPresentes / totalRegistros) * 100) : 0
    });
  });
});

// DELETE /api/chamadas/reset - Resetar todos os dados
router.delete('/reset', (req, res) => {
  db.serialize(() => {
    db.run('DELETE FROM chamadas');
    db.run('DELETE FROM alunos');

    // Resetar sequências de auto incremento
    db.run("DELETE FROM sqlite_sequence WHERE name IN ('alunos', 'chamadas')");

    res.json({ message: 'Todos os dados foram resetados com sucesso' });
  });
});

module.exports = router;