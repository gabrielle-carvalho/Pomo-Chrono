const express = require('express');
const cors = require('cors');
const pool = require('./config/db'); //banco conversando com node

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000; //tem que botar url do banco aqui e no .env

app.use(cors());
app.use(express.json()); // permite que o node entenda o json no corpo das requisições

app.get('/', (req, res) => {
    res.send('Pomo Chrono API is running');
});

app.post('/tasks', async(req, res) => {
    try{
        const { title, description, total_cycles_required } = req.body;
        if (!title || title.trim() === "") {
            return res.status(400).json({ error: "O título da tarefa é obrigatório." });
        }
        if (total_cycles_required && total_cycles_required <= 0) {
            return res.status(400).json({ error: "O número de ciclos deve ser maior que zero." });
        }
        const newTask = await pool.query(
            "INSERT INTO tasks (title, description, total_cycles_required) VALUES ($1, $2, $3) RETURNING *",
            [title, description, total_cycles_required || 1]
        );
        res.status(201).json(newTask.rows[0]);
    } catch (err){
        console.error(err.message);
        res.status(500).send("erro no servidor ao criar a tarefa")
    }
});

// Listar todas as tarefas
app.get('/tasks', async (req, res) => {
    try {
    const allTasks = await pool.query("SELECT * FROM tasks ORDER BY created_at DESC");
    res.json(allTasks.rows);
    } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erro ao buscar tarefas." });
    }
});

app.listen(PORT, () => { //expressao lambda que nao recebe nenhum parametro
    console.log(`Server is listening port ${PORT}`);
});

app.delete('/tasks/:id', async (req, res) => {
    try {
    const { id } = req.params;
    const deleteTask = await pool.query("DELETE FROM tasks WHERE id = $1", [id]);

    if (deleteTask.rowCount === 0) {
        return res.status(404).json({ error: "Tarefa não encontrada" });
    }

    res.status(204).send(); // Sucesso, sem conteúdo para retornar
    } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Erro ao deletar tarefa" });
    }
});

// Incrementar ciclo de uma tarefa específica
app.patch('/tasks/:id/increment', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      UPDATE tasks
      SET
        completed_cycles = completed_cycles + 1,
        status = CASE
          WHEN completed_cycles + 1 >= total_cycles_required THEN 'done'
          ELSE 'doing'
        END
      WHERE id = $1 AND status != 'done' AND completed_cycles < total_cycles_required
      RETURNING *`;

    const result = await pool.query(query, [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar ciclo e status" });
  }
});

app.put('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, total_cycles_required } = req.body;

        const updateTask = await pool.query(
            "UPDATE tasks SET title = $1, description = $2, total_cycles_required = $3 WHERE id = $4 RETURNING *",
            [title, description, total_cycles_required, id]
        );

        if (updateTask.rowCount === 0) {
            return res.status(404).json({ error: "Tarefa não encontrada" });
        }

        res.json(updateTask.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Erro interno no servidor" });
    }
});
