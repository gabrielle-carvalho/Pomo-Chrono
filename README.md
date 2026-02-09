# Pomo-Chrono ⏱️

O **Pomo-Chrono** é uma aplicação de gestão de tempo baseada na técnica
Pomodoro. Ele permite criar tarefas, definir ciclos de foco e acompanhar
o progresso em tempo real com um temporizador personalizável.

## 🚀 Funcionalidades

-   **Gestão de Tarefas (CRUD):** Criação, listagem, edição e exclusão
    de tarefas.
-   **Temporizador Pomodoro:** Opções de foco de 60, 50, 30 e 1 minuto
    (para testes).
-   **Controle de Ciclos:** Atribuição de ciclos concluídos às tarefas
    com atualização de status automática para `done`.
-   **Fases de Descanso:** Alternância entre períodos de foco e
    descanso.
-   **Persistência:** Integração com banco de dados PostgreSQL.

------------------------------------------------------------------------

## 🛠️ Tecnologias Utilizadas

### Backend

-   **Node.js** & **Express**
-   **PostgreSQL** (via biblioteca `pg`)
-   **Dotenv** para variáveis de ambiente
-   **Nodemon** para desenvolvimento

### Frontend

-   **Angular 19**
-   **TypeScript**
-   **RxJS** para chamadas assíncronas

------------------------------------------------------------------------

## ⚙️ Instalação e Configuração

### 1. Configuração do Backend

Navegue até a pasta do servidor:

``` bash
cd backend
npm install
```

Crie um arquivo `.env` na pasta `backend` com suas credenciais:

``` env
PORT=3000
DB_USER=gabi
DB_HOST=localhost
DB_NAME=pomochrono
DB_PASSWORD=******
DB_PORT=5432
```

Inicie o servidor:

``` bash
npm run dev
```

------------------------------------------------------------------------

### 2. Configuração do Frontend

Navegue até a pasta do cliente:

``` bash
cd frontend
npm install
```

Inicie a aplicação Angular:

``` bash
npm start
```

------------------------------------------------------------------------

## 📝 Endpoints da API

-   `GET /tasks` --- Lista todas as tarefas
-   `POST /tasks` --- Cria uma nova tarefa
-   `PUT /tasks/:id` --- Atualiza uma tarefa existente
-   `PATCH /tasks/:id/increment` --- Incrementa um ciclo e atualiza o
    status
-   `DELETE /tasks/:id` --- Remove uma tarefa
