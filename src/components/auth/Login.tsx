import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  // Check for success message and email from signup
  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
    }
    if (location.state?.email) {
      setEmail(location.state.email);
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
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-800 py-6 sm:py-10 px-4 sm:px-6">
      <div className="max-w-sm sm:max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {/* Logo and header */}
          <div className="text-center">
            <img 
              src="/Logo-SLT.png" 
              alt="SLT-Mobitel" 
              className="mx-auto h-12 sm:h-14 md:h-16 w-auto mb-3 sm:mb-4"
            />
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 sm:mb-2">
              {t('auth.signIn')}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">Consent Management System</p>
          </div>
          {/* Success message */}
          {success && (
            <div role="status" aria-live="polite" className="mt-3 sm:mt-4 p-3 bg-green-50 border border-green-200 rounded-md flex flex-wrap items-start sm:items-center gap-2">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-700 flex-shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
              <span className="text-slate-900 text-sm">{success}</span>
            </div>
          )}
          {/* Error message */}
          {error && (
            <div role="alert" className="mt-3 sm:mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex flex-wrap items-start sm:items-center gap-2">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-700 flex-shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
              <span className="text-slate-900 text-sm">{error}</span>
            </div>
          )}
          {/* Login form */}
          <form className="mt-4 sm:mt-6 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-900 mb-1">
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
                className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors mt-1 block w-full py-2.5 sm:py-3 text-sm sm:text-base"
                placeholder="Enter your email"
               aria-label="Enter your email"/>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-900 mb-1">
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
                  className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors block w-full py-2.5 sm:py-3 pr-10 text-sm sm:text-base"
                  placeholder="Enter your password"
                 aria-label="Enter your password"/>
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center rounded-r-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <div className="flex items-center order-2 sm:order-1">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-2 focus:ring-blue-600"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">
                  {t('auth.rememberMe')}
                </label>
              </div>
              <div className="text-sm order-1 sm:order-2">
                <Link
                  to="/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-600 transition-colors"
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading}
                aria-busy={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group relative w-full flex justify-center py-2.5 sm:py-3 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span
                      className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"
                      aria-hidden="true"
                    />
                    <span className="sr-only">Signing in</span>
                  </>
                ) : (
                  t('auth.signInButton')
                )}
              </button>
            </div>
            <div className="text-center">
              <span className="text-sm text-slate-600">{t('auth.noAccount')} </span>
              <Link
                to="/signup"
                className="font-medium text-blue-600 hover:text-blue-600 transition-colors"
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
