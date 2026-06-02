const express = require('express');
const cors = require('cors');
const path = require('path');

const alunosRouter = require('./routes/alunos');
const chamadaRouter = require('./routes/chamada');
const salasRouter = require('./routes/salas');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/alunos', alunosRouter);
app.use('/api/chamadas', chamadaRouter);
app.use('/api/salas', salasRouter);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API do Sistema de Chamada funcionando!' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📋 API disponível em http://localhost:${PORT}/api`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health\n`);
});