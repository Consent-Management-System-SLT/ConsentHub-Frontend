// Authentication Service for ConsentHub
import { apiClient, ApiResponse } from './apiClient';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  mobile?: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  language?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ResetPasswordRequest {
  email: string;
  resetToken: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  role: string;
  permissions: string[];
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  emailVerified: boolean;
  mobileVerified: boolean;
}

class AuthService {
  private readonly basePath = '/api/auth';
  private currentUser: User | null = null;

  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>(`${this.basePath}/login`, credentials);
    
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      this.currentUser = response.data.user;
    }
    
    return response;
  }

  /**
   * Register new user
   */
  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>(`${this.basePath}/register`, userData);
    
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      this.currentUser = response.data.user;
    }
    
    return response;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(`${this.basePath}/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<ApiResponse<AuthResponse>> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<AuthResponse>(`${this.basePath}/refresh`, {
      refreshToken
    });

    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      this.currentUser = response.data.user;
    }

    return response;
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>(`${this.basePath}/password-reset-request`, { email });
  }

  /**
   * Reset password
   */
  async resetPassword(request: ResetPasswordRequest): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>(`${this.basePath}/password-reset`, request);
  }

  /**
   * Change password
   */
  async changePassword(request: ChangePasswordRequest): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>(`${this.basePath}/change-password`, request);
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<User>(`${this.basePath}/profile`);
    this.currentUser = response.data;
    return response;
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: {
    name?: string;
    email?: string;
    mobile?: string;
  }): Promise<ApiResponse<User>> {
    const response = await apiClient.patch<User>(`${this.basePath}/profile`, updates);
    this.currentUser = response.data;
    localStorage.setItem('user', JSON.stringify(response.data));
    return response;
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>(`${this.basePath}/verify-email`, { token });
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>(`${this.basePath}/send-email-verification`);
  }

  /**
   * Verify mobile
   */
  async verifyMobile(code: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>(`${this.basePath}/verify-mobile`, { code });
  }

  /**
   * Send mobile verification
   */
  async sendMobileVerification(): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>(`${this.basePath}/send-mobile-verification`);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    return !!token;
  }

  /**
   * Get current user from local storage
   */
  getCurrentUserFromStorage(): User | null {
    if (this.currentUser) {
      return this.currentUser;
    }

    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        this.currentUser = JSON.parse(userStr);
        return this.currentUser;
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }

    return null;
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string): boolean {
    const user = this.getCurrentUserFromStorage();
    return user ? user.permissions.includes(permission) : false;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUserFromStorage();
    return user ? user.role === role : false;
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.currentUser = null;
  }

  /**
   * Get authentication token
   */
  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  /**
   * Get user sessions
   */
  async getUserSessions(): Promise<ApiResponse<Array<{
    id: string;
    deviceInfo: string;
    location: string;
    lastActivity: string;
    current: boolean;
  }>>> {
    return apiClient.get<any>(`${this.basePath}/sessions`);
  }

  /**
   * Revoke user session
   */
  async revokeSession(sessionId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<{ message: string }>(`${this.basePath}/sessions/${sessionId}`);
  }

  /**
   * Revoke all sessions except current
   */
  async revokeAllOtherSessions(): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>(`${this.basePath}/sessions/revoke-all`);
  }
}

export const authService = new AuthService();
