export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: string;
}

export interface TaskFilters {
  status?: string;
  priority?: string;
}
