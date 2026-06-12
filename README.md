# 🛡️ Sistema de Chamada/Frequência - Associação Anjo da Guarda

Sistema completo para gerenciamento de chamada e frequência de alunos, construído com **Vue 3 + Vuetify 3** (frontend) e **Node.js + Express + SQLite** (backend).

## ✨ Funcionalidades

- ✅ **Cadastro de Turmas** — Gerencie turmas com professor responsável
- ✅ **Cadastro de Crianças** — Nome, data de nascimento, sexo, foto, observações
- ✅ **Responsáveis** — Cadastro de mãe, pai ou outro responsável com telefone, WhatsApp e email
- ✅ **Endereço** — CEP, rua, número, complemento, bairro, cidade, estado
- ✅ **Frequência Diária** — Presente, ausente justificada ou ausente não justificada
- ✅ **Seletor de Data** — Faça chamada de dias diferentes
- ✅ **Dashboard** — Total de crianças, presentes/ausentes hoje, taxa de presença
- ✅ **Filtros** — Busca por nome, turma ou observações
- ✅ **Exportar/Importar** — Backup e restauração de dados em JSON
- ✅ **Relatórios** — Gráfico dos últimos 30 dias com taxas por turma
- ✅ **Resetar Dados** — Limpar todos os registros
- ✅ **Responsivo** — Funciona perfeitamente em desktop e mobile
- ✅ **Tema Personalizado** — Cores #8B4513 (marrom) e #FFD700 (dourado)
- ✅ **Animações** — Transições suaves, hover effects, contadores animados

## 🚀 Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Vue 3 (Composition API) + Vuetify 3 |
| Roteamento | Vue Router 4 |
| Ícones | Material Design Icons |
| Backend | Node.js + Express |
| Banco | SQLite (local) / Turso (produção no Vercel) |
| Build | Vite 5 |
| Deploy | Vercel (SPA + função serverless em `/api`) |

## 📦 Instalação

### Pré-requisitos

- **Node.js** (v18 ou superior)
- **npm** (v9 ou superior)

### Passo a passo

```bash
# 1. Clone o repositório (ou navegue até a pasta do projeto)
cd meu-projeto-docs

# 2. Instale as dependências do backend
cd backend
npm install

# 3. Instale as dependências do frontend
cd ../frontend
npm install

# 4. Volte para a raiz e instale o concurrently
cd ..
npm install
```

## 🎯 Execução Local

### Opção 1: Rodar tudo juntos (recomendado)

```bash
npm run dev
```

Isso vai iniciar:
- **Backend** → http://localhost:3000
- **Frontend** → http://localhost:5173

### Opção 2: Rodar separadamente

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## ☁️ Deploy no Vercel

Estrutura padrão do Vercel: o frontend é buildado como SPA (`frontend/dist`) e a API roda como **função serverless** em `api/index.js`, que apenas exporta o app Express de `backend/app.js`.

### Configuração no Vercel

1. **Crie um projeto no Vercel** e conecte ao seu repositório Git
2. **Configure as variáveis de ambiente** no Vercel:

| Variável | Descrição |
|----------|-----------|
| `TURSO_DATABASE_URL` | URL do banco Turso (**obrigatória em produção** — sem ela os dados são perdidos a cada cold start) |
| `TURSO_AUTH_TOKEN` | Token de autenticação do Turso |
| `API_TOKEN` | (recomendado) Token secreto da API — quando definido, toda rota exige o header `x-api-token` |
| `VITE_API_TOKEN` | O mesmo valor de `API_TOKEN`, para o frontend enviar o header automaticamente |
| `CORS_ORIGIN` | (recomendado) Domínio permitido, ex.: `https://seu-projeto.vercel.app` |

