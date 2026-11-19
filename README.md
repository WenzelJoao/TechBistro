# TechBistro

Plataforma web full-stack para gestão de um bistrô: reservas online com disponibilidade em tempo real, cardápio digital, painel operacional com comandas, dashboard gerencial, exportação em PDF e auditoria completa com RBAC (`admin` / `funcionario`).

---

## Sumário

- [Stack](#stack)
- [Funcionalidades](#funcionalidades)
- [Árvore de diretórios](#árvore-de-diretórios)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e execução](#instalação-e-execução)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Contas de demonstração](#contas-de-demonstração)
- [Regras de negócio](#regras-de-negócio)
- [API](#api)
- [Palette e tipografia](#paleta-e-tipografia)
- [Build de produção](#build-de-produção)
- [Solução de problemas](#solução-de-problemas)

---

## Stack

**Frontend**

| Tecnologia | Uso |
| --- | --- |
| React 19 + Vite 8 | SPA e build otimizado |
| Tailwind CSS 3 + PostCSS | Design system responsivo (mobile-first) |
| React Router DOM 7 | Rotas públicas, protegidas e RBAC no cliente |
| Lucide React | Ícones |
| Axios | Cliente HTTP com interceptores de token/erro |
| jsPDF + jspdf-autotable | Relatório gerencial em PDF no navegador |

**Backend**

| Tecnologia | Uso |
| --- | --- |
| Node.js + Express 5 (ESM) | API REST |
| MySQL 8 (`mysql2/promise`) | Persistência com pool, transações e `dateStrings` |
| bcrypt | Hash de senhas |
| jsonwebtoken | Autenticação via Bearer token |
| dotenv | Configuração por ambiente |
| cors | Liberação controlada do frontend |

**Arquitetura em camadas**

```
routes → controllers → services → repositories → MySQL
              ↑            ↑
         middlewares    utils
```

- `controllers`: apenas validação de entrada e orquestração HTTP.
- `services`: todas as regras de negócio (disponibilidade, prazos, comandas, dashboard).
- `repositories`: SQL parametrizado e acesso a transações.
- `middlewares`: autenticação JWT, RBAC, 404 e tratamento global de erros.

---

## Funcionalidades

### Área pública

- Home com destaques do cardápio, diferenciais, horários e CTA de reserva.
- Cardápio digital filtrável por categoria, com tags (vegano, sem glúten etc.).
- Reserva em 3 etapas: data/pessoas → horário disponível → dados do cliente.
- Horários indisponíveis são exibidos com motivo e sugestões de alternativas próximas.
- Código único por reserva (`TB-YYYYMMDD-XXXX`), enviado na tela de confirmação.
- Consulta por código **ou** telefone, com alteração e cancelamento dentro do prazo.
- Botão flutuante de WhatsApp e links `wa.me` com mensagem pré-formatada.
- Toasts, skeletons/spinners e estados vazios em todas as operações.

### Área restrita

- Login com sessão persistida e refresh do perfil via `/auth/me`.
- **Funcionário:** visão geral, agendamentos (confirmar/cancelar) e comandas.
- **Admin:** tudo do funcionário + cardápio, mesas, configurações, auditoria, exclusões, PDF e **gestão de usuários/equipe**.
- **Equipe:** aba “Equipe / Usuários” exclusiva para admin, com cadastro (nome, e-mail, senha e perfil), listagem e auditoria de cada criação.
- Dashboard com KPIs, fluxo de salão, status das reservas e produtos mais pedidos.
- Exportação de relatório gerencial em PDF com filtro de período.
- Log de auditoria com usuário responsável, operação, referência e detalhes.

---

## Árvore de diretórios

```text
TechBistro/
├── README.md
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── schema.sql                         # DDL + seeds completos
│   └── src/
│       ├── app.js                         # Express: CORS, JSON, rotas, erros
│       ├── server.js                      # listen + teste de conexão MySQL
│       ├── config/
│       │   ├── db.js                      # Pool, transações, dateStrings
│       │   └── env.js
│       ├── routes/
│       │   ├── index.js                   # /api
│       │   ├── auth.routes.js
│       │   ├── reserva.routes.js
│       │   ├── menu.routes.js
│       │   ├── mesa.routes.js
│       │   ├── comanda.routes.js
│       │   ├── admin.routes.js
│       │   └── usuarioRoutes.js             # GET/POST /api/usuarios (admin)
│       ├── middlewares/
│       │   ├── authMiddleware.js          # authenticate
│       │   ├── roleMiddleware.js          # isAdmin / adminOnly / staffOnly
│       │   └── errorHandler.js            # notFoundHandler / errorHandler
│       ├── controllers/                   # auth, reserva, menu, mesa, comanda, admin
│       ├── services/                      # regras de negócio
│       ├── repositories/                  # SQL parametrizado
│       └── utils/                         # AppError, response, date, WhatsApp, etc.
└── frontend/
    ├── .env.example
    ├── index.html
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── main.jsx                       # Providers: Router → Auth → Toast
        ├── App.jsx                        # Rotas públicas/privadas
        ├── index.css                      # Tailwind + design tokens
        ├── services/                      # api.js + serviços por domínio
        ├── contexts/                      # AuthContext, ToastContext
        ├── hooks/                         # useAsync
        ├── utils/                         # formatters, pdf
        ├── components/
        │   ├── ui/                        # Button, Field, Modal, Spinner, badges...
        │   ├── layout/                    # Navbar, Footer, layouts, ProtectedRoute
        │   ├── reservas/                  # AlterarReservaModal
        │   └── admin/                     # KpiCard, FluxoChart, PageHeader, GerenciarUsuarios
        └── pages/
            ├── public/                    # Home, Cardápio, Reservar, Consulta, Login, 404
            └── private/                   # Dashboard, Agendamentos, Comandas, ÁreaInterna, Admin
```

---

## Pré-requisitos

- **Node.js** 18+ (recomendado 20 LTS) e npm
- **MySQL** 8.0+ em execução
- Naveador moderno com suporte a ES modules

---

## Instalação e execução

### 1. Banco de dados

Crie o banco e execute o schema com seeds:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS techbistro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p techbistro < backend/schema.sql
```

O `schema.sql` cria todas as tabelas, índices, foreign keys e já insere:

- 2 usuários (1 admin, 1 funcionário)
- 8 mesas
- 5 clientes
- 10 produtos
- 5 reservas de exemplo
- comandas/itens, configurações, horários e logs de auditoria

> **Importante:** o MySQL deve estar com `utf8mb4` para acentos e emojis. Ajuste `DB_USER`, `DB_PASSWORD` e `DB_NAME` no `.env`.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env      # Windows: copy .env.example .env
# edite .env com suas credenciais do MySQL
npm run dev
```

API disponível em **http://localhost:3001/api** (healthcheck: `/api/health`).

### 3. Frontend

Em outro terminal:

```bash
cd frontend
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run dev
```

Aplicação disponível em **http://localhost:5173**.

> O `npm run dev` do backend usa `node --watch` (se configurado no `package.json`); caso contrário, use `npm start` / `node src/server.js`.

---

## Variáveis de ambiente

### `backend/.env`

```env
# Servidor
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=senha_do_mysql
DB_NAME=techbistro

# Autenticação JWT
JWT_SECRET=troque_este_secret_por_uma_chave_longa_e_aleatoria
JWT_EXPIRES_IN=8h
```

### `frontend/.env`

```env
VITE_API_URL=http://localhost:3001/api
```

---

## Contas de demonstração

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Administrador | `admin@techbistro.com.br` | `Admin@123` |
| Funcionário | `funcio@techbistro.com.br` | `Func@123` |

As senhas estão armazenadas como hashes bcrypt reais no `schema.sql`.

---

## Regras de negócio

- **Bloqueio por mesa:** cada reserva ocupa sua mesa por 90 minutos (configurável em `configuracoes.duracao_reserva_minutos`). Conflitos são calculados com intervalo semiaberto `[início, fim)`.
- **Menor mesa possível:** o sistema escolhe a menor mesa que atende ao número de pessoas e que não esteja conflitante.
- **Limite global:** `ocupantes + pessoas` não pode ultrapassar `capacidade_por_horario` para faixas sobrepostas; quando excede, o motivo `LIMITE_ATINGIDO` é devolvido.
- **Slots:** gerados entre abertura e fechamento do dia da semana, respeitando `intervalo_minutos`.
- **Dias fechados:** horários inativos geram erro `DIA_FECHADO` com sugestão de datas próximas na UI.
- **Código único:** `TB-YYYYMMDD-XXXX`, usado para consulta e alteração/cancelamento pelo cliente.
- **Prazo:** `cancelamento_horas` define até quando o cliente pode alterar ou cancelar; a API devolve `pode_alterar` e `pode_cancelar`.
- **Confirmação:** ao confirmar, o backend gera o link `wa.me/<DDI+numero>` com a mensagem:
  `Olá, [Nome]! Sua reserva no TechBistro está confirmada para [Data] às [Horário] (Mesa [X] para [Y] pessoas).`
- **Auditoria:** criação, confirmação, cancelamento, alteração de mesa/data, exclusões, comandas, configurações e criação de usuários são registrados com usuário e referência.
- **Usuários:** e-mail único, senha com mínimo de 6 caracteres armazenada com `bcrypt` (custo 10) e perfil estrito (`admin` ou `funcionario`). A criação grava quem criou a conta e o cargo atribuído em `logs_auditoria`, na mesma transação do INSERT.
- **RBAC:** apenas admin edita histórico, cardápio, mesas, horários, vê dashboard, PDF, auditoria e gerencia a equipe; funcionário opera agendamentos e comandas.

---

## API

Base URL: `http://localhost:3001/api`

### Formato padrão

```json
// Sucesso
{ "success": true, "data": { }, "message": "Mensagem opcional" }

// Erro
{ "success": false, "error": { "code": "CODIGO", "message": "Descrição", "details": {} } }
```

### Endpoints

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| GET | `/health` | público | Healthcheck |
| POST | `/auth/login` | público | Login (retorna token + usuário) |
| GET | `/auth/me` | autenticado | Perfil da sessão |
| GET | `/reservas/disponibilidade?data&pessoas` | público | Slots e mesas sugeridas |
| POST | `/reservas` | público | Criar reserva |
| GET | `/reservas/consulta?termo` | público | Consultar por código ou telefone |
| PATCH | `/reservas/:id/cancelar-publico` | público | Cancelar com termo de propriedade |
| PATCH | `/reservas/:id/alterar-publico` | público | Alterar data/horário/pessoas |
| GET | `/reservas` | staff | Listar com filtros `data`/`status` |
| PATCH | `/reservas/:id/confirmar` | staff | Confirmar e gerar link do WhatsApp |
| PATCH | `/reservas/:id/cancelar` | staff | Cancelar |
| PATCH | `/reservas/:id/mesa` | admin | Alterar mesa |
| DELETE | `/reservas/:id` | admin | Excluir histórico |
| GET | `/menu` | público | Cardápio ativo |
| GET/POST/PUT/DELETE | `/menu` | admin | Gestão do cardápio |
| GET/POST/PUT/DELETE | `/mesas` | staff/admin | Gestão de mesas |
| GET/POST | `/comandas` | staff | Listar/abrir comandas |
| POST | `/comandas/:id/itens` | staff | Adicionar item |
| PATCH | `/comandas/:id/fechar` | staff | Encerrar comanda |
| DELETE | `/comandas/:id` | admin | Excluir comanda |
| GET | `/admin/dashboard` | admin | KPIs, fluxo, status e produtos |
| GET | `/admin/logs` | admin | Log de auditoria |
| GET/PUT | `/admin/configuracoes` | admin | Regras e horários |
| GET | `/admin/usuarios` | admin | Usuários do sistema (compatibilidade) |
| GET | `/usuarios` | admin | Listar equipe (id, nome, e-mail, cargo, criação) |
| POST | `/usuarios` | admin | Criar usuário (bcrypt + auditoria); 409 se e-mail duplicado |

Autenticação: enviar `Authorization: Bearer <token>` nas rotas protegidas.

---

## Paleta e tipografia

| Função | Cor |
| --- | --- |
| Primária / fundo | `#292B2F` (graphite) |
| Secundária / superfície | `#F2EDE3` (ivory) |
| Destaque / CTA | `#B89558` (gold) |

- Títulos: **Playfair Display**
- Texto/UI: **Inter**
- Proporção visual aproximada: 70% graphite, 20% ivory, 10% gold.

---

## Build de produção

```bash
# frontend
cd frontend
npm run build       # gera frontend/dist
npm run preview     # serve o build localmente

# backend
cd backend
npm start           # ou node src/server.js
```

Para servir o frontend pelo mesmo domínio em produção, configure um reverse proxy (Nginx, por exemplo) encaminhando `/api` para a porta `3001` e o restante para os arquivos estáticos de `frontend/dist`.

---

## Solução de problemas

| Sintoma | Verificação |
| --- | --- |
| `ECONNREFUSED` no frontend | Backend não está rodando ou `VITE_API_URL` incorreto |
| `Access-Control-Allow-Origin` | `CORS_ORIGIN` no `.env` do backend deve ser `http://localhost:5173` |
| `Access denied for user` | Credenciais MySQL em `backend/.env` |
| Reserva não aparece/seeds ausentes | Execute `backend/schema.sql` no banco configurado |
| `DIA_FECHADO` | Verifique `horarios_funcionamento` em Configurações |
| Telas em branco | Abra o console e confirme se a API responde em `/api/health` |
| PDF não gera | Confirme `jspdf` e `jspdf-autotable` instalados (`npm ls jspdf jspdf-autotable`) |

---

Desenvolvido para o TechBistro — reservas, operação e gestão em uma única experiência.
