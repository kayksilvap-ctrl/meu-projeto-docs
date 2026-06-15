// Dados de demonstração - Associação Anjo da Guarda
// São José do Rio Preto - SP

const db = require('./database');

function seed() {
  console.log('🌱 Iniciando seed de demonstração...');

  // ===== TURMAS =====
  const turmas = [
    { nome: 'Maternal A', professor: 'Maria Oliveira' },
    { nome: 'Maternal B', professor: 'Carla Souza' },
    { nome: 'Jardim I', professor: 'Ana Costa' },
    { nome: 'Jardim II', professor: 'Rafael Lima' },
  ];

  // ===== CRIANÇAS E RESPONSÁVEIS =====
  const criancasData = [
    // Maternal A (12 crianças - 2-3 anos)
    { nome: 'Lucas Silva Santos', nasc: '2024-01-15', sexo: 'M', turma: 0, mae: 'Juliana Silva Santos', pai: 'Carlos Santos', tel: '(17) 99101-1001', whats: '(17) 99101-1001', email: 'juliana.silva@email.com', rua: 'Rua Antônio de Godoy', num: '123', bairro: 'Vila Toninho', cep: '15050-010' },
    { nome: 'Manuela Costa Oliveira', nasc: '2023-11-20', sexo: 'F', turma: 0, mae: 'Patrícia Costa Oliveira', tel: '(17) 99102-2002', whats: '(17) 99102-2002', rua: 'Rua XV de Novembro', num: '456', bairro: 'Vila Toninho', cep: '15050-020' },
    { nome: 'Enzo Gabriel Pereira', nasc: '2024-03-08', sexo: 'M', turma: 0, mae: 'Amanda Pereira', tel: '(17) 99103-3003', rua: 'Rua dos Bandeirantes', num: '789', bairro: 'Jardim América', cep: '15050-030' },
    { nome: 'Alice Fernandes Lima', nasc: '2023-09-12', sexo: 'F', turma: 0, mae: 'Fernanda Fernandes Lima', tel: '(17) 99104-4004', whats: '(17) 99104-4004', rua: 'Rua Bernardino de Campos', num: '321', bairro: 'Jardim América', cep: '15050-040' },
    { nome: 'Heitor Almeida Rocha', nasc: '2024-02-28', sexo: 'M', turma: 0, mae: 'Renata Almeida Rocha', tel: '(17) 99105-5005', rua: 'Av. Alberto Andaló', num: '100', bairro: 'Centro', cep: '15010-010' },
    { nome: 'Laura Martins Dias', nasc: '2023-12-05', sexo: 'F', turma: 0, mae: 'Tatiane Martins Dias', tel: '(17) 99106-6006', whats: '(17) 99106-6006', rua: 'Av. Bady Bassitt', num: '200', bairro: 'Centro', cep: '15010-020' },
    { nome: 'Davi Lucca Barbosa', nasc: '2024-04-18', sexo: 'M', turma: 0, mae: 'Cristiane Barbosa', tel: '(17) 99107-7007', rua: 'Rua João Ferrari', num: '150', bairro: 'Parque da Liberdade', cep: '15060-010' },
    { nome: 'Sophia Correia Neves', nasc: '2023-10-30', sexo: 'F', turma: 0, mae: 'Luciana Correia Neves', tel: '(17) 99108-8008', whats: '(17) 99108-8008', rua: 'Rua das Flores', num: '55', bairro: 'Vila Novaes', cep: '15070-010' },
    { nome: 'Bernardo Freitas Castro', nasc: '2024-01-22', sexo: 'M', turma: 0, mae: 'Aline Freitas Castro', tel: '(17) 99109-9009', rua: 'Rua dos Girassóis', num: '88', bairro: 'Boaventura', cep: '15080-010' },
    { nome: 'Isabela Teixeira Souza', nasc: '2023-08-14', sexo: 'F', turma: 0, mae: 'Mariana Teixeira Souza', tel: '(17) 99110-1010', whats: '(17) 99110-1010', rua: 'Rua das Orquídeas', num: '234', bairro: 'Vila Toninho', cep: '15050-050' },
    { nome: 'Gabriel Nascimento Costa', nasc: '2024-05-01', sexo: 'M', turma: 0, mae: 'Vanessa Nascimento Costa', tel: '(17) 99111-1111', rua: 'Rua das Violetas', num: '67', bairro: 'Jardim América', cep: '15050-060' },
    { nome: 'Heloísa Ribeiro Matos', nasc: '2023-07-25', sexo: 'F', turma: 0, mae: 'Camila Ribeiro Matos', tel: '(17) 99112-1212', whats: '(17) 99112-1212', rua: 'Rua das Acácias', num: '890', bairro: 'Centro', cep: '15010-030' },

    // Maternal B (10 crianças - 3-4 anos)
    { nome: 'Pedro Henrique Gonçalves', nasc: '2022-06-10', sexo: 'M', turma: 1, mae: 'Elaine Gonçalves', pai: 'Ricardo Gonçalves', tel: '(17) 99201-2001', whats: '(17) 99201-2001', rua: 'Rua da Paz', num: '45', bairro: 'Vila Novaes', cep: '15070-020' },
    { nome: 'Marina Carvalho Dias', nasc: '2022-09-22', sexo: 'F', turma: 1, mae: 'Daniela Carvalho Dias', tel: '(17) 99202-2002', rua: 'Rua da Alegria', num: '678', bairro: 'Boaventura', cep: '15080-020' },
    { nome: 'Arthur Pereira Gomes', nasc: '2022-12-03', sexo: 'M', turma: 1, mae: 'Juliana Pereira Gomes', tel: '(17) 99203-2003', whats: '(17) 99203-2003', rua: 'Rua Dom Pedro I', num: '90', bairro: 'Centro', cep: '15010-040' },
    { nome: 'Valentina Barbosa Lira', nasc: '2022-04-17', sexo: 'F', turma: 1, mae: 'Priscila Barbosa Lira', tel: '(17) 99204-2004', rua: 'Rua Dom Pedro II', num: '345', bairro: 'Centro', cep: '15010-050' },
    { nome: 'Theo Moreira Azevedo', nasc: '2022-08-29', sexo: 'M', turma: 1, mae: 'Cíntia Moreira Azevedo', tel: '(17) 99205-2005', whats: '(17) 99205-2005', rua: 'Rua dos Pinheiros', num: '12', bairro: 'Parque da Liberdade', cep: '15060-020' },
    { nome: 'Ana Clara Farias Silva', nasc: '2022-11-11', sexo: 'F', turma: 1, mae: 'Roberta Farias Silva', tel: '(17) 99206-2006', rua: 'Rua dos Eucaliptos', num: '789', bairro: 'Vila Toninho', cep: '15050-070' },
    { nome: 'Miguel Aragão Neto', nasc: '2022-02-14', sexo: 'M', turma: 1, mae: 'Adriana Aragão', pai: 'Marcos Aragão', tel: '(17) 99207-2007', whats: '(17) 99207-2007', rua: 'Rua dos Jacarandás', num: '56', bairro: 'Jardim América', cep: '15050-080' },
    { nome: 'Rafaela Campos Teles', nasc: '2022-07-08', sexo: 'F', turma: 1, mae: 'Sandra Campos Teles', tel: '(17) 99208-2008', rua: 'Rua dos Lírios', num: '234', bairro: 'Boaventura', cep: '15080-030' },
    { nome: 'Gustavo Monteiro Cruz', nasc: '2022-10-19', sexo: 'M', turma: 1, mae: 'Larissa Monteiro Cruz', tel: '(17) 99209-2009', whats: '(17) 99209-2009', rua: 'Rua dos Cravos', num: '111', bairro: 'Vila Novaes', cep: '15070-030' },
    { nome: 'Lara Assunção Brito', nasc: '2022-05-05', sexo: 'F', turma: 1, mae: 'Tatiana Assunção Brito', tel: '(17) 99210-2010', rua: 'Rua das Margaridas', num: '90', bairro: 'Parque da Liberdade', cep: '15060-030' },

    // Jardim I (15 crianças - 4-5 anos)
    { nome: 'Felipe Cardoso Moura', nasc: '2021-03-20', sexo: 'M', turma: 2, mae: 'Simone Cardoso Moura', tel: '(17) 99301-3001', rua: 'Rua das Camélias', num: '500', bairro: 'Centro', cep: '15010-060' },
    { nome: 'Giovanna Melo Campos', nasc: '2021-08-15', sexo: 'F', turma: 2, mae: 'Andréa Melo Campos', tel: '(17) 99302-3002', whats: '(17) 99302-3002', rua: 'Rua das Hortênsias', num: '345', bairro: 'Vila Toninho', cep: '15050-090' },
    { nome: 'João Pedro Vargas Lima', nasc: '2021-01-10', sexo: 'M', turma: 2, mae: 'Cristina Vargas Lima', tel: '(17) 99303-3003', rua: 'Rua das Palmeiras', num: '678', bairro: 'Jardim América', cep: '15050-100' },
    { nome: 'Lívia Andrade Pires', nasc: '2021-06-28', sexo: 'F', turma: 2, mae: 'Bianca Andrade Pires', tel: '(17) 99304-3004', whats: '(17) 99304-3004', rua: 'Rua das Rosas', num: '901', bairro: 'Boaventura', cep: '15080-040' },
    { nome: 'Matheus Noronha Faria', nasc: '2021-04-05', sexo: 'M', turma: 2, mae: 'Tânia Noronha Faria', tel: '(17) 99305-3005', rua: 'Rua das Azaleias', num: '234', bairro: 'Vila Novaes', cep: '15070-040' },
    { nome: 'Clara Vasconcelos Rios', nasc: '2021-09-12', sexo: 'F', turma: 2, mae: 'Renata Vasconcelos Rios', tel: '(17) 99306-3006', whats: '(17) 99306-3006', rua: 'Rua das Bromélias', num: '567', bairro: 'Parque da Liberdade', cep: '15060-040' },
    { nome: 'Daniel Carneiro Bastos', nasc: '2021-02-18', sexo: 'M', turma: 2, mae: 'Sônia Carneiro Bastos', tel: '(17) 99307-3007', rua: 'Rua das Tulipas', num: '890', bairro: 'Centro', cep: '15010-070' },
    { nome: 'Maria Eduarda Sales', nasc: '2021-07-22', sexo: 'F', turma: 2, mae: 'Márcia Sales', tel: '(17) 99308-3008', whats: '(17) 99308-3008', rua: 'Rua das Margaridas', num: '123', bairro: 'Vila Toninho', cep: '15050-110' },
    { nome: 'Vinicius Bezerra Melo', nasc: '2021-05-30', sexo: 'M', turma: 2, mae: 'Carmem Bezerra Melo', tel: '(17) 99309-3009', rua: 'Rua dos Lírios', num: '456', bairro: 'Jardim América', cep: '15050-120' },
    { nome: 'Júlia Cavalcanti Leite', nasc: '2021-10-08', sexo: 'F', turma: 2, mae: 'Paula Cavalcanti Leite', tel: '(17) 99310-3010', whats: '(17) 99310-3010', rua: 'Rua dos Cravos', num: '789', bairro: 'Boaventura', cep: '15080-050' },
    { nome: 'Luiz Henrique Dantas', nasc: '2021-12-25', sexo: 'M', turma: 2, mae: 'Mônica Dantas', tel: '(17) 99311-3011', rua: 'Rua das Orquídeas', num: '111', bairro: 'Vila Novaes', cep: '15070-050' },
    { nome: 'Bianca Furtado Sá', nasc: '2021-11-03', sexo: 'F', turma: 2, mae: 'Lucia Furtado Sá', tel: '(17) 99312-3012', rua: 'Rua das Violetas', num: '222', bairro: 'Parque da Liberdade', cep: '15060-050' },
    { nome: 'Rafael Pimenta Neves', nasc: '2021-03-14', sexo: 'M', turma: 2, mae: 'Irene Pimenta Neves', tel: '(17) 99313-3013', rua: 'Rua das Acácias', num: '333', bairro: 'Centro', cep: '15010-080' },
    { nome: 'Letícia Fontes Garcia', nasc: '2021-08-01', sexo: 'F', turma: 2, mae: 'Marta Fontes Garcia', tel: '(17) 99314-3014', whats: '(17) 99314-3014', rua: 'Rua das Camélias', num: '444', bairro: 'Vila Toninho', cep: '15050-130' },
    { nome: 'André Toledo Marques', nasc: '2021-06-15', sexo: 'M', turma: 2, mae: 'Helena Toledo Marques', tel: '(17) 99315-3015', rua: 'Rua das Hortênsias', num: '555', bairro: 'Jardim América', cep: '15050-140' },

    // Jardim II (13 crianças - 5-6 anos)
    { nome: 'Natália Wanderley Ximenes', nasc: '2020-04-10', sexo: 'F', turma: 3, mae: 'Viviane Wanderley Ximenes', tel: '(17) 99401-4001', rua: 'Rua dos Hibiscos', num: '666', bairro: 'Boaventura', cep: '15080-060' },
    { nome: 'Leonardo Santiago Bastos', nasc: '2020-09-18', sexo: 'M', turma: 3, mae: 'Cláudia Santiago Bastos', tel: '(17) 99402-4002', rua: 'Rua das Gérberas', num: '777', bairro: 'Vila Novaes', cep: '15070-060' },
    { nome: 'Yasmin Trindade Morais', nasc: '2020-02-25', sexo: 'F', turma: 3, mae: 'Sueli Trindade Morais', tel: '(17) 99403-4003', whats: '(17) 99403-4003', rua: 'Rua das Magnólias', num: '888', bairro: 'Parque da Liberdade', cep: '15060-060' },
    { nome: 'Igor Quintela Nunes', nasc: '2020-07-14', sexo: 'M', turma: 3, mae: 'Débora Quintela Nunes', tel: '(17) 99404-4004', rua: 'Rua das Azaleias', num: '999', bairro: 'Centro', cep: '15010-090' },
    { nome: 'Sara Evangelista Lins', nasc: '2020-11-30', sexo: 'F', turma: 3, mae: 'Elisa Evangelista Lins', tel: '(17) 99405-4005', rua: 'Rua das Palmeiras', num: '101', bairro: 'Vila Toninho', cep: '15050-150' },
    { nome: 'Otávio Cavalcante Félix', nasc: '2020-05-20', sexo: 'M', turma: 3, mae: 'Sônia Cavalcante Félix', tel: '(17) 99406-4006', rua: 'Rua das Rosas', num: '202', bairro: 'Jardim América', cep: '15050-160' },
    { nome: 'Luna Ramires Barreto', nasc: '2020-10-05', sexo: 'F', turma: 3, mae: 'Regina Ramires Barreto', tel: '(17) 99407-4007', rua: 'Rua dos Lírios', num: '303', bairro: 'Boaventura', cep: '15080-070' },
    { nome: 'Caio Botelho Arantes', nasc: '2020-01-12', sexo: 'M', turma: 3, mae: 'Joana Botelho Arantes', tel: '(17) 99408-4008', rua: 'Rua das Violetas', num: '404', bairro: 'Vila Novaes', cep: '15070-070' },
    { nome: 'Eduarda Meireles Chagas', nasc: '2020-08-22', sexo: 'F', turma: 3, mae: 'Lígia Meireles Chagas', tel: '(17) 99409-4009', rua: 'Rua das Tulipas', num: '505', bairro: 'Parque da Liberdade', cep: '15060-070' },
    { nome: 'Thiago Escobar Vidal', nasc: '2020-03-30', sexo: 'M', turma: 3, mae: 'Silvia Escobar Vidal', tel: '(17) 99410-4010', rua: 'Rua das Bromélias', num: '606', bairro: 'Centro', cep: '15010-100' },
    { nome: 'Mirela Tavares Fontes', nasc: '2020-06-08', sexo: 'F', turma: 3, mae: 'Cíntia Tavares Fontes', tel: '(17) 99411-4011', rua: 'Rua das Gérberas', num: '707', bairro: 'Vila Toninho', cep: '15050-170' },
    { nome: 'Fábio Rabelo Gusmão', nasc: '2020-12-15', sexo: 'M', turma: 3, mae: 'Alessandra Rabelo Gusmão', tel: '(17) 99412-4012', rua: 'Rua dos Hibiscos', num: '808', bairro: 'Jardim América', cep: '15050-180' },
    { nome: 'Beatriz Alencar Prado', nasc: '2020-04-28', sexo: 'F', turma: 3, mae: 'Fátima Alencar Prado', tel: '(17) 99413-4013', rua: 'Rua das Magnólias', num: '909', bairro: 'Boaventura', cep: '15080-080' },
  ];

  // Status possíveis para frequência (3x presente p/ ~60% presença)
  const statusList = ['presente', 'presente', 'presente', 'ausente_justificada', 'ausente_nao_justificada'];

  // Gerar datas dos últimos 5 dias úteis (ordem cronológica)
  const datas = [];
  const hoje = new Date();
  let diasGerados = 0;
  for (let i = 0; diasGerados < 5; i++) {
    const d = new Date(hoje);
    d.setDate(d.getDate() - i);
    const diaSem = d.getDay();
    if (diaSem !== 0 && diaSem !== 6) { // Sábado e domingo não
      datas.push(d.toISOString().split('T')[0]);
      diasGerados++;
    }
  }
  datas.reverse();

  // Barreira: roda todas as ops em paralelo e chama done() quando TODAS confirmarem.
  // Substitui o antigo setTimeout(200ms) que "adivinhava" o término dos INSERTs de turma —
  // no Turso (assíncrono, com latência de rede) isso causava criança com turma errada/nula
  // e a função podia ser congelada pelo Vercel antes de gravar tudo.
  const runAll = (ops, done) => {
    let pend = ops.length;
    if (!pend) return done();
    ops.forEach(op => op(() => { if (--pend === 0) done(); }));
  };

  return new Promise((resolve, reject) => {
    // Fase 1 — limpa tudo (espera concluir antes de inserir, p/ não apagar o que acabou de entrar)
    const limpeza = [
      cb => db.run('DELETE FROM frequencias', cb),
      cb => db.run('DELETE FROM enderecos', cb),
      cb => db.run('DELETE FROM responsaveis', cb),
      cb => db.run('DELETE FROM criancas', cb),
      cb => db.run('DELETE FROM turmas', cb),
      cb => db.run("DELETE FROM sqlite_sequence WHERE name IN ('turmas','criancas','responsaveis','enderecos','frequencias')", cb),
    ];

    runAll(limpeza, () => {
      // Fase 2 — insere turmas e AGUARDA os IDs reais (sem chute de tempo)
      const turmaIds = new Array(turmas.length);
      const insereTurmas = turmas.map((t, idx) => cb => {
        db.run('INSERT INTO turmas (nome, professor) VALUES (?,?)', [t.nome, t.professor], function() {
          turmaIds[idx] = this.lastID;
          cb();
        });
      });

      runAll(insereTurmas, () => {
        // Fase 3 — cada criança grava seus responsáveis/endereço/frequências e só então confirma
        const insereCriancas = criancasData.map(c => cb => {
          db.run('INSERT INTO criancas (nome, data_nascimento, sexo, turma_id) VALUES (?,?,?,?)',
            [c.nome, c.nasc, c.sexo, turmaIds[c.turma]],
            function() {
              const criancaId = this.lastID;

              // Responsáveis (mãe e/ou pai conforme o cadastro)
              const contatos = [];
              if (c.mae) contatos.push({ tipo: 'mae', nome: c.mae, telefone: c.tel, whatsapp: c.whats || null, email: c.email || null });
              if (c.pai) contatos.push({ tipo: 'pai', nome: c.pai, telefone: c.tel, whatsapp: null, email: null });
              if (!contatos.length) contatos.push({ tipo: 'outro', nome: 'Responsável', telefone: c.tel, whatsapp: null, email: null });

              const subs = [];
              contatos.forEach(r => subs.push(scb =>
                db.run('INSERT INTO responsaveis (crianca_id, tipo, nome, telefone, whatsapp, email) VALUES (?,?,?,?,?,?)',
                  [criancaId, r.tipo, r.nome, r.telefone, r.whatsapp, r.email], scb)));

              // Endereço (São José do Rio Preto - SP)
              subs.push(scb =>
                db.run('INSERT INTO enderecos (crianca_id, cep, rua, numero, complemento, bairro, cidade, estado) VALUES (?,?,?,?,?,?,?,?)',
                  [criancaId, c.cep, c.rua, c.num, null, c.bairro, 'São José do Rio Preto', 'SP'], scb));

              // Frequência dos últimos 5 dias úteis
              datas.forEach(data => {
                const status = statusList[Math.floor(Math.random() * statusList.length)];
                subs.push(scb =>
                  db.run('INSERT OR IGNORE INTO frequencias (crianca_id, data, status) VALUES (?,?,?)',
                    [criancaId, data, status], scb));
              });

              runAll(subs, cb);
            });
        });

        runAll(insereCriancas, () => {
          console.log(`✅ Seed concluído! ${turmas.length} turmas, ${criancasData.length} crianças, responsáveis e frequências.`);
          resolve({ turmas: turmas.length, criancas: criancasData.length, dias: datas.length });
        });
      });
    });
  });
}

module.exports = seed;