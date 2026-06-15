// Entrypoint serverless do Vercel: exportar o app Express diretamente
// (o runtime @vercel/node aceita um app Express como handler; "exports.handler" é formato AWS Lambda e NÃO funciona aqui)
module.exports = require('../backend/app');
