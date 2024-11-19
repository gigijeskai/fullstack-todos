import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import { Login } from './components/login';
import { Register } from './components/register';
import { Todos } from './components/todos';
import Navbar from './components/navbar';
import Users from './components/users';

// Protected Route Component
interface PrivateRouteProps {
  children: React.ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Public Route Component (redirects to /todos if already authenticated)
interface PublicRouteProps {
  children: React.ReactElement;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  if (isAuthenticated) {
    return <Navigate to="/todos" />;
  }
  
  return children;
};

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Router>
      <div className="App">
        <header>
          <h1>Fullstack Todos</h1>
        </header>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />

          {/* Protected Routes */}
          <Route 
            path="/todos" 
            element={
              <PrivateRoute>
                <Todos />
              </PrivateRoute>
            } 
          />

          {/* Protected Routes */}
          <Route 
            path="/users" 
            element={
              <PrivateRoute>
                <Users />
              </PrivateRoute>
            } 
          />

          {/* Root Route - Redirect based on auth status */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? <Navigate to="/todos" /> : <Navigate to="/login" />
            } 
          />

          {/* Catch all route - Redirect to root */}
          <Route 
            path="*" 
            element={<Navigate to="/" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;