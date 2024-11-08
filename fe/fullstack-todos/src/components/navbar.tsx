import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import Logout from './logout';

export const Navbar: React.FC = () => {
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const location = useLocation();

    return (
    <nav>
        <ul>
            {!isAuthenticated && (
                <>
                <li>
                    <Link to="/login" >Login</Link>
                </li>
                <li>
                    <Link to="/register" >Register</Link>
                </li>
                </>
            )}
            {isAuthenticated && (
                <>
                <li>
                    <Link to="/todos" >Todos</Link>
                </li>
                <li>
                    <Link to="/users" >Users</Link>
                </li>
                <li>
                    <Logout />
                </li>
                </>
            )}
        </ul>
    </nav>    
    );
}

export default Navbar;