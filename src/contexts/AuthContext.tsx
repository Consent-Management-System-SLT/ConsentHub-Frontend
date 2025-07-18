import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'customer' | 'csradmin';
  phone?: string;
  department?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
  getAuthToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Generate a simple token for the backend (simplified for demo)
const generateJWTToken = (user: User): string => {
  // Return the appropriate demo token based on user role
  // These tokens match what the backend services expect
  switch (user.role) {
    case 'admin':
      return 'admin-demo-token-123';
    case 'csradmin':
      return 'csr-demo-token-123';
    case 'customer':
      return 'customer-demo-token-123';
    default:
      return `demo-token-${user.id}-${Date.now()}`;
  }
};

// Demo users for authentication
const DEMO_USERS = [
  {
    id: 'eea08c27-9f0f-4f8e-bba0-5a49f3fe8be5', // Real customer ID from database
    email: 'admin@sltmobitel.lk',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin' as const,
    phone: '+94 11 2345678',
    department: 'IT Administration'
  },
  {
    id: 'eea08c27-9f0f-4f8e-bba0-5a49f3fe8be5', // Real customer ID from database
    email: 'customer@sltmobitel.lk',
    password: 'customer123',
    name: 'Robert Johnson',
    role: 'customer' as const,
    phone: '+94 77 1234567',
    department: 'Customer Relations'
  },
  {
    id: '9580d762-5994-48e9-923b-5d4ec9b6febb', // Another real customer ID
    email: 'csr@sltmobitel.lk',
    password: 'csr123',
    name: 'CSR User',
    role: 'csradmin' as const,
    phone: '+94 77 1234337',
    department: 'CSR'
  }
];

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const foundUser = DEMO_USERS.find(
        u => u.email === email && u.password === password
      );

      if (foundUser) {
        const userData: User = {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          role: foundUser.role,
          phone: foundUser.phone,
          department: foundUser.department
        };
        
        // Generate JWT token
        const token = generateJWTToken(userData);
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('authToken', token);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Regenerate token with updated user data
      const token = generateJWTToken(updatedUser);
      localStorage.setItem('authToken', token);
    }
  };

  const getAuthToken = (): string | null => {
    return localStorage.getItem('authToken');
  };

  const value: AuthContextType = {
    user,
    login,
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
