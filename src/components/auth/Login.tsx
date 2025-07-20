import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, AlertCircle, CheckCircle, Info } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  // Check for success message from signup
  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Basic validation
    if (!email.trim()) {
      setError('Email is required');
      setIsLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    if (!password.trim()) {
      setError('Password is required');
      setIsLoading(false);
      return;
    }

    try {
      const success = await login(email, password);
      if (success) {
        setSuccess('Login successful! Redirecting to dashboard...');
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1500);
      } else {
        setError('Invalid email or password. Please check your credentials and try again.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.message.includes('404')) {
        setError('Login service is not available. Please try again later.');
      } else if (err.message.includes('Network Error')) {
        setError('Network connection failed. Please check your internet connection.');
      } else if (err.message.includes('timeout')) {
        setError('Request timed out. Please try again.');
      } else {
        setError(err.message || 'Login failed. Please check your credentials and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fill credentials for each role
  const fillCredentials = (role: 'admin' | 'customer' | 'csr') => {
    const credentials = {
      admin: {
        email: 'admin@sltmobitel.lk',
        password: 'admin123'
      },
      customer: {
        email: 'customer@sltmobitel.lk',
        password: 'customer123'
      },
      csr: {
        email: 'csr@sltmobitel.lk',
        password: 'csr123'
      }
    };

    setEmail(credentials[role].email);
    setPassword(credentials[role].password);
    setError(''); // Clear any existing errors
    setSuccess('Credentials filled! Click Sign In to login.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0072CE] to-[#4CAF50] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Logo and header */}
          <div className="text-center">
            <img 
              src="/SLTMobitel_Logo.svg.png" 
              alt="SLT-Mobitel" 
              className="mx-auto h-16 w-auto mb-4"
            />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {t('auth.signIn')}
            </h2>
            <p className="text-gray-600">Consent Management System</p>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-3">Quick Login - Click to Auto-Fill:</h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fillCredentials('customer')}
                className="w-full text-left p-2 bg-white rounded border border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-blue-900">Customer (Demo)</span>
                    <div className="text-xs text-blue-700">customer@sltmobitel.lk / customer123</div>
                  </div>
                  <span className="text-xs text-blue-600 opacity-70 group-hover:opacity-100">Click to fill</span>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => fillCredentials('admin')}
                className="w-full text-left p-2 bg-white rounded border border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-blue-900">Admin (Demo)</span>
                    <div className="text-xs text-blue-700">admin@sltmobitel.lk / admin123</div>
                  </div>
                  <span className="text-xs text-blue-600 opacity-70 group-hover:opacity-100">Click to fill</span>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => fillCredentials('csr')}
                className="w-full text-left p-2 bg-white rounded border border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-blue-900">CSR Admin (Demo)</span>
                    <div className="text-xs text-blue-700">csr@sltmobitel.lk / csr123</div>
                  </div>
                  <span className="text-xs text-blue-600 opacity-70 group-hover:opacity-100">Click to fill</span>
                </div>
              </button>
            </div>
          </div>

          {/* Success message */}
          {success && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-700 text-sm">{success}</span>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Login form */}
          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('auth.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0072CE] focus:border-[#0072CE]"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('auth.password')}
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0072CE] focus:border-[#0072CE]"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#0072CE] focus:ring-[#0072CE] border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  {t('auth.rememberMe')}
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-[#0072CE] hover:text-[#005bb5] transition-colors"
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#0072CE] hover:bg-[#005bb5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0072CE] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  t('auth.signInButton')
                )}
              </button>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-600">{t('auth.noAccount')} </span>
              <Link
                to="/signup"
                className="font-medium text-[#0072CE] hover:text-[#005bb5] transition-colors"
              >
                {t('auth.signUp')}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
