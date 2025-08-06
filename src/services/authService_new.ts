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
        displayName: `${userData.firstName} ${userData.lastName}`,
        phoneNumber: userData.phone,
        role: 'customer',
        profile: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          company: userData.company,
          department: userData.department,
          jobTitle: userData.jobTitle,
          language: userData.language || 'en'
        }
      };

      const response = await multiServiceApiClient.makeRequest(
        'POST',
        `${this.authBaseUrl}/users`,
        registerPayload
      );

      if (response.success && response.data.user) {
        // Store auth data
        const authData = {
          token: response.data.token || this.generateDemoToken(response.data.user),
          user: this.transformUser(response.data.user),
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

      throw new Error('Registration failed');
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    }
  }

  /**
   * Login user with email and password
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await multiServiceApiClient.makeRequest(
        'POST',
        `${this.authBaseUrl}/login`,
        credentials
      );

      if (response.success && response.data) {
        const authData = {
          token: response.data.token || this.generateDemoToken(response.data.user),
          user: this.transformUser(response.data.user),
          expiresIn: response.data.expiresIn || '24h'
        };

        localStorage.setItem('authToken', authData.token);
        localStorage.setItem('user', JSON.stringify(authData.user));
        this.currentUser = authData.user;

        // Update last login time
        await this.updateLastLogin(authData.user.id);

        return {
          success: true,
          token: authData.token,
          user: authData.user,
          expiresIn: authData.expiresIn
        };
      }

      throw new Error('Invalid credentials');
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  /**
   * Get current user profile from backend
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getAuthToken();
      if (!token) return null;

      const response = await multiServiceApiClient.makeRequest(
        'GET',
        `${this.customerBaseUrl}/dashboard/profile`,
        undefined,
        { 'Authorization': `Bearer ${token}` }
      );

      if (response.success && response.data) {
        const user = this.transformUser(response.data);
        this.currentUser = user;
        localStorage.setItem('user', JSON.stringify(user));
        return user;
      }

      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      this.clearAuthData();
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const token = this.getAuthToken();
      const response = await multiServiceApiClient.makeRequest(
        'PUT',
        `${this.customerBaseUrl}/dashboard/profile`,
        updates,
        { 'Authorization': `Bearer ${token}` }
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
          { 'Authorization': `Bearer ${token}` }
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
      isActive: backendUser.status !== 'inactive' && backendUser.status !== 'suspended',
      emailVerified: backendUser.emailVerified ?? true,
      phoneVerified: backendUser.phoneVerified ?? false
    };
  }

  /**
   * Update last login time
   */
  private async updateLastLogin(userId: string): Promise<void> {
    try {
      const token = this.getAuthToken();
      await multiServiceApiClient.makeRequest(
        'PUT',
        `${this.authBaseUrl}/users/${userId}/last-login`,
        { lastLoginAt: new Date().toISOString() },
        { 'Authorization': `Bearer ${token}` }
      );
    } catch (error) {
      console.error('Failed to update last login:', error);
      // Non-critical error, don't throw
    }
  }
}

export const authService = new AuthService();
