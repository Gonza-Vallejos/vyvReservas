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
  const [loading, setLoading] = useState(true);

  const clearLocalSession = useCallback(() => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch {
      // Ignore storage errors
    }
    setUser(null);
    clearSessionStorage();
  }, []);

  const refreshSession = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      return null;
    }
    try {
      const response = await authService.currentSession();
      const sessionUser = response.data?.data?.usuario;
      if (sessionUser) {
        const normalized = normalizeUser(sessionUser);
        try {
          localStorage.setItem('user', JSON.stringify(normalized));
        } catch {}
        setUser(normalized);
        return normalized;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
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
      const token = localStorage.getItem('token');
      if (!token) {
        if (active) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await authService.currentSession();
        const serverUser = response.data?.data?.usuario;
        if (active && serverUser) {
          const normalized = normalizeUser(serverUser);
          try {
            localStorage.setItem('user', JSON.stringify(normalized));
          } catch {}
          setUser(normalized);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          if (active) clearLocalSession();
        }
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

  const login = (userData, token) => {
    const userToken = token || userData?.token || localStorage.getItem('token');
    const normalized = normalizeUser(userData);
    try {
      if (userToken) localStorage.setItem('token', userToken);
      if (normalized) localStorage.setItem('user', JSON.stringify(normalized));
    } catch {}
    setUser(normalized);
    broadcastAuthChange('login');
  };

  const logout = () => {
    clearLocalSession();
    broadcastAuthChange('logout');
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
