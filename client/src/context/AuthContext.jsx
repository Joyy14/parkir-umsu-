import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('parkir_user');
    const token = localStorage.getItem('parkir_token');

    if (storedUser && token) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setProfile(parsed.profile || null);
      fetchProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('parkir_token');
      if (!token) {
        return;
      }
      const { data } = await authAPI.getProfile();
      setProfile(data);
      setUser((prev) => {
        const updated = { ...prev, profile: data };
        localStorage.setItem('parkir_user', JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('parkir_token', data.session.access_token);
    localStorage.setItem('parkir_user', JSON.stringify(data.user));
    setUser(data.user);
    setProfile(data.user.profile);
    return data;
  };

  const register = async (userData) => {
    const { data } = await authAPI.register(userData);
    return data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('parkir_token');
      localStorage.removeItem('parkir_user');
      setUser(null);
      setProfile(null);
    }
  };

  const hasRole = (...roles) => {
    return profile && roles.includes(profile.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        register,
        logout,
        fetchProfile,
        hasRole,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
