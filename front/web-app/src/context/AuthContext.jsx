import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProfileId } from '../constants/profiles';

const AuthContext = createContext(null);

export const normalizeUser = (userData) => {
  if (!userData) return null;
  const perfilId = Number(
    userData.perfil_id ?? 
    userData.perfilId ?? 
    getProfileId(userData.perfil)
  );
  const idEmpresa = userData.id_empresa ?? userData.idEmpresa ?? null;
  return {
    ...userData,
    perfil_id: perfilId,
    perfilId: perfilId,
    id_empresa: idEmpresa,
    idEmpresa: idEmpresa,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (token && storedUser) {
        return normalizeUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Error cargando usuario de localStorage:', e);
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Sincronizar en caso de que cambie en otra pestaña o se inicialice
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        setUser(normalizeUser(JSON.parse(storedUser)));
      } catch (e) {
        console.error('Error parseando usuario:', e);
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    const normalized = normalizeUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(normalized));
    setUser(normalized);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('vyv_booking_state');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

