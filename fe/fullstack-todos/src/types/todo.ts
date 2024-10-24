export interface Todo {
  id: number;
  title: string;
  done: boolean;
}

export interface TodosState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
}