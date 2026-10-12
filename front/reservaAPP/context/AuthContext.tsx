import React, { createContext, useContext, useEffect, useState } from 'react';
import { decodeToken } from '../services/tokenService';
import Storage from '../utils/storage';

type AuthContextType = {
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  userInfo: any;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const checkToken = async () => {
      const allKeys = await Storage.getAllKeys();
      const allData = await Storage.multiGet([...allKeys]);
      // console.log('Contenido del storage context:', allData);

      const token = await Storage.getItem('token');
      if (token) {
        const decoded = decodeToken(token);
        const currentTime = Math.floor(Date.now() / 1000); // tiempo actual en segundos

        const tokenExp = Number(decoded?.exp); 

        if (tokenExp && tokenExp < currentTime) {
          // Token expirado
          console.log('Token expirado, eliminando...');
          await Storage.removeItem('token');
          await Storage.removeItem('perfil');
          setIsLoggedIn(false);
          setUserInfo(null);
        } else {
          // Token válido
          setUserInfo(decoded);
          setIsLoggedIn(true);
        }
      }
      setIsLoading(false);
    };

    checkToken();
  }, []);

  const login = async (token: string) => {
    const tokenDecode = decodeToken(token);

    if (tokenDecode) {
      console.log('perfil descodificado', tokenDecode.perfil);

      await Storage.setItem('token', token);
      setUserInfo(tokenDecode);

      const perfil = tokenDecode.perfil;
      if (typeof perfil === 'string' && perfil.trim() !== '') {
        await Storage.setItem('perfil', perfil);
      } else {
        console.warn('Perfil no definido o vacío, no se guarda en Storage');
      }

      setIsLoggedIn(true);
    }
  };

  const logout = async () => {
    await Storage.removeItem('token');
    await Storage.removeItem('perfil');
    setUserInfo(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, isLoading, userInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};
