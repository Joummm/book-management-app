"use client";

import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AppContextType {
  user: User | null;
  locale: string;
  theme: string;
  isLoading: boolean;
  setLocale: (locale: string) => void;
  toggleTheme: () => void;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [locale, setLocale] = useState('pt');
  const [theme, setTheme] = useState('light');
  const [isLoading, setIsLoading] = useState(true);

  // Carregar preferências do localStorage
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedLocale) setLocale(savedLocale);
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  // Buscar usuário autenticado
  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
  try {
    const response = await fetch('/api/auth/logout', { 
      method: 'POST',
      credentials: 'include' // Importante para enviar os cookies
    });
    
    if (response.ok) {
      setUser(null);
      // Usar window.location.replace para evitar loop de redirecionamento
      window.location.replace('/auth/login');
    } else {
      console.error('Erro no logout:', await response.text());
    }
  } catch (error) {
    console.error('Error logging out:', error);
    // Em caso de erro, tentar redirecionar mesmo assim
    window.location.replace('/auth/login');
  }
};

  const handleSetLocale = (newLocale: string) => {
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        locale,
        theme,
        isLoading,
        setLocale: handleSetLocale,
        toggleTheme,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};