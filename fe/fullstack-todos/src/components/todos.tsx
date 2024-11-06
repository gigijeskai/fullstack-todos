import React, { useEffect, useState } from "react";
import { fetchTodos, createTodo, deleteTodo, updateTodo, clearError } from "../features/todosSlice";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { Todo } from "../types/todo";

export const Todos: React.FC = () => {
    const dispatch = useAppDispatch();
    const { todos, status, error } = useAppSelector((state) => state.todos);
    const token = useAppSelector((state) => state.auth);
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
            } finally {
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

    if (status === 'loading' || isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-4">
            <button 
                className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                onClick={handleCreateTodo}
                disabled={isLoading}
            >
                Add Todo
            </button>
            <div className="space-y-2">
                {todos.map((todo) => (
                    <div key={todo.id} className="flex items-center space-x-4 p-2 border rounded">
                        <input
                            type="checkbox"
                            checked={todo.done}
                            onChange={() => handleToggleTodo(todo)}
                            disabled={isLoading}
                            className="h-4 w-4"
                        />
                        <span className={todo.done ? 'line-through' : ''}>
                            {todo.title}
                        </span>
                        <button 
                            onClick={() => handleEditTodo(todo)}
                            disabled={isLoading}
                            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
                        >
                            Edit
                        </button>
                        <button 
                            onClick={() => handleDeleteTodo(todo.id)}
                            disabled={isLoading}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};