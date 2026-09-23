import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('atlas_session');
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error restaurando sesión:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (user) => {
    setUser(user);
    try {
      sessionStorage.setItem('atlas_session', JSON.stringify(user));
    } catch (error) {
      console.error('Error guardando sesión:', error);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      sessionStorage.removeItem('atlas_session');
    } catch (error) {
      console.error('Error eliminando sesión:', error);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    try {
      sessionStorage.setItem('atlas_session', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error actualizando sesión:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
