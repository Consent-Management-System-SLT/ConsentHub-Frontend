import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, User, Phone, Building, ArrowLeft, CheckCircle } from 'lucide-react';

interface ResetFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  company: string;
  securityQuestion: string;
  securityAnswer: string;
}

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: Verify Identity, 3: Success
  const [formData, setFormData] = useState<ResetFormData>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    company: '',
    securityQuestion: '',
    securityAnswer: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<ResetFormData>>({});

  const handleInputChange = (field: keyof ResetFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Partial<ResetFormData> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Partial<ResetFormData> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.securityQuestion.trim()) newErrors.securityQuestion = 'Please select a security question';
    if (!formData.securityAnswer.trim()) newErrors.securityAnswer = 'Security answer is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep1()) return;
    
    setIsLoading(true);
    
    // Simulate API call to check if email exists
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 1000);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) return;
    
    setIsLoading(true);
    
    // Simulate API call to verify identity and send reset email
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
    }, 2000);
  };

  const securityQuestions = [
    'What was the name of your first pet?',
    'What city were you born in?',
    'What was your first car?',
    'What is your mother\'s maiden name?',
    'What was the name of your elementary school?',
    'What is your favorite movie?'
  ];

  if (step === 3) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-myslt-background py-4 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-sm sm:max-w-md w-full space-y-4 sm:space-y-6 md:space-y-8">
          <div className="myslt-card p-4 sm:p-6 md:p-8">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-myslt-success mb-3 sm:mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-myslt-text-primary mb-1 sm:mb-2">
                Reset Link Sent!
              </h2>
              <p className="text-myslt-text-secondary mb-4 sm:mb-6 text-sm sm:text-base">
                We've sent a password reset link to {formData.email}
              </p>
              <p className="text-xs sm:text-sm text-myslt-text-muted mb-6 sm:mb-8">
                Please check your email and follow the instructions to reset your password. 
                The link will expire in 24 hours.
              </p>
              
              <Link
                to="/login"
                className="myslt-btn-primary w-full inline-flex justify-center py-2.5 sm:py-3 px-4 text-sm font-medium transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-myslt-background py-4 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-sm sm:max-w-md md:max-w-lg w-full space-y-4 sm:space-y-6 md:space-y-8">
        <div className="myslt-card p-4 sm:p-6 md:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <img 
              src="/Logo-SLT.png" 
              alt="SLT-Mobitel" 
              className="mx-auto h-12 sm:h-14 md:h-16 w-auto mb-3 sm:mb-4"
            />
            <h2 className="text-2xl sm:text-3xl font-bold text-myslt-text-primary mb-1 sm:mb-2">
              Reset Password
            </h2>
            <p className="text-myslt-text-secondary text-sm sm:text-base">Consent Management System</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-medium ${
                step >= 1 ? 'bg-myslt-accent text-white' : 'bg-myslt-card text-myslt-text-muted'
              }`}>
                1
              </div>
              <div className={`flex-1 h-1 mx-1.5 sm:mx-2 ${
                step >= 2 ? 'bg-myslt-accent' : 'bg-myslt-card'
              }`}></div>
              <div className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-medium ${
                step >= 2 ? 'bg-myslt-accent text-white' : 'bg-myslt-card text-myslt-text-muted'
              }`}>
                2
              </div>
            </div>
            <div className="flex justify-between mt-1.5 sm:mt-2">
              <span className="text-xs text-myslt-text-muted">Email</span>
              <span className="text-xs text-myslt-text-muted">Verify Identity</span>
            </div>
          </div>

          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-myslt-text-primary mb-4">Enter Your Email</h3>
                <p className="text-sm text-myslt-text-secondary mb-4">
                  Please enter the email address associated with your account.
                </p>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-myslt-text-primary mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-myslt-text-muted w-5 h-5" />
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`myslt-input w-full pl-10 py-3 ${
                        errors.email ? 'border-myslt-danger' : ''
                      }`}
                      placeholder="Enter your email address"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-myslt-danger">{errors.email}</p>}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`myslt-btn-primary w-full py-3 px-4 font-medium transition-colors ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Verifying...' : 'Continue'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-4 sm:space-y-6">
              <div className="flex items-center mb-3 sm:mb-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center text-myslt-text-accent hover:text-myslt-accent transition-colors text-sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </button>
              </div>

              <div>
                <h3 className="text-lg font-medium text-myslt-text-primary mb-3 sm:mb-4">Verify Your Identity</h3>
                <p className="text-sm text-myslt-text-secondary mb-3 sm:mb-4">
                  Please provide the following information to verify your identity.
                </p>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-myslt-text-primary mb-1">
                    First Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-myslt-text-muted w-4 h-4 sm:w-5 sm:h-5" />
                    <input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`myslt-input w-full pl-8 sm:pl-10 py-2.5 sm:py-3 text-sm sm:text-base ${
                        errors.firstName ? 'border-myslt-danger' : ''
                      }`}
                      placeholder="First name"
                    />
                  </div>
                  {errors.firstName && <p className="mt-1 text-sm text-myslt-danger">{errors.firstName}</p>}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-myslt-text-primary mb-1">
                    Last Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-myslt-text-muted w-4 h-4 sm:w-5 sm:h-5" />
                    <input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={`myslt-input w-full pl-8 sm:pl-10 py-2.5 sm:py-3 text-sm sm:text-base ${
                        errors.lastName ? 'border-myslt-danger' : ''
                      }`}
                      placeholder="Last name"
                    />
                  </div>
                  {errors.lastName && <p className="mt-1 text-sm text-myslt-danger">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-myslt-text-primary mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-myslt-text-muted w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`myslt-input w-full pl-8 sm:pl-10 py-2.5 sm:py-3 text-sm sm:text-base ${
                      errors.phone ? 'border-myslt-danger' : ''
                    }`}
                    placeholder="+94 XX XXX XXXX"
                  />
                </div>
                {errors.phone && <p className="mt-1 text-sm text-myslt-danger">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-myslt-text-primary mb-1">
                  Company/Organization
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-myslt-text-muted w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    id="company"
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="myslt-input w-full pl-8 sm:pl-10 py-2.5 sm:py-3 text-sm sm:text-base"
                    placeholder="Company name"
                  />
                </div>
              </div>

              {/* Security Question */}
              <div>
                <label htmlFor="securityQuestion" className="block text-sm font-medium text-myslt-text-primary mb-1">
                  Security Question *
                </label>
                <select
                  id="securityQuestion"
                  value={formData.securityQuestion}
                  onChange={(e) => handleInputChange('securityQuestion', e.target.value)}
                  className={`myslt-input w-full py-2.5 sm:py-3 text-sm sm:text-base ${
                    errors.securityQuestion ? 'border-myslt-danger' : ''
                  }`}
                >
                  <option value="">Select a security question</option>
                  {securityQuestions.map((question, index) => (
                    <option key={index} value={question}>{question}</option>
                  ))}
                </select>
                {errors.securityQuestion && <p className="mt-1 text-sm text-myslt-danger">{errors.securityQuestion}</p>}
              </div>

              <div>
                <label htmlFor="securityAnswer" className="block text-sm font-medium text-myslt-text-primary mb-1">
                  Security Answer *
                </label>
                <input
                  id="securityAnswer"
                  type="text"
                  value={formData.securityAnswer}
                  onChange={(e) => handleInputChange('securityAnswer', e.target.value)}
                  className={`myslt-input w-full py-2.5 sm:py-3 text-sm sm:text-base ${
                    errors.securityAnswer ? 'border-myslt-danger' : ''
                  }`}
                  placeholder="Enter your answer"
                />
                {errors.securityAnswer && <p className="mt-1 text-sm text-myslt-danger">{errors.securityAnswer}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`myslt-btn-primary w-full py-2.5 sm:py-3 px-4 font-medium transition-colors text-sm sm:text-base ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <div className="mt-4 sm:mt-6 text-center">
            <span className="text-sm text-myslt-text-secondary">Remember your password? </span>
            <Link
              to="/login"
              className="font-medium text-myslt-text-accent hover:text-myslt-accent transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
