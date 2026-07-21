import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('memora_token');
    const savedUser = localStorage.getItem('memora_user');
    if (token && savedUser && savedUser !== 'undefined') {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('memora_user');
      }

      api.get('/auth/me').then(res => {
        const u = res.data?.data?.user || res.data?.user;
        if (u) {
          setUser(u);
          localStorage.setItem('memora_user', JSON.stringify(u));
        }
      }).catch(() => {
        localStorage.removeItem('memora_token');
        localStorage.removeItem('memora_user');
        setUser(null);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const token = res.data?.data?.accessToken || res.data?.token;
    const userData = res.data?.data?.user || res.data?.user;
    localStorage.setItem('memora_token', token);
    localStorage.setItem('memora_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const token = res.data?.data?.accessToken || res.data?.token;
    const userData = res.data?.data?.user || res.data?.user;
    localStorage.setItem('memora_token', token);
    localStorage.setItem('memora_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('memora_token');
    localStorage.removeItem('memora_user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('memora_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
