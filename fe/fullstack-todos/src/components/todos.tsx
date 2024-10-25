import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTodos, createTodo, deleteTodo } from "../features/todosSlice";
import { RootState } from "../store/store";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";

export const Todos: React.FC = () => {
  const dispatch = useAppDispatch();
  const todos = useAppSelector((state) => state.todos.todos);
  const status = useAppSelector((state) => state.todos.status);
  const error = useAppSelector((state) => state.todos.error);

  useEffect(() => {
    if (status === "idle") {
      void dispatch(fetchTodos());
    }
  }, [dispatch, status]);

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
          <span>{todo.title}</span>
          <button onClick={() => handleDeleteTodo(todo.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};
