// Authentication Service for ConsentHub - Real Backend Integration
import { multiServiceApiClient } from './multiServiceApiClient';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
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

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  expiresIn: string;
}

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

class AuthService {
  private readonly authBaseUrl = '/api/v1/auth';
  private readonly customerBaseUrl = '/api/v1/customer';
  private currentUser: User | null = null;

  /**
   * Register new user account
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const registerPayload = {
        email: userData.email,
        password: userData.password,
        name: `${userData.firstName} ${userData.lastName}`,
        phone: userData.phone
      };

      const response = await multiServiceApiClient.makeRequest(
        'POST',
        '/api/v1/auth/register',  // Fixed: Correct endpoint (removed double auth)
        registerPayload,
        'customer',
        'auth'  // Use auth service
      );

      console.log('Register response received:', response);
      console.log('Response type:', typeof response);
      console.log('Response success:', response?.data?.success);
      console.log('Response data:', response?.data);

      // Handle Axios response structure - check response.data.success
      if (response && response.data && response.data.success) {
        // Store auth data from response.data
        const authData = {
          token: response.data.token,
          user: response.data.user,
          expiresIn: '24h'
        };

        localStorage.setItem('authToken', authData.token);
        localStorage.setItem('user', JSON.stringify(authData.user));
        this.currentUser = authData.user;

        return {
          success: true,
          token: authData.token,
          user: authData.user,
          expiresIn: authData.expiresIn
        };
      }

      throw new Error(response?.data?.message || 'Registration failed');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // The error message should now be properly set by multiServiceApiClient
      throw new Error(error.message || 'Registration failed');
    }
  }

  /**
   * Login user with email and password
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('Starting login process for:', credentials.email);
      let response;
      
      // Try production endpoint first, then fallback to local, then demo mode
      try {
        console.log('Trying production endpoint...');
        response = await multiServiceApiClient.makeRequest(
          'POST',
          '/api/v1/auth/login', // Production endpoint
          credentials,
          'customer',
          'auth'
        );
        console.log('Production endpoint success');
      } catch (prodError) {
        console.log('Production endpoint failed:', prodError.message);
        try {
          console.log('Trying local development endpoint...');
          // Fallback to local development endpoint
          response = await multiServiceApiClient.makeRequest(
            'POST',
            '/api/v1/auth/login', // Fixed: Local development endpoint
            credentials,
            'customer',
            'auth'
          );
          console.log('Local endpoint success');
        } catch (localError) {
          console.log('Local endpoint failed:', localError.message);
          console.log('Backend unavailable, using demo authentication');
          // Demo fallback authentication
          return this.demoLogin(credentials);
        }
      }

      console.log('Login response received:', response);
      console.log('Response type:', typeof response);
      console.log('Response success:', response?.data?.success);

      // Handle Axios response structure - check response.data.success
      if (response && response.data && response.data.success) {
        const authData = {
          token: response.data.token,
          user: response.data.user,
          expiresIn: '24h'
        };

        localStorage.setItem('authToken', authData.token);
        localStorage.setItem('user', JSON.stringify(authData.user));
        this.currentUser = authData.user;

        return {
          success: true,
          token: authData.token,
          user: authData.user,
          expiresIn: authData.expiresIn
        };
      }

      throw new Error(response?.data?.message || 'Invalid credentials');
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  }

  /**
   * Demo authentication for development/testing when backend is unavailable
   */
  private demoLogin(credentials: LoginRequest): AuthResponse {
    console.log('Demo login called with:', credentials.email);
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

    console.log('Available demo users:', demoUsers.map(u => u.email));
    
    const demoUser = demoUsers.find(u => 
      u.email === credentials.email && u.password === credentials.password
    );

    console.log('Found demo user:', demoUser ? demoUser.email : 'none');

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

    console.log('Demo login failed - invalid credentials');
    throw new Error('Invalid demo credentials');
  }