3. **Banco de dados (Turso):** [crie uma conta gratuita](https://turso.tech), crie um banco e copie URL + token para as variáveis acima. Sem Turso o banco roda **em memória** e zera a cada cold start — serve só para demonstração.

4. **Faça o deploy.** O `vercel.json` da raiz já define build do frontend, rewrites e a função da API.

### URLs após o deploy

| Serviço | URL |
|---------|-----|
| **Frontend** | `https://seu-projeto.vercel.app/` |
| **Backend API** | `https://seu-projeto.vercel.app/api` |
| **Health Check** | `https://seu-projeto.vercel.app/api/health` |

## 📁 Estrutura do Projeto

```
meu-projeto-docs/
├── package.json                      # Scripts raiz
├── vercel.json                       # Configuração Vercel
├── api/
│   └── index.js                      # Entrypoint serverless do Vercel (exporta o app Express)
├── backend/
│   ├── package.json
│   ├── app.js                        # App Express único (rotas + auth + CORS) — usado local e no Vercel
│   ├── server.js                     # Servidor local (porta 3000)
│   ├── database.js                   # Configuração SQLite/Turso
│   └── routes/
│       ├── turmas.js                 # CRUD de turmas
│       ├── criancas.js               # CRUD de crianças
│       ├── frequencias.js            # Frequência, dashboard, relatórios
│       ├── salas.js                  # CRUD de salas (legado)
│       ├── alunos.js                 # CRUD de alunos (legado)
│       └── chamada.js                # Chamada (legado)
├── frontend/
│   ├── package.json
│   ├── vite.config.js                # Configuração Vite + proxy API
│   ├── index.html
│   └── src/
│       ├── main.js                   # Bootstrap da aplicação
│       ├── App.vue                   # Layout principal + modals globais
│       ├── api.js                    # Chamadas HTTP (axios) com baseURL dinâmica
│       ├── router/index.js           # Rotas: Dashboard, Alunos, Chamada
│       ├── plugins/vuetify.js        # Tema personalizado
│       ├── components/
│       │   ├── NavBar.vue            # Menu superior com ações
│       │   ├── AlunoForm.vue         # Formulário de cadastro/edição
│       │   ├── AlunoCard.vue         # Card de aluno na chamada
│       │   ├── DashboardCards.vue    # Cards com indicadores
│       │   ├── ImportExportDialog.vue
│       │   └── EstatisticasDialog.vue
│       └── views/
│           ├── DashboardView.vue     # Página inicial
│           ├── AlunosView.vue        # Gerenciamento de alunos
│           └── ChamadaView.vue       # Chamada diária
└── README.md
```

## 🔌 API Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/health` | Health check |
| GET | `/api/turmas` | Listar turmas |
| POST | `/api/turmas` | Criar turma |
| PUT | `/api/turmas/:id` | Atualizar turma |
| DELETE | `/api/turmas/:id` | Remover turma |
| GET | `/api/criancas` | Listar crianças (opcional `?q=termo&turma_id=X`) |
| GET | `/api/criancas/:id` | Obter criança com responsáveis e endereço |
| POST | `/api/criancas` | Criar criança |
| PUT | `/api/criancas/:id` | Atualizar criança |
| DELETE | `/api/criancas/:id` | Remover criança |
| GET | `/api/frequencias?data=YYYY-MM-DD` | Frequência de uma data |
| POST | `/api/frequencias` | Registrar presença/ausência |
| GET | `/api/frequencias/dashboard?data=YYYY-MM-DD` | Dashboard |
| GET | `/api/frequencias/relatorios` | Relatórios dos últimos 30 dias |
| GET | `/api/export` | Exportar dados JSON |
| POST | `/api/import` | Importar dados JSON |
| DELETE | `/api/reset` | Resetar todos os dados |
| GET | `/api/estatisticas` | Estatísticas dos últimos 30 dias |

> **Nota:** Em produção as rotas são as mesmas (`/api/...`). Se `API_TOKEN` estiver configurada, toda chamada precisa do header `x-api-token`.

## 🎨 Tema

- **Primary**: `#8B4513` (Marrom)
- **Secondary**: `#FFD700` (Dourado)
- **Background**: `#f5f0eb` (Bege claro)
- **Font**: Montserrat

## 📱 Responsividade

O sistema se adapta a diferentes tamanhos de tela:
- **Desktop** (≥ 960px): Layout completo com navegação horizontal
- **Tablet** (600-959px): Grid adaptativo
- **Mobile** (< 600px): Menu hambúrguer, cards empilhados

## 🛠️ Desenvolvimento

### Comandos úteis

```bash
# Instalar tudo de uma vez
npm run install-all

# Verificar se o backend está funcionando
curl http://localhost:3000/api/health

# Build do frontend
cd frontend && npm run build
```

---

Desenvolvido com ❤️ por [Kayk Silva](https://github.com/kayksilvap-ctrl)