export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string; // ISO 8601
  updatedAt: string;
  subtaskCount: number;
}

export interface Subtask {
  id: string;
  parentTaskId: string;
  title: string;
  status: TaskStatus;
  createdAt: string;
}

export type CreateTaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtaskCount'>;
export type UpdateTaskInput = Partial<CreateTaskInput>;
