import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Session, AuthError } from './types';
import { authService } from './auth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthError | null>;
  register: (email: string, password: string, name?: string) => Promise<AuthError | null>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<AuthError | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session on app load
    const currentSession = authService.getCurrentSession();
    if (currentSession) {
      setSession(currentSession);
      setUser(currentSession.user);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<AuthError | null> => {
    try {
      const result = await authService.login(email, password);
      if ('message' in result) {
        return result;
      }
      
      setUser(result.user);
      setSession(result.session);
      return null;
    } catch (error) {
      return { message: 'An unexpected error occurred during login' };
    }
  };

  const register = async (email: string, password: string, name?: string): Promise<AuthError | null> => {
    try {
      const result = await authService.register(email, password, name);
      if ('message' in result) {
        return result;
      }
      
      setUser(result.user);
      setSession(result.session);
      return null;
    } catch (error) {
      return { message: 'An unexpected error occurred during registration' };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setSession(null);
    navigate('/login');
  };

  const updateProfile = async (updates: Partial<User>): Promise<AuthError | null> => {
    if (!user) {
      return { message: 'User not authenticated' };
    }

    try {
      const result = await authService.updateProfile(user.id, updates);
      if ('message' in result) {
        return result;
      }
      
      setUser(result);
      if (session) {
        setSession({ ...session, user: result });
      }
      return null;
    } catch (error) {
      return { message: 'An unexpected error occurred while updating profile' };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 