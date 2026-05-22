# 🛡️ Sistema de Chamada/Frequência - Associação Anjo da Guarda

Sistema completo para gerenciamento de chamada e frequência de alunos, construído com **Vue 3 + Vuetify 3** (frontend) e **Node.js + Express + SQLite** (backend).

## ✨ Funcionalidades

- ✅ **Cadastro de Alunos** — Nome, idade, responsável, endereço, telefone
- ✅ **Chamada Diária** — Botões Presente (✓) e Ausente (✗) para cada aluno
- ✅ **Seletor de Data** — Faça chamada de dias diferentes
- ✅ **Dashboard** — Total de alunos, presentes/ausentes hoje, taxa de presença
- ✅ **Filtros** — Busca por nome, endereço ou idade
- ✅ **Exportar/Importar** — Backup e restauração de dados em JSON
- ✅ **Estatísticas** — Gráfico dos últimos 30 dias com taxas
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
| Banco | SQLite (persistência real) |
| Build | Vite 5 |

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

## 🎯 Execução

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

## 📁 Estrutura do Projeto

```
meu-projeto-docs/
├── package.json                      # Scripts raiz
├── backend/
│   ├── package.json
│   ├── server.js                     # Servidor Express (porta 3000)
│   ├── database.js                   # Configuração SQLite
│   ├── routes/
│   │   ├── alunos.js                 # CRUD de alunos
│   │   └── chamada.js                # Chamada, dashboard, export/import
│   └── data/
│       └── associacao.db             # Banco SQLite (criado automaticamente)
├── frontend/
│   ├── package.json
│   ├── vite.config.js                # Configuração Vite + proxy API
│   ├── index.html
│   └── src/
│       ├── main.js                   # Bootstrap da aplicação
│       ├── App.vue                   # Layout principal + modals globais
│       ├── api.js                    # Chamadas HTTP (axios)
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
| GET | `/api/alunos` | Listar alunos (opcional `?q=termo`) |
| GET | `/api/alunos/:id` | Obter aluno |
| POST | `/api/alunos` | Criar aluno |
| PUT | `/api/alunos/:id` | Atualizar aluno |
| DELETE | `/api/alunos/:id` | Remover aluno |
| GET | `/api/chamadas?data=YYYY-MM-DD` | Chamada de uma data |
| POST | `/api/chamadas` | Registrar presença/ausência |
| GET | `/api/chamadas/dashboard?data=YYYY-MM-DD` | Dashboard |
| GET | `/api/chamadas/estatisticas` | Estatísticas dos últimos 30 dias |
| GET | `/api/chamadas/export` | Exportar dados JSON |
| POST | `/api/chamadas/import` | Importar dados JSON |
| DELETE | `/api/chamadas/reset` | Resetar todos os dados |

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
```

---

Desenvolvido com ❤️ por [Kayk Silva](https://github.com/kayksilvap-ctrl)