  /**
   * Get current user profile from backend
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getAuthToken();
      if (!token) return null;

      // Try to get fresh user data from backend
      try {
        const response = await multiServiceApiClient.makeRequest(
          'GET',
          '/api/v1/auth/profile',
          undefined,
          'customer',
          'auth'
        );

        // Backend returns {user: {...}} format
        if (response && response.user) {
          const user = this.transformUser(response.user);
          this.currentUser = user;
          localStorage.setItem('user', JSON.stringify(user));
          return user;
        }
      } catch (apiError) {
        console.log('Backend profile fetch failed, using stored user data:', apiError);
      }

      // Fallback to stored user data if backend call fails
      const storedUser = this.getStoredUser();
      if (storedUser) {
        return storedUser;
      }

      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      // Don't clear auth data immediately - user might be offline
      const storedUser = this.getStoredUser();
      return storedUser;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const response = await multiServiceApiClient.makeRequest(
        'PUT',
        `${this.customerBaseUrl}/dashboard/profile`,
        updates,
        'customer'
      );

      if (response.success && response.data) {
        const updatedUser = this.transformUser(response.data);
        this.currentUser = updatedUser;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }

      throw new Error('Profile update failed');
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(error.response?.data?.message || 'Profile update failed');
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      const token = this.getAuthToken();
      if (token) {
        await multiServiceApiClient.makeRequest(
          'POST',
          `${this.authBaseUrl}/logout`,
          {},
          'customer'
        );
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
    }
  }

  /**
   * Forgot password - send reset instructions
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await multiServiceApiClient.makeRequest(
        'POST',
        `${this.authBaseUrl}/forgot-password`,
        { email }
      );

      return {
        success: response.success,
        message: response.message || 'Password reset instructions sent to your email'
      };
    } catch (error: any) {
      console.error('Forgot password error:', error);
      throw new Error(error.response?.data?.message || 'Failed to send reset instructions');
    }
  }

  /**
   * Verify authentication token
   */
  async verifyToken(token?: string): Promise<boolean> {
    try {
      const authToken = token || this.getAuthToken();
      if (!authToken) return false;

      const response = await multiServiceApiClient.makeRequest(
        'POST',
        `${this.authBaseUrl}/verify-token`,
        { idToken: authToken }
      );

      return response.success;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  }

  /**
   * Get stored authentication token
   */
  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   * Get stored user data
   */
  getStoredUser(): User | null {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getAuthToken();
    const user = this.getStoredUser();
    return !!(token && user && user.isActive);
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    this.currentUser = null;
  }

  /**
   * Generate demo token for development
   */
  private generateDemoToken(user: any): string {
    const role = user.role || 'customer';
    return `${role}-demo-token-${user.id}-${Date.now()}`;
  }

  /**
   * Transform backend user data to frontend User interface
   */
  private transformUser(backendUser: any): User {
    return {
      id: backendUser.id || backendUser._id,
      uid: backendUser.uid || backendUser.id || backendUser._id,
      email: backendUser.email,
      name: backendUser.name || backendUser.displayName || `${backendUser.firstName || ''} ${backendUser.lastName || ''}`.trim(),
      firstName: backendUser.firstName || backendUser.name?.split(' ')[0] || '',
      lastName: backendUser.lastName || backendUser.name?.split(' ').slice(1).join(' ') || '',
      phone: backendUser.phone || backendUser.phoneNumber,
      company: backendUser.company,
      department: backendUser.department,
      jobTitle: backendUser.jobTitle,
      role: backendUser.role || 'customer',
      partyId: backendUser.partyId,
      status: backendUser.status || 'active',
      createdAt: backendUser.createdAt || new Date().toISOString(),
      lastLoginAt: backendUser.lastLoginAt,
      isActive: backendUser.isActive ?? (backendUser.status !== 'inactive' && backendUser.status !== 'suspended'),
      emailVerified: backendUser.emailVerified ?? true,
      phoneVerified: backendUser.phoneVerified ?? false
    };
  }

  /**
   * Update last login time
   */
  private async updateLastLogin(userId: string): Promise<void> {
    try {
      await multiServiceApiClient.makeRequest(
        'PUT',
        `${this.authBaseUrl}/users/${userId}/last-login`,
        { lastLoginAt: new Date().toISOString() },
        'customer'
      );
    } catch (error) {
      console.error('Failed to update last login:', error);
      // Non-critical error, don't throw
    }
  }
}

export const authService = new AuthService();
