export interface Todo {
  id: number;
  title: string;
  done: boolean;
}

export interface TodosState {
  todos: Todo[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}