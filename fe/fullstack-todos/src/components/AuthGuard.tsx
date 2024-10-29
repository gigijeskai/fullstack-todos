import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../hooks/hooks';

interface AuthGuardsProps {
    children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardsProps> = ({ children }) => {
    const { token } = useAppSelector((state) => state.auth);
    const location = useLocation();

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};