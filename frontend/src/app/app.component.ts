import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from './models/task.model';
import { TaskService } from './services/task.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  tempoPadrao: number = 1 * 60; // tempo * segundos
  tempoRestante: number = this.tempoPadrao;
  intervalo: any;
  estaRodando: boolean = false;
  listaDeTarefas: Task[] = [];
  tarefaAtiva: Task | null = null;
  cicloPendente: boolean = false;
  tarefaEmEdicao: Task | null = null;
  esquemaSelecionado: boolean = false;
  estaEmDescanso: boolean = false;

  opcoesEsquema = [
    { nome: 'Foco Longo (60 min)', valor: 60 },
    { nome: 'Foco (50 min)', valor: 50 },
    { nome: 'Foco Curto (30 min)', valor: 30 },
    { nome: 'Teste Rápido (1 min)', valor: 1 }
  ];

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.carregarTarefas();
  }

  selecionarEsquema(minutos: number) {
    this.tempoPadrao = minutos * 60;
    this.tempoRestante = this.tempoPadrao;
    this.esquemaSelecionado = true;
    this.estaEmDescanso = false;
  }

  voltarParaSelecao() {
    this.pausarTimer();
    this.esquemaSelecionado = false;
  }

  carregarTarefas() {
    this.taskService.getTasks().subscribe({
      next: (dados) => {
        this.listaDeTarefas = dados;
        console.log('Tarefas carregadas:', dados);
      },
      error: (erro) => console.error('Erro ao buscar tarefas:', erro)
    });
  }

  selecionarTarefa(task: Task) {
    this.tarefaAtiva = task;
    if (this.cicloPendente && task.status !== 'done') {
      if (confirm(`Deseja atribuir o ciclo finalizado à tarefa "${task.title}"?`)) {
        this.confirmarCiclo(task.id!);
        this.resetarTimer();
      }
    }
  }

  iniciarTimer() {
  if (this.estaRodando) return; //evita iniciar mais quando ja foi inicializado
  this.estaRodando = true;
  this.intervalo = setInterval(() => {
    if (this.tempoRestante > 0) {
      this.tempoRestante--;
    } else {
      this.pausarTimer();
      this.alternarFase();
    }
  }, 1000);
  }

  alternarFase() {
    if (!this.estaEmDescanso) {
      if (this.tarefaAtiva && this.tarefaAtiva.id) {
        this.confirmarCiclo(this.tarefaAtiva.id);
      } else {
        this.cicloPendente = true;
        alert('Ciclo concluído! Selecione uma tarefa para atribuir o tempo.');
      }

      this.estaEmDescanso = true;
      const minutosDescanso = this.tempoPadrao <= 60 ? 1 : 5;
      this.tempoRestante = minutosDescanso * 60;
      alert(`Hora de relaxar! Iniciando ${minutosDescanso} min de descanso.`);
    } else {
      this.estaEmDescanso = false;
      this.tempoRestante = this.tempoPadrao;
      alert('O descanso acabou. Vamos voltar ao trabalho?');
    }
  }

  confirmarCiclo(id: number) {
    this.taskService.incrementarCiclo(id).subscribe({
      next: (tarefaAtualizada) => {
        this.carregarTarefas();
        if (this.tarefaAtiva?.id === id) this.tarefaAtiva = tarefaAtualizada;
        this.cicloPendente = false;
        alert(`Ciclo concluído para: ${tarefaAtualizada.title}`);
      },
      error: (err) => console.error('Erro ao salvar ciclo:', err)
    });
  }

  prepararEdicao(task: Task) {
    this.tarefaEmEdicao = { ...task }; // Cria cópia para não alterar a lista original antes de salvar
  }

  cancelarEdicao() {
    this.tarefaEmEdicao = null;
  }

  salvarEdicao() {
  if (this.tarefaEmEdicao && this.tarefaEmEdicao.id) {
    this.taskService.updateTask(this.tarefaEmEdicao.id, this.tarefaEmEdicao).subscribe({
      next: (tarefaAtualizada) => {
        const index = this.listaDeTarefas.findIndex(t => t.id === tarefaAtualizada.id);
        if (index !== -1) {
          this.listaDeTarefas[index] = tarefaAtualizada;
        }
        this.tarefaEmEdicao = null;
        alert('Tarefa atualizada com sucesso!');
      },
      error: (err) => {
        console.error('Erro ao atualizar:', err);
        alert('Erro ao salvar: Verifique se o backend está rodando na porta 3000');
      }
    });
  }
}


  pausarTimer() {
    clearInterval(this.intervalo);
    this.estaRodando = false;
  }

  resetarTimer() {
    this.pausarTimer();
    this.tempoRestante = this.tempoPadrao;
  }

  // Helper para formatar o tempo na tela
  formatarTempo(): string {
    const minutos = Math.floor(this.tempoRestante / 60);
    const segundos = this.tempoRestante % 60;
    return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  }

  novaTarefa: Task = {
    title: '',
    description: '',
    total_cycles_required: 1,
    completed_cycles: 0,
    status: 'pending'
  };

  salvarTarefa() {
    this.taskService.addTask(this.novaTarefa).subscribe({
      next: (tarefaSalva) => {
        this.listaDeTarefas.unshift(tarefaSalva); // Adiciona no topo da lista
        this.resetarFormulario();
      },
      error: (err) => alert(err.error.error || "Erro ao salvar") // Mostra o erro 400 do Node!
    });
  }

  resetarFormulario() {
    this.novaTarefa = { title: '', description: '', total_cycles_required: 1, completed_cycles: 0, status: 'pending' };
  }

  excluirTarefa(id: number | undefined) {
  if (!id) return;

  if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
    this.taskService.deleteTask(id).subscribe({
      next: () => {
        // Remove da lista local para atualizar a tela instantaneamente
        this.listaDeTarefas = this.listaDeTarefas.filter(t => t.id !== id);
      },
      error: (err) => console.error('Erro ao deletar:', err)
    });
  }
}

}
