import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { register } from '../features/authSlice'
import { useNavigate } from 'react-router-dom';

export const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const status = useAppSelector(state => state.auth.status);
    const error = useAppSelector(state => state.auth.error);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await dispatch(register({ email, password })).unwrap();
            navigate('/login'); // Redirect to home after login
        } catch (err) {
            console.error('Failed to login:', err);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Email:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div>
                <label>Password:</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            {error && <div className="error">{error}</div>}
            <button type="submit" disabled={status === 'loading'}>
                {status === 'loading' ? 'Registering...' : 'Register'}
            </button>
        </form>
    );
}