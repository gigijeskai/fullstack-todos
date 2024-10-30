import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {Todos} from './components/todos';
import { Login } from './components/login';
import { AuthGuard } from './components/AuthGuard';
import { Register } from './components/register';

function App() {
  return (
      <BrowserRouter>
          <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                  path="/register"
                  element={
                      <AuthGuard>
                          <Todos />
                      </AuthGuard>
                  }
              />
          </Routes>
      </BrowserRouter>
  );
}

export default App;
