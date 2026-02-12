import React, { useState, useEffect, useContext, createContext } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Setup from './pages/Setup';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { User, Group } from './types';
import { validateToken } from './services/mockBackend';

// Auth Context
interface AuthContextType {
  user: User | null;
  group: Group | null;
  loading: boolean;
  login: (token: string, user: User, group: Group) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  updateGroup: (updates: Partial<Group>) => void;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  group: null, 
  loading: true, 
  login: () => {}, 
  logout: () => {},
  updateUser: () => {},
  updateGroup: () => {}
});

export const useAuth = () => useContext(AuthContext);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth from Token
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('syncup_token');
      if (token) {
        try {
          const result = await validateToken(token);
          if (result) {
            setUser(result.user);
            setGroup(result.group);
          } else {
            // Invalid token
            localStorage.removeItem('syncup_token');
          }
        } catch (error) {
          console.error("Session validation failed", error);
          localStorage.removeItem('syncup_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (token: string, newUser: User, newGroup: Group) => {
    localStorage.setItem('syncup_token', token);
    setUser(newUser);
    setGroup(newGroup);
  };

  const logout = () => {
    localStorage.removeItem('syncup_token');
    setUser(null);
    setGroup(null);
    window.location.hash = '/';
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) setUser({ ...user, ...updates });
  };

  const updateGroup = (updates: Partial<Group>) => {
    if (group) setGroup({ ...group, ...updates });
  };

  return (
    <AuthContext.Provider value={{ user, group, loading, login, logout, updateUser, updateGroup }}>
      <Router>
        <Layout user={user} onLogout={logout}>
          <Routes>
            <Route path="/" element={<Landing />} />
            
            <Route path="/setup" element={
              <ProtectedRoute>
                <Setup />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin={true}>
                <Admin />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

             {/* Catch all redirect */}
             <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
