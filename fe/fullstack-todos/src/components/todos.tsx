import React, { useEffect } from "react";
import { fetchTodos, createTodo, deleteTodo, updateTodo } from "../features/todosSlice";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { Todo } from "../types/todo";

export const Todos: React.FC = () => {
  const dispatch = useAppDispatch();
  const todos = useAppSelector((state) => state.todos.todos);
  const status = useAppSelector((state) => state.todos.status);
  const error = useAppSelector((state) => state.todos.error);
  const  token  = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
     dispatch(fetchTodos());
    }
  }, [dispatch, token]);

  const handleCreateTodo = async () => {
    const newTitle = prompt('Enter new TODO title:');
    if (newTitle) {
        try {
            const result = await dispatch(createTodo(newTitle)).unwrap();
            console.log('Todo created successfully:', result);
        } catch (err: any) {
            console.error('Failed to create todo:', err);
            alert(`Error creating todo: ${err.message}`);
        }
    }
};

const handleToggleTodo = async (todo: Todo) => {
    try {
        await dispatch(updateTodo({
            id: todo.id,
            title: todo.title,
            done: !todo.done
        })).unwrap();
        void dispatch(fetchTodos());
    } catch (err: any) {
        console.error('Failed to toggle todo:', err);
    }
}

const handleEditTodo = async (todo: Todo) => {
    try {
        const newTitle = prompt('Enter new title:', todo.title);
        if (newTitle) {
            await dispatch(updateTodo({
                id: todo.id,
                title: newTitle,
                done: todo.done
            })).unwrap();
            void dispatch(fetchTodos());
        } 
    }catch (err: any) {
            console.error('Failed to edit todo:', err);
        }
    }

  const handleDeleteTodo = async (id: number) => {
    try {
      await dispatch(deleteTodo(id)).unwrap();
      void dispatch(fetchTodos());
    } catch (err) {
      console.error("Failed to delete the todo: ", err);
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <button onClick={handleCreateTodo}>Add Todo</button>
      {todos.map((todo) => (
        <div key={todo.id}>
            <input
            type="checkbox"
            checked={todo.done}
            onChange={() => handleToggleTodo(todo)}
            />
          <span>{todo.title}</span>
          <button onClick={() => handleEditTodo(todo)}>edit</button>
          <button onClick={() => handleDeleteTodo(todo.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};
