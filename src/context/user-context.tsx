import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '@/types/auth';
import { getCurrentAuthenticatedUser } from '@/services/user-service';
import * as authService from '@/services/auth-service';
import { initializeCsrfTokenOnAppLoad } from '@/lib/axios-instance';

interface UserContextType {
  loggedInUser: User | null;
  isLoadingAuth: boolean;
  loginUserContext: (userData: User) => void;
  logoutUserContext: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      setIsLoadingAuth(true);
      try {
        await initializeCsrfTokenOnAppLoad();
        const user = await getCurrentAuthenticatedUser();
        if (user) {
          setLoggedInUser(user);
        }
      } catch (error) {
        console.error("Initialization error in UserProvider:", error);
        setLoggedInUser(null);
      } finally {
        setIsLoadingAuth(false);
      }
    };

    initializeApp();
  }, []);

  const loginUserContext = (userData: User) => {
    setLoggedInUser(userData);
  };

  const logoutUserContext = () => {
    authService.logoutUser();
    setLoggedInUser(null);
  };

  return (
    <UserContext.Provider value={{ loggedInUser, isLoadingAuth, loginUserContext, logoutUserContext }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 