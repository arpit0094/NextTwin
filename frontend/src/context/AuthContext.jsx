import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('nt_user');
    const token  = localStorage.getItem('nt_token');
    if (stored && token) {
      try { setUser(JSON.parse(stored)); } catch { logout(); }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('nt_token', data.access_token);
    const userObj = { id: data.user_id, name: data.name, email };
    localStorage.setItem('nt_user', JSON.stringify(userObj));
    setUser(userObj);
    return userObj;
  };

  const register = async (name, email, password) => {
    const { data } = await authAPI.register({ name, email, password });
    localStorage.setItem('nt_token', data.access_token);
    const userObj = { id: data.user_id, name: data.name, email };
    localStorage.setItem('nt_user', JSON.stringify(userObj));
    setUser(userObj);
    return userObj;
  };

  const logout = () => {
    localStorage.removeItem('nt_token');
    localStorage.removeItem('nt_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
