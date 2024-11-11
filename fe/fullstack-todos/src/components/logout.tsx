import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/authSlice';
import { AppDispatch, RootState } from '../store/store';

const LogoutButton: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { status } = useSelector((state: RootState) => state.auth);

    const handleLogout = async () => {
        try {
            await dispatch(logout()).unwrap();
            navigate('/login');
        } catch (err) {
            console.error('Failed to logout:', err);
            navigate('/login');
        }
    };

    return (
        <button onClick={handleLogout} disabled={status === 'loading'}>{status === 'loading' ? 'Logging out...' : 'Logout'}</button>
    );
}

export default LogoutButton;