// Backup Auth Service - Demo Only
export interface User {
  id: string;
  uid: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  department?: string;
  jobTitle?: string;
  role: 'customer' | 'csr' | 'admin';
  partyId?: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified?: boolean;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  expiresIn: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

class BackupAuthService {
  private currentUser: User | null = null;

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log('Backup auth service - demo login for:', credentials.email);
    
    const demoUsers = [
      {
        email: 'admin@sltmobitel.lk',
        password: 'admin123',
        user: {
          id: 'demo-admin-001',
          uid: 'demo-admin-001',
          email: 'admin@sltmobitel.lk',
          name: 'Admin User',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin' as const,
          status: 'active' as const,
          createdAt: new Date().toISOString(),
          isActive: true,
          emailVerified: true
        }
      },
      {
        email: 'csr@sltmobitel.lk',
        password: 'csr123',
        user: {
          id: 'demo-csr-001',
          uid: 'demo-csr-001',
          email: 'csr@sltmobitel.lk',
          name: 'CSR User',
          firstName: 'CSR',
          lastName: 'User',
          role: 'csr' as const,
          status: 'active' as const,
          createdAt: new Date().toISOString(),
          isActive: true,
          emailVerified: true
        }
      },
      {
        email: 'customer@sltmobitel.lk',
        password: 'customer123',
        user: {
          id: 'demo-customer-001',
          uid: 'demo-customer-001',
          email: 'customer@sltmobitel.lk',
          name: 'Customer User',
          firstName: 'Customer',
          lastName: 'User',
          role: 'customer' as const,
          status: 'active' as const,
          createdAt: new Date().toISOString(),
          isActive: true,
          emailVerified: true
        }
      }
    ];

    const demoUser = demoUsers.find(u => 
      u.email === credentials.email && u.password === credentials.password
    );

    if (demoUser) {
      const token = `demo_token_${Date.now()}`;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(demoUser.user));
      this.currentUser = demoUser.user;

      console.log('Demo login successful for:', demoUser.user.role);
      return {
        success: true,
        token,
        user: demoUser.user,
        expiresIn: '24h'
      };
    }

    throw new Error('Invalid credentials');
  }

  async getCurrentUser(): Promise<User | null> {
    const storedUser = this.getStoredUser();
    return storedUser;
  }

  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getStoredUser(): User | null {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getAuthToken();
    const user = this.getStoredUser();
    return !!(token && user && user.isActive);
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    this.currentUser = null;
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    // Mock implementation
    const currentUser = this.getStoredUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    }
    throw new Error('No user logged in');
  }

  async register(userData: any): Promise<any> {
    // Mock implementation
    return { success: true, message: 'Registration successful' };
  }
}

export const backupAuthService = new BackupAuthService();
