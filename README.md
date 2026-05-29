# CreativeFlow

Sistema híbrido de produtividade desenvolvido para designers gráficos, profissionais criativos, freelancers e profissionais de UI/UX.

O CreativeFlow centraliza organização de tarefas, gerenciamento de projetos, agenda criativa, clientes e referências visuais em uma única plataforma.

---

## Sobre o Projeto

O CreativeFlow foi desenvolvido com o objetivo de solucionar a fragmentação de ferramentas utilizadas por profissionais criativos no dia a dia.

Muitos designers utilizam diferentes plataformas para controlar:

- tarefas
- projetos
- agenda
- clientes
- inspirações
- produtividade

O sistema busca unificar essas funcionalidades em um ambiente organizado, visual e adaptável ao fluxo criativo.

---

## Principais Funcionalidades

### Autenticação

- Cadastro de usuário
- Login
- Controle de sessão

### Workspace Inteligente

- Criação de workspaces
- Onboarding guiado
- Templates automáticos
- Salvamento de progresso

### Gerenciamento de Tarefas

- Sistema Kanban
- Criação de tarefas
- Edição e exclusão
- Prioridades
- Organização por etapas

### Agenda Criativa

- Planejamento diário
- Blocos de foco
- Organização temporal de atividades

### Gestão de Clientes

- Cadastro de clientes
- Informações de contato
- Organização por workspace

### Inspirações

- Biblioteca visual
- Links e referências
- Organização criativa

### Responsividade

- Compatível com desktop
- Compatível com dispositivos móveis
- Estrutura preparada para PWA

---

## Tecnologias Utilizadas

### Frontend

- Nuxt 3
- Vue 3
- Tailwind CSS
- Pinia

### Backend

- NestJS
- Prisma ORM

### Banco de Dados

- PostgreSQL

### Ferramentas

- Git
- GitHub
- VSCode

---

## Estrutura do Projeto

```txt
creativeflow/

├── frontend/
│   ├── pages/
│   ├── components/
│   ├── layouts/
│   ├── stores/
│   └── services/
│
├── backend/
│   ├── modules/
│   ├── controllers/
│   ├── services/
│   ├── prisma/
│   └── auth/
│
└── database/
    └── schema.prisma
```

---

## Arquitetura Simplificada

```txt
Usuário
   ↓
Frontend (Nuxt)
   ↓
Backend API (NestJS)
   ↓
Prisma ORM
   ↓
PostgreSQL
```

---

## Modelagem Simplificada

### User

Responsável pelos usuários cadastrados.

Campos principais:

- id
- name
- email
- password

### Workspace

Espaço principal de organização do sistema.

Campos principais:

- id
- user_id
- name
- workspace_type
- status

### Board

Estrutura visual de organização.

Campos principais:

- id
- workspace_id
- title

### Task

Gerenciamento de tarefas.

Campos principais:

- id
- board_id
- title
- priority
- deadline

### Client

Cadastro de clientes.

Campos principais:

- id
- workspace_id
- name
- email
- phone

### Inspiration

Biblioteca de referências.

Campos principais:

- id
- workspace_id
- title
- image_url

---

## Regras de Negócio

- Todo workspace deve possuir pelo menos um board.
- O onboarding pode ser interrompido e salvo.
- Templates criam estruturas automáticas.
- Boards podem possuir diferentes layouts.
- Workspaces arquivados permanecem salvos no sistema.

---

## Como Executar o Projeto

### Clonar Repositório

```bash
git clone URL_DO_REPOSITORIO
```

### Instalar Dependências

Frontend:

```bash
cd frontend
npm install
```

Backend:

```bash
cd backend
npm install
```

### Configurar Variáveis de Ambiente

Criar arquivo `.env`.

Exemplo:

```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/creativeflow
JWT_SECRET=secret
```

### Rodar Banco de Dados

```bash
npx prisma migrate dev
```

### Executar Aplicação

Frontend:

```bash
npm run dev
```

Backend:

```bash
npm run start:dev
```

---

## Roadmap

### MVP

- autenticação
- onboarding
- workspaces
- kanban
- tarefas
- clientes
- inspirações

### Futuras Melhorias

- analytics
- notificações
- colaboração
- inteligência artificial
- financeiro
- automações

---

## Objetivo Acadêmico

- engenharia de software
- arquitetura de sistemas
- banco de dados
- desenvolvimento web
- testes
- documentação técnica

---

Projeto acadêmico e experimental desenvolvido para fins de estudo, prática profissional e validação de solução tecnológica.
