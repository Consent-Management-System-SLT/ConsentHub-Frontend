import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-myslt-background py-4 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-sm sm:max-w-md md:max-w-lg w-full space-y-4 sm:space-y-6 md:space-y-8">
        <div className="myslt-card p-4 sm:p-6 md:p-8">
          {/* Logo and header */}
          <div className="text-center">
            <img 
              src="/Logo-SLT.png" 
              alt="SLT-Mobitel" 
              className="mx-auto h-12 sm:h-14 md:h-16 w-auto mb-3 sm:mb-4"
            />
            <h2 className="text-2xl sm:text-3xl font-bold text-myslt-text-primary mb-1 sm:mb-2">
              {t('auth.signIn')}
            </h2>
            <p className="text-myslt-text-secondary text-sm sm:text-base">Consent Management System</p>
          </div>

          {/* Success message */}
          {success && (
            <div className="mt-3 sm:mt-4 p-3 bg-myslt-success/20 border border-myslt-success/30 rounded-md flex items-start sm:items-center space-x-2">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-myslt-success flex-shrink-0 mt-0.5 sm:mt-0" />
              <span className="text-myslt-text-primary text-sm">{success}</span>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-3 sm:mt-4 p-3 bg-myslt-danger/20 border border-myslt-danger/30 rounded-md flex items-start sm:items-center space-x-2">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-myslt-danger flex-shrink-0 mt-0.5 sm:mt-0" />
              <span className="text-myslt-text-primary text-sm">{error}</span>
            </div>
          )}

          {/* Login form */}
          <form className="mt-4 sm:mt-6 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-myslt-text-primary mb-1">
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
                className="myslt-input mt-1 block w-full py-2.5 sm:py-3 text-sm sm:text-base"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-myslt-text-primary mb-1">
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
                  className="myslt-input block w-full py-2.5 sm:py-3 pr-10 text-sm sm:text-base"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-myslt-text-muted" />
                  ) : (
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-myslt-text-muted" />
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
                  className="h-4 w-4 text-myslt-accent focus:ring-myslt-accent border-myslt-accent/50 rounded bg-myslt-card"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-myslt-text-primary">
                  {t('auth.rememberMe')}
                </label>
              </div>

              <div className="text-sm order-1 sm:order-2">
                <Link
                  to="/forgot-password"
                  className="font-medium text-myslt-text-accent hover:text-myslt-accent transition-colors"
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="myslt-btn-primary group relative w-full flex justify-center py-2.5 sm:py-3 px-4 text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                ) : (
                  t('auth.signInButton')
                )}
              </button>
            </div>

            <div className="text-center">
              <span className="text-sm text-myslt-text-secondary">{t('auth.noAccount')} </span>
              <Link
                to="/signup"
                className="font-medium text-myslt-text-accent hover:text-myslt-accent transition-colors"
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
