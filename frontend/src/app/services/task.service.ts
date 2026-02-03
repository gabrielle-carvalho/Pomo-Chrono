import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:3000/tasks';

  constructor(private http: HttpClient) { }

  getTasks(): Observable<Task[]> { //busca tds tarefas
    return this.http.get<Task[]>(this.apiUrl);
  }

  addTask(task: Task): Observable<Task> { //cria nova tarefa
    return this.http.post<Task>(this.apiUrl, task);
  }
  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  incrementarCiclo(id: number): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}/increment`, {});
  }
}
