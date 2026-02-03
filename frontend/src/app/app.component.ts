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

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.carregarTarefas();
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
  }


  iniciarTimer() {
    console.log('Botão iniciar clicado!');
    if (this.estaRodando) return; //evita iniciar mais quando ja foi inicializado

    this.estaRodando = true;
    this.intervalo = setInterval(() => {
      if (this.tempoRestante > 0) {
        this.tempoRestante--;
      }
      else {
        this.pausarTimer();

        if (this.tarefaAtiva && this.tarefaAtiva.id) {
          this.taskService.incrementarCiclo(this.tarefaAtiva.id).subscribe({
            next: (tarefaAtualizada) => {
              this.carregarTarefas(); // Recarrega a lista para mostrar o novo número
              this.tarefaAtiva = tarefaAtualizada; // Atualiza a referência local
              alert(`Ciclo concluído para: ${tarefaAtualizada.title}`);
            },
            error: (err) => console.error('Erro ao salvar ciclo:', err)
          });
        } else {
          alert('Ciclo concluído! Nenhuma tarefa estava selecionada.');
        }
      }
    }, 1000);
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
