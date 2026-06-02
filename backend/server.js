const express = require('express');
const cors = require('cors');
const path = require('path');

const turmasRouter = require('./routes/turmas');
const criancasRouter = require('./routes/criancas');
const frequenciasRouter = require('./routes/frequencias');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/turmas', turmasRouter);
app.use('/api/criancas', criancasRouter);
app.use('/api/frequencias', frequenciasRouter);

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