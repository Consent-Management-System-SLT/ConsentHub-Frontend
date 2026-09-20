import React, { useRef, useState } from 'react';
import { useLockedLightTheme } from '../../contexts/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, User, Mail, Phone, Building, Lock, Briefcase,
  AlertCircle, CheckCircle, ArrowLeft, ArrowRight, ShieldQuestion,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { RegisterRequest } from '../../services/authService';
import StepProgress from './StepProgress';
import AuthField from './AuthField';
import { Spinner } from '../shared/Loading';

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  department: string;
  jobTitle: string;
  securityQuestion: string;
  securityAnswer: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

type FieldErrors = Partial<Record<keyof SignupFormData, string>>;

const STEPS = ['Your details', 'Organisation', 'Security'];

const SECURITY_QUESTIONS = [
  'What was the name of your first school?',
  'What is your mother’s maiden name?',
  'What was the name of your first pet?',
  'In which city were you born?',
  'What is your favourite book?',
];

// One definition of the rules, shared by the checklist beside the field and the
// strength meter, so the two can never disagree.
const PASSWORD_RULES: { label: string; test: (p: string) => boolean }[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'A lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'An uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'A number', test: (p) => /\d/.test(p) },
  { label: 'A special character (@ $ ! % * ? & #)', test: (p) => /[@$!%*?&#]/.test(p) },
];

const getPasswordStrength = (password: string) => PASSWORD_RULES.filter((r) => r.test(password)).length;

const STRENGTH = [
  { text: '', bar: '', color: '' },
  { text: 'Very weak', bar: 'w-1/5 bg-red-600', color: 'text-red-700' },
  { text: 'Weak', bar: 'w-2/5 bg-red-600', color: 'text-red-700' },
  { text: 'Fair', bar: 'w-3/5 bg-amber-500', color: 'text-amber-700' },
  { text: 'Good', bar: 'w-4/5 bg-blue-600', color: 'text-blue-700' },
  { text: 'Strong', bar: 'w-full bg-green-700', color: 'text-green-700' },
];

const Signup: React.FC = () => {
  const navigate = useNavigate();
  useLockedLightTheme(); // the auth screens are a fixed brand panel
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '', lastName: '', email: '', phone: '',
    company: '', department: '', jobTitle: '',
    securityQuestion: SECURITY_QUESTIONS[0], securityAnswer: '',
    password: '', confirmPassword: '', agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [showAlreadyRegistered, setShowAlreadyRegistered] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const set = (field: keyof SignupFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (generalError) setGeneralError('');
  };

  /** Validates one step so a person is never sent forward with a bad field. */
  const validateStep = (n: number): FieldErrors => {
    const e: FieldErrors = {};
    if (n === 1) {
      if (!formData.firstName.trim()) e.firstName = 'First name is required';
      if (!formData.lastName.trim()) e.lastName = 'Last name is required';
      if (!formData.email.trim()) e.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Enter a valid email address';
      if (!formData.phone.trim()) e.phone = 'Phone number is required';
      else if (!/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/\s/g, '')))
        e.phone = 'Enter a valid phone number';
    }
    if (n === 3) {
      if (!formData.securityAnswer.trim()) e.securityAnswer = 'An answer is required';
      else if (formData.securityAnswer.trim().length < 3) e.securityAnswer = 'Use at least 3 characters';
      if (!formData.password) e.password = 'Password is required';
      else if (getPasswordStrength(formData.password) < PASSWORD_RULES.length)
        e.password = 'Password does not meet all the requirements below';
      if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
      if (!formData.agreeToTerms) e.agreeToTerms = 'You must accept the terms to continue';
    }
    return e;
  };

  const goTo = (n: number) => {
    setStep(n);
    // move focus to the new step's heading, or a keyboard user is left at the
    // bottom of the form with no idea the panel changed
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const next = () => {
    const e = validateStep(step);
    setErrors(e);
    if (Object.keys(e).length === 0) goTo(step + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setSuccess('');
    const stepErrors = validateStep(3);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length) return;

    setIsLoading(true);
    try {
      const registrationData: RegisterRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        company: formData.company,
        department: formData.department,
        jobTitle: formData.jobTitle,
        securityQuestion: formData.securityQuestion,
        securityAnswer: formData.securityAnswer,
        acceptTerms: formData.agreeToTerms,
        acceptPrivacy: formData.agreeToTerms,
        language: 'en',
      };
      const ok = await register(registrationData);
      if (ok) {
        setSuccess('Account created. Taking you to sign in…');
        setTimeout(() => {
          navigate('/login', {
            state: {
              message: 'Account created successfully. Please sign in with your credentials.',
              email: formData.email,
            },
          });
        }, 1600);
      } else {
        setGeneralError('Registration failed. Please check your information and try again.');
      }
    } catch (err: any) {
      const message = String(err?.message || '');
      if (message.includes('User with this email already exists')) setShowAlreadyRegistered(true);
      else if (message.includes('404')) setGeneralError('Registration service is unavailable. Please try again later.');
      else if (message.includes('Network Error')) setGeneralError('Network connection failed. Please check your connection.');
      else if (message.includes('timeout')) setGeneralError('The request timed out. Please try again.');
      else setGeneralError(message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const strength = getPasswordStrength(formData.password);
  const meter = STRENGTH[strength];

  const secondary =
    'inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-slate-300 ' +
    'text-slate-700 font-medium hover:bg-slate-50 transition-colors focus:outline-none ' +
    'focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2';
  const primary =
    'inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-blue-600 text-white ' +
    'font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 focus:outline-none ' +
    'focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2';

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-800 py-6 sm:py-10 px-4 sm:px-6">
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10">
          <div className="text-center mb-6">
            <img src="/Logo-SLT.png" alt="SLT Mobitel" className="mx-auto h-12 sm:h-14 w-auto mb-3" />
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">Create Account</h1>
            <p className="text-slate-600 text-sm sm:text-base">Join our Consent Management System</p>
          </div>

          <StepProgress steps={STEPS} current={step} />

          {success && (
            <div role="status" className="mb-5 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-700 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-slate-900 font-medium text-sm">Success</p>
                <p className="text-slate-700 text-sm">{success}</p>
              </div>
            </div>
          )}
          {generalError && (
            <div role="alert" className="mb-5 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-700 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-slate-900 font-medium text-sm">We could not create your account</p>
                <p className="text-slate-700 text-sm">{generalError}</p>
              </div>
            </div>
          )}
          {showAlreadyRegistered && (
            <div role="alert" className="mb-5 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-slate-900 font-medium text-sm">This email is already registered</p>
                <p className="text-slate-700 text-sm">
                  <button
                    type="button"
                    className="underline text-blue-700 hover:text-blue-800 font-medium"
                    onClick={() =>
                      navigate('/login', {
                        state: { email: formData.email, message: 'You already have an account. Please sign in.' },
                      })
                    }
                  >
                    Sign in to your account
                  </button>{' '}
                  instead.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="text-base font-semibold text-slate-900 mb-4 focus:outline-none"
            >
              Step {step} of {STEPS.length}: {STEPS[step - 1]}
            </h2>

            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AuthField
                    id="firstName" label="First Name" icon={User} required error={errors.firstName}
                    inputProps={{
                      type: 'text', autoComplete: 'given-name', value: formData.firstName,
                      onChange: (e) => set('firstName', e.target.value), placeholder: 'Enter your first name',
                    }}
                  />
                  <AuthField
                    id="lastName" label="Last Name" icon={User} required error={errors.lastName}
                    inputProps={{
                      type: 'text', autoComplete: 'family-name', value: formData.lastName,
                      onChange: (e) => set('lastName', e.target.value), placeholder: 'Enter your last name',
                    }}
                  />
                </div>
                <AuthField
                  id="email" label="Email Address" icon={Mail} required error={errors.email}
                  inputProps={{
                    type: 'email', autoComplete: 'email', value: formData.email,
                    onChange: (e) => set('email', e.target.value), placeholder: 'Enter your email address',
                  }}
                />
                <AuthField
                  id="phone" label="Phone Number" icon={Phone} required error={errors.phone}
                  hint="Include the country code, for example +94 71 234 5678"
                  inputProps={{
                    type: 'tel', autoComplete: 'tel', value: formData.phone,
                    onChange: (e) => set('phone', e.target.value), placeholder: '+94 XX XXX XXXX',
                  }}
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  These are optional — they help our team route requests to the right place.
                </p>
                <AuthField
                  id="company" label="Company / Organisation" icon={Building} error={errors.company}
                  inputProps={{
                    type: 'text', autoComplete: 'organization', value: formData.company,
                    onChange: (e) => set('company', e.target.value), placeholder: 'Enter your company name',
                  }}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AuthField
                    id="department" label="Department" icon={Building} error={errors.department}
                    inputProps={{
                      type: 'text', value: formData.department,
                      onChange: (e) => set('department', e.target.value), placeholder: 'Enter your department',
                    }}
                  />
                  <AuthField
                    id="jobTitle" label="Designation" icon={Briefcase} error={errors.jobTitle}
                    inputProps={{
                      type: 'text', autoComplete: 'organization-title', value: formData.jobTitle,
                      onChange: (e) => set('jobTitle', e.target.value), placeholder: 'Enter your job title',
                    }}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <AuthField id="securityQuestion" label="Security Question" icon={ShieldQuestion} required>
                  <select
                    id="securityQuestion"
                    value={formData.securityQuestion}
                    onChange={(e) => set('securityQuestion', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg py-2.5 sm:py-3 pl-9 sm:pl-10 pr-8 text-slate-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  >
                    {SECURITY_QUESTIONS.map((q) => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </AuthField>

                <AuthField
                  id="securityAnswer" label="Answer" icon={Lock} required error={errors.securityAnswer}
                  hint="Used to confirm it is you if you ever reset your password. It is stored hashed, never in plain text."
                  inputProps={{
                    type: 'text', autoComplete: 'off', value: formData.securityAnswer,
                    onChange: (e) => set('securityAnswer', e.target.value), placeholder: 'Your answer',
                  }}
                />

                <AuthField id="password" label="Password" icon={Lock} required error={errors.password}>
                  <>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={(e) => set('password', e.target.value)}
                      aria-invalid={errors.password ? true : undefined}
                      aria-describedby={`password-rules${errors.password ? ' password-error' : ''}`}
                      placeholder="Create a password"
                      className={`w-full bg-white border rounded-lg py-2.5 sm:py-3 pl-9 sm:pl-10 pr-11 text-slate-900 placeholder-slate-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 ${
                        errors.password ? 'border-red-400' : 'border-slate-300'
                      }`}
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

                {/* requirements sit right under the field they describe */}
                <div id="password-rules" className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-xs font-medium text-slate-700">Password strength</span>
                    {meter.text && <span className={`text-xs font-semibold ${meter.color}`}>{meter.text}</span>}
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mb-3" aria-hidden="true">
                    <div className={`h-full rounded-full transition-all duration-300 motion-reduce:transition-none ${meter.bar}`} />
                  </div>
                  <ul className="space-y-1">
                    {PASSWORD_RULES.map((rule) => {
                      const met = rule.test(formData.password);
                      return (
                        <li key={rule.label} className="flex items-center gap-2 text-xs">
                          <CheckCircle
                            className={`w-3.5 h-3.5 shrink-0 ${met ? 'text-green-700' : 'text-slate-400'}`}
                            aria-hidden="true"
                          />
                          <span className={met ? 'text-slate-700' : 'text-slate-600'}>
                            {rule.label}
                          </span>
                          <span className="sr-only">{met ? ' — met' : ' — not met yet'}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <AuthField id="confirmPassword" label="Confirm Password" icon={Lock} required error={errors.confirmPassword}>
                  <>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={(e) => set('confirmPassword', e.target.value)}
                      aria-invalid={errors.confirmPassword ? true : undefined}
                      aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                      placeholder="Confirm your password"
                      className={`w-full bg-white border rounded-lg py-2.5 sm:py-3 pl-9 sm:pl-10 pr-11 text-slate-900 placeholder-slate-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 ${
                        errors.confirmPassword ? 'border-red-400' : 'border-slate-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded text-slate-500 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
                    </button>
                  </>
                </AuthField>

                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreeToTerms}
                      onChange={(e) => set('agreeToTerms', e.target.checked)}
                      aria-invalid={errors.agreeToTerms ? true : undefined}
                      aria-describedby={errors.agreeToTerms ? 'terms-error' : undefined}
                      className="mt-0.5 w-4 h-4 shrink-0 rounded border-slate-400 text-blue-600 focus:ring-2 focus:ring-blue-600"
                    />
                    <span className="text-sm text-slate-700">
                      I agree to the{' '}
                      <Link to="/terms" className="text-blue-700 hover:text-blue-800 underline font-medium">
                        Terms and Conditions
                      </Link>{' '}
                      and the{' '}
                      <Link to="/privacy" className="text-blue-700 hover:text-blue-800 underline font-medium">
                        Privacy Policy
                      </Link>
                      , and I consent to my data being processed under PDPA No. 9 of 2022.
                    </span>
                  </label>
                  {errors.agreeToTerms && (
                    <p id="terms-error" className="mt-1 text-sm text-red-700">{errors.agreeToTerms}</p>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
              {step > 1 ? (
                <button type="button" onClick={() => goTo(step - 1)} className={secondary}>
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  Back
                </button>
              ) : (
                <span className="hidden sm:block" />
              )}

              {step < STEPS.length ? (
                <button type="button" onClick={next} className={primary}>
                  Continue
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              ) : (
                <button type="submit" disabled={isLoading} className={primary}>
                  {isLoading ? <Spinner size="sm" tone="white" /> : null}
                  {isLoading ? 'Creating account…' : 'Create Account'}
                </button>
              )}
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-700 hover:text-blue-800 font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
