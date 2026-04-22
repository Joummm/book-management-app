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
  isOled: boolean;
  isHighContrast: boolean;
  isLoading: boolean;
  readingSpeed: number;
  timezone: string;
  setLocale: (locale: string) => void;
  toggleTheme: () => void;
  setTheme: (theme: string) => void;
  setIsOled: (value: boolean) => void;
  setIsHighContrast: (value: boolean) => void;
  setReadingSpeed: (speed: number) => void;
  setTimezone: (tz: string) => void;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [locale, setLocale] = useState('pt');
  const [theme, setTheme] = useState('light');
  const [isOled, setIsOledState] = useState(false);
  const [isHighContrast, setIsHighContrastState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [readingSpeed, setReadingSpeedState] = useState(250);
  const [timezone, setTimezoneState] = useState('Europe/Lisbon');

  // Carregar preferências do localStorage
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale');
    const savedTheme = localStorage.getItem('theme');
    const savedOled = localStorage.getItem('isOled') === 'true';
    const savedContrast = localStorage.getItem('isHighContrast') === 'true';
    const savedSpeed = localStorage.getItem('readingSpeed');
    const savedTz = localStorage.getItem('timezone');
    
    if (savedLocale) setLocale(savedLocale);
    if (savedSpeed) setReadingSpeedState(parseInt(savedSpeed));
    if (savedTz) setTimezoneState(savedTz);
    
    setIsOledState(savedOled);
    document.documentElement.classList.toggle('oled', savedOled);
    
    setIsHighContrastState(savedContrast);
    document.documentElement.classList.toggle('contrast', savedContrast);

    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', isDark);
      } else {
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      }
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
        
        // Fetch full profile for settings
        try {
          const profileRes = await fetch('/api/profile');
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            if (profileData.profile) {
              if (profileData.profile.reading_speed) setReadingSpeed(profileData.profile.reading_speed);
              if (profileData.profile.timezone) setTimezone(profileData.profile.timezone);
              if (profileData.profile.language) handleSetLocale(profileData.profile.language);
            }
          }
        } catch (e) {
          console.error('Error fetching profile settings:', e);
        }
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

  const handleSetTheme = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', isDark);
    } else {
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
  };

  const setIsOled = (value: boolean) => {
    setIsOledState(value);
    localStorage.setItem('isOled', String(value));
    document.documentElement.classList.toggle('oled', value);
  };

  const setIsHighContrast = (value: boolean) => {
    setIsHighContrastState(value);
    localStorage.setItem('isHighContrast', String(value));
    document.documentElement.classList.toggle('contrast', value);
  };

  const setReadingSpeed = (value: number) => {
    setReadingSpeedState(value);
    localStorage.setItem('readingSpeed', String(value));
  };

  const setTimezone = (value: string) => {
    setTimezoneState(value);
    localStorage.setItem('timezone', value);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        locale,
        theme,
        isOled,
        isHighContrast,
        isLoading,
        readingSpeed,
        timezone,
        setLocale: handleSetLocale,
        toggleTheme,
        setTheme: handleSetTheme,
        setIsOled,
        setIsHighContrast,
        setReadingSpeed,
        setTimezone,
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