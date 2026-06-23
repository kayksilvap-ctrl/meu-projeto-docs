// Seed removido - sistema deve ser usado com dados reais cadastrados pelo usuário.
// Os dados são persistidos no arquivo backend/data/associacao.db (better-sqlite3).
// 
// Para popular o banco, utilize as telas de Cadastro de Crianças e Turmas.
// Ou use a importação via interface (Configurações > Importar/Exportar).

const db = require('./database');

function seed() {
  return Promise.resolve({ turmas: 0, criancas: 0, dias: 0 });
}

module.exports = seed;