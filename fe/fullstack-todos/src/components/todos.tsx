import React, { useEffect, useState } from "react";
import { fetchTodos, createTodo, deleteTodo, updateTodo, clearError } from "../features/todosSlice";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { Todo } from "../types/todo";

export const Todos: React.FC = () => {
  const dispatch = useAppDispatch();
  const { todos, status, error } = useAppSelector((state) => state.todos);
  const  token  = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token) {
    void dispatch(fetchTodos());
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (error) {
      alert(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleCreateTodo = async () => {
    const newTitle = prompt('Enter new TODO title:');
    if (newTitle) {
        setIsLoading(true);
        try {
            await dispatch(createTodo(newTitle)).unwrap();
        } finally {
            setIsLoading(false);
        }
    }
};

const handleToggleTodo = async (todo: Todo) => {
  setIsLoading(true);
  try {
      await dispatch(updateTodo({
          id: todo.id,
          title: todo.title,
          done: !todo.done
      })).unwrap();
  } finally {
      setIsLoading(false);
  }
};

const handleEditTodo = async (todo: Todo) => {
  const newTitle = prompt('Enter new title:', todo.title);
  if (newTitle) {
      setIsLoading(true);
      try {
          await dispatch(updateTodo({
              id: todo.id,
              title: newTitle,
              done: todo.done
          })).unwrap();
      }  finally {
          setIsLoading(false);
      }
  }
};

  const handleDeleteTodo = async (id: number) => {
    setIsLoading(true);
    try {
      await dispatch(deleteTodo(id)).unwrap();
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <button 
      onClick={handleCreateTodo} 
      disabled={isLoading}
      >
        Add Todo
        </button>
      {todos.map((todo) => (
        <div key={todo.id}>
            <input
            type="checkbox"
            checked={todo.done}
            onChange={() => handleToggleTodo(todo)}
            disabled={isLoading}
            />
          <span>{todo.title}</span>
          <button onClick={() => handleEditTodo(todo)} disabled={isLoading} >edit</button>
          <button onClick={() => handleDeleteTodo(todo.id)} disabled={isLoading} >Delete</button>
        </div>
      ))}
    </div>
  );
};
