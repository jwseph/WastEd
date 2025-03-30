"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { School } from './types';

interface AuthContextType {
  school: School | null;
  login: (school: School) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  school: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [school, setSchool] = useState<School | null>(null);
  const router = useRouter();

  // Check if we have a school in localStorage on mount
  useEffect(() => {
    const storedSchool = localStorage.getItem('school');
    if (storedSchool) {
      try {
        setSchool(JSON.parse(storedSchool));
      } catch (error) {
        localStorage.removeItem('school');
      }
    }
  }, []);

  const login = (newSchool: School) => {
    setSchool(newSchool);
    localStorage.setItem('school', JSON.stringify(newSchool));
  };

  const logout = () => {
    setSchool(null);
    localStorage.removeItem('school');
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        school,
        login,
        logout,
        isAuthenticated: !!school,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 