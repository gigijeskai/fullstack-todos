import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTodos, createTodo, deleteTodo } from '../features/todosSlice';
import { RootState } from '../store/store';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';

export const Todos: React.FC = () => {
    const dispatch = useAppDispatch();
    const { todos, loading, error } = useAppSelector(state => state.todos);
  
    useEffect(() => {
      void dispatch(fetchTodos());
    }, [dispatch]);
  
    const handleCreateTodo = () => {
      const newTitle = prompt('Enter new TODO title:');
      if (newTitle) {
        void dispatch(createTodo(newTitle));
      }
    };
  
    const handleDeleteTodo = (id: number) => {
      void dispatch(deleteTodo(id));
    };
  
    if (loading) {
      return <div>Loading...</div>;
    }
  
    if (error) {
      return <div>Error: {error}</div>;
    }
  
    return (
      <div>
        <button onClick={handleCreateTodo}>Add Todo</button>
        {todos.map(todo => (
          <div key={todo.id}>
            <span>{todo.title}</span>
            <button onClick={() => handleDeleteTodo(todo.id)}>Delete</button>
          </div>
        ))}
      </div>
    );
  };
