import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '../services/authService';

interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  company?: string;
  department?: string;
  jobTitle?: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  language?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  isLoading: boolean;
  getAuthToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if user is logged in and get current user data from backend
        const storedUser = authService.getStoredUser();
        const token = authService.getAuthToken();
        
        if (storedUser && token) {
          // First, set the stored user immediately to avoid logout on page reload
          setUser(storedUser);
          
          // Then try to get fresh data from backend, but don't logout if it fails
          try {
            const currentUser = await authService.getCurrentUser();
            if (currentUser) {
              setUser(currentUser);
            }
            // If getCurrentUser fails, we keep the stored user data
          } catch (backendError) {
            console.log('Backend verification failed, using stored user data:', backendError);
            // Keep the stored user data - don't logout due to backend issues
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Only logout if there's a serious error, not just network issues
        if (!authService.getStoredUser() || !authService.getAuthToken()) {
          authService.logout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.login({ email, password });
      
      if (response.success) {
        setUser(response.user);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.register(userData);
      
      if (response.success) {
        // Don't automatically log in after registration
        // User should go to sign-in page to enter credentials
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    try {
      const updatedUser = await authService.updateProfile(userData);
      setUser(updatedUser);
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const getAuthToken = (): string | null => {
    return authService.getAuthToken();
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateUser,
    isLoading,
    getAuthToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
