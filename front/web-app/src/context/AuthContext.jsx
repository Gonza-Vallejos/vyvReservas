import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProfileId } from '../constants/profiles';
import { authService } from '../services/api';

const AuthContext = createContext(null);
const AUTH_SYNC_KEY = 'vyv_auth_sync';

const clearSessionStorage = () => {
  try {
    window.sessionStorage.clear();
  } catch {
    // Storage may be unavailable in restricted browser contexts.
  }
};

const broadcastAuthChange = (action) => {
  try {
    window.localStorage.setItem(AUTH_SYNC_KEY, JSON.stringify({ action, at: Date.now() }));
  } catch {
    // Cross-tab synchronization is best effort.
  }
};

// eslint-disable-next-line react-refresh/only-export-components
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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const response = await authService.currentSession();
      const sessionUser = response.data?.data?.usuario;
      setUser(normalizeUser(sessionUser));
      return sessionUser || null;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  const clearLocalSession = useCallback(() => {
    setUser(null);
    clearSessionStorage();
  }, []);

  useEffect(() => {
    // Remove credentials/profile cached by the old localStorage-based session.
    try {
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('user');
    } catch {
      // Ignore unavailable localStorage.
    }

    const handleExpired = () => {
      clearLocalSession();
      broadcastAuthChange('logout');
    };

    const handleStorage = (event) => {
      if (event.key !== AUTH_SYNC_KEY || !event.newValue) return;
      try {
        const { action } = JSON.parse(event.newValue);
        if (action === 'logout') clearLocalSession();
        if (action === 'login') refreshSession();
      } catch {
        // Ignore malformed cross-tab messages.
      }
    };

    window.addEventListener('vyv:auth-expired', handleExpired);
    window.addEventListener('storage', handleStorage);

    let active = true;
    const loadInitialSession = async () => {
      try {
        const response = await authService.currentSession();
        if (active) setUser(normalizeUser(response.data?.data?.usuario));
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadInitialSession();

    return () => {
      active = false;
      window.removeEventListener('vyv:auth-expired', handleExpired);
      window.removeEventListener('storage', handleStorage);
    };
  }, [clearLocalSession, refreshSession]);

  const login = (userData) => {
    const normalized = normalizeUser(userData);
    setUser(normalized);
    broadcastAuthChange('login');
  };

  const logout = () => {
    clearLocalSession();
    broadcastAuthChange('logout');
    // Clear the HttpOnly cookie server-side while updating the UI immediately.
    authService.logout().catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
