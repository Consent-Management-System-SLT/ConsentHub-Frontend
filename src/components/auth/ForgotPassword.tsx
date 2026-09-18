import React, { useRef, useState } from 'react';
import { useLockedLightTheme } from '../../contexts/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, Lock, ShieldQuestion, Eye, EyeOff, ArrowLeft, ArrowRight,
  CheckCircle, AlertCircle,
} from 'lucide-react';
import { multiServiceApiClient } from '../../services/multiServiceApiClient';
import StepProgress from './StepProgress';
import AuthField from './AuthField';
import { Spinner } from '../shared/Loading';

const STEPS = ['Your email', 'Verify identity', 'New password', 'Done'];

const PASSWORD_RULES: { label: string; test: (p: string) => boolean }[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'A lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'An uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'A number', test: (p) => /\d/.test(p) },
  { label: 'A special character (@ $ ! % * ? & #)', test: (p) => /[@$!%*?&#]/.test(p) },
];

/**
 * Password reset against the account's own security question.
 *
 * The previous version faked both round trips with setTimeout and let the
 * person choose which security question to answer, so nothing was verified and
 * no password was ever changed.
 */
const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  useLockedLightTheme(); // the auth screens are a fixed brand panel
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldError, setFieldError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const headingRef = useRef<HTMLHeadingElement>(null);

  const goTo = (n: number) => {
    setStep(n);
    setFieldError('');
    setGeneralError('');
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const post = (path: string, body: unknown) =>
    multiServiceApiClient.makeRequest('POST', path, body, 'customer', 'auth');

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return setFieldError('Email is required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setFieldError('Enter a valid email address');
    setIsLoading(true);
    setFieldError('');
    try {
      const res = await post('/api/v1/auth/forgot-password/question', { email: email.trim() });
      if (res?.success && res.question) {
        setQuestion(res.question);
        goTo(2);
      } else {
        setGeneralError(res?.message || 'We could not start a reset for that address.');
      }
    } catch (err: any) {
      setGeneralError(err?.message || 'We could not start a reset for that address.');
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return setFieldError('Please answer the question');
    setIsLoading(true);
    setFieldError('');
    try {
      const res = await post('/api/v1/auth/forgot-password/verify', { email: email.trim(), answer });
      if (res?.success && res.resetToken) {
        setResetToken(res.resetToken);
        goTo(3);
      } else {
        setFieldError(res?.message || 'That answer does not match our records.');
      }
    } catch (err: any) {
      setFieldError(err?.message || 'That answer does not match our records.');
    } finally {
      setIsLoading(false);
    }
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (PASSWORD_RULES.some((r) => !r.test(password))) {
      return setFieldError('Password does not meet all the requirements below');
    }
    if (password !== confirm) return setFieldError('Passwords do not match');
    setIsLoading(true);
    setFieldError('');
    try {
      const res = await post('/api/v1/auth/forgot-password/reset', { resetToken, password });
      if (res?.success) goTo(4);
      else setGeneralError(res?.message || 'We could not reset your password.');
    } catch (err: any) {
      setGeneralError(err?.message || 'We could not reset your password.');
    } finally {
      setIsLoading(false);
    }
  };

  const primary =
    'inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-blue-600 text-white ' +
    'font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 focus:outline-none ' +
    'focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2';
  const secondary =
    'inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-slate-300 ' +
    'text-slate-700 font-medium hover:bg-slate-50 transition-colors focus:outline-none ' +
    'focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2';

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-800 py-6 sm:py-10 px-4 sm:px-6">
      <div className="w-full max-w-md md:max-w-xl lg:max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10">
          <div className="text-center mb-6">
            <img src="/Logo-SLT.png" alt="SLT Mobitel" className="mx-auto h-12 sm:h-14 w-auto mb-3" />
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">Reset Password</h1>
            <p className="text-slate-600 text-sm sm:text-base">Consent Management System</p>
          </div>

          <StepProgress steps={STEPS} current={step} />

          {generalError && (
            <div role="alert" className="mb-5 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-700 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-slate-700 text-sm">{generalError}</p>
            </div>
          )}

          <h2 ref={headingRef} tabIndex={-1} className="text-base font-semibold text-slate-900 mb-4 focus:outline-none">
            {step < 4 ? `Step ${step} of ${STEPS.length}: ${STEPS[step - 1]}` : 'Password updated'}
          </h2>

          {step === 1 && (
            <form onSubmit={submitEmail} noValidate className="space-y-4">
              <p className="text-sm text-slate-600">
                Enter the email address on your account and we will ask you its security question.
              </p>
              <AuthField
                id="email" label="Email Address" icon={Mail} required error={fieldError}
                inputProps={{
                  type: 'email', autoComplete: 'email', value: email,
                  onChange: (e) => { setEmail(e.target.value); setFieldError(''); },
                  placeholder: 'Enter your email address',
                }}
              />
              <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-2">
                <Link to="/login" className={secondary}>
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  Back to sign in
                </Link>
                <button type="submit" disabled={isLoading} className={primary}>
                  {isLoading && <Spinner size="sm" tone="white" />}
                  {isLoading ? 'Checking…' : 'Continue'}
                  {!isLoading && <ArrowRight className="w-4 h-4" aria-hidden="true" />}
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={submitAnswer} noValidate className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-600 mb-1">Your security question</p>
                <p className="text-sm font-semibold text-slate-900">{question}</p>
              </div>
              <AuthField
                id="answer" label="Your Answer" icon={ShieldQuestion} required error={fieldError}
                hint="Capitalisation and extra spaces do not matter."
                inputProps={{
                  type: 'text', autoComplete: 'off', value: answer,
                  onChange: (e) => { setAnswer(e.target.value); setFieldError(''); },
                  placeholder: 'Type your answer',
                }}
              />
              <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-2">
                <button type="button" onClick={() => goTo(1)} className={secondary}>
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  Back
                </button>
                <button type="submit" disabled={isLoading} className={primary}>
                  {isLoading && <Spinner size="sm" tone="white" />}
                  {isLoading ? 'Verifying…' : 'Verify'}
                  {!isLoading && <ArrowRight className="w-4 h-4" aria-hidden="true" />}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={submitPassword} noValidate className="space-y-4">
              <AuthField id="newPassword" label="New Password" icon={Lock} required error={fieldError}>
                <>
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFieldError(''); }}
                    aria-describedby="reset-rules"
                    placeholder="Create a new password"
                    className="w-full bg-white border border-slate-300 rounded-lg py-2.5 sm:py-3 pl-9 sm:pl-10 pr-11 text-slate-900 placeholder-slate-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded text-slate-500 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
                  </button>
                </>
              </AuthField>

              <ul id="reset-rules" className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-1">
                {PASSWORD_RULES.map((rule) => {
                  const met = rule.test(password);
                  return (
                    <li key={rule.label} className="flex items-center gap-2 text-xs">
                      <CheckCircle className={`w-3.5 h-3.5 shrink-0 ${met ? 'text-green-700' : 'text-slate-400'}`} aria-hidden="true" />
                      <span className={met ? 'text-slate-700' : 'text-slate-600'}>{rule.label}</span>
                      <span className="sr-only">{met ? ' — met' : ' — not met yet'}</span>
                    </li>
                  );
                })}
              </ul>

              <AuthField
                id="confirmNewPassword" label="Confirm New Password" icon={Lock} required
                inputProps={{
                  type: showPassword ? 'text' : 'password', autoComplete: 'new-password', value: confirm,
                  onChange: (e) => { setConfirm(e.target.value); setFieldError(''); },
                  placeholder: 'Re-enter your new password',
                }}
              />

              <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-2">
                <button type="button" onClick={() => goTo(2)} className={secondary}>
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  Back
                </button>
                <button type="submit" disabled={isLoading} className={primary}>
                  {isLoading && <Spinner size="sm" tone="white" />}
                  {isLoading ? 'Updating…' : 'Update password'}
                </button>
              </div>
            </form>
          )}

          {step === 4 && (
            <div className="text-center py-4">
              <CheckCircle className="mx-auto h-14 w-14 text-green-700 mb-4" aria-hidden="true" />
              <p className="text-slate-700 mb-6">
                Your password has been updated. You can sign in with it now.
              </p>
              <button type="button" onClick={() => navigate('/login', { state: { email } })} className={primary}>
                Go to sign in
              </button>
            </div>
          )}

          {step < 4 && (
            <p className="mt-6 text-center text-sm text-slate-600">
              Remember your password?{' '}
              <Link to="/login" className="text-blue-700 hover:text-blue-800 font-semibold">
                Sign In
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
