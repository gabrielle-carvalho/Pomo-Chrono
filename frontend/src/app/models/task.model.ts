export interface Task {
  id?: number;
  title: string;
  description: string;
  completed_cycles: number;
  total_cycles_required: number;
  status: 'pending' | 'doing' | 'done';
}
