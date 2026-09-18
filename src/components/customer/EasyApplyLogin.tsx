import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, ArrowLeft, ArrowRight, AlertCircle, RotateCcw } from 'lucide-react';
import { useLockedLightTheme } from '../../contexts/ThemeContext';
import { requestOtp, verifyOtp } from '../../services/easyApplyService';
import StepProgress from '../auth/StepProgress';
import AuthField from '../auth/AuthField';
import OtpInput from '../auth/OtpInput';
import { Spinner } from '../shared/Loading';

const STEPS = ['Mobile number', 'Verify code'];
const OTP_LENGTH = 6;

/**
 * Sign-in for customers who already exist in EasyApply.
 *
 * Both steps live on one screen so the mobile number never has to be carried
 * through router state - a refresh on a separate /verify-otp page dropped it
 * and bounced the person back to the start.
 */
const EasyApplyLogin: React.FC = () => {
  useLockedLightTheme();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const headingRef = useRef<HTMLHeadingElement>(null);

  const goTo = (n: number) => {
    setStep(n);
    setError('');
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const digits = mobileNumber.replace(/\D/g, '');
    if (!digits) return setError('Mobile number is required');
    if (digits.length < 9) return setError('Enter your mobile number, for example 771234567');

    setIsLoading(true);
    setError('');
    try {
      await requestOtp(digits);
      setOtp('');
      goTo(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const submitOtp = async (code = otp) => {
    if (code.length < OTP_LENGTH) return setError(`Enter all ${OTP_LENGTH} digits`);
    setIsLoading(true);
    setError('');
    try {
      await verifyOtp(mobileNumber.replace(/\D/g, ''), code);
      navigate('/customer/consents');
    } catch (err: any) {
      setError(err.message);
      setOtp('');
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
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <img src="/Logo-SLT.png" alt="SLT Mobitel" className="mx-auto h-12 sm:h-14 w-auto mb-3" />
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">Sign In</h1>
            <p className="text-slate-600 text-sm sm:text-base">
              For customers registered with EasyApply
            </p>
          </div>

          <StepProgress steps={STEPS} current={step} />

          {error && (
            <div role="alert" className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-700 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-slate-700 text-sm">{error}</p>
            </div>
          )}

          <h2 ref={headingRef} tabIndex={-1} className="text-base font-semibold text-slate-900 mb-4 focus:outline-none">
            Step {step} of {STEPS.length}: {STEPS[step - 1]}
          </h2>

          {step === 1 ? (
            <form onSubmit={sendCode} noValidate className="space-y-4">
              <AuthField
                id="mobileNumber"
                label="Mobile Number"
                icon={Phone}
                required
                hint="The number registered with your EasyApply account."
                inputProps={{
                  type: 'tel',
                  autoComplete: 'tel',
                  inputMode: 'numeric',
                  value: mobileNumber,
                  onChange: (e) => { setMobileNumber(e.target.value); setError(''); },
                  placeholder: '77 123 4567',
                }}
              />
              <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-2">
                <Link to="/login" className={secondary}>
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  Back to sign in
                </Link>
                <button type="submit" disabled={isLoading} className={primary}>
                  {isLoading && <Spinner size="sm" tone="white" />}
                  {isLoading ? 'Sending…' : 'Send code'}
                  {!isLoading && <ArrowRight className="w-4 h-4" aria-hidden="true" />}
                </button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); submitOtp(); }}
              noValidate
              className="space-y-5"
            >
              <p id="otp-help" className="text-sm text-slate-600 text-center">
                Enter the {OTP_LENGTH}-digit code sent to{' '}
                <span className="font-semibold text-slate-900">{mobileNumber}</span>
              </p>

              <OtpInput
                value={otp}
                onChange={(v) => { setOtp(v); setError(''); }}
                onComplete={(v) => submitOtp(v)}
                length={OTP_LENGTH}
                disabled={isLoading}
                invalid={Boolean(error)}
                describedBy="otp-help"
              />

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => sendCode()}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-60"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  Resend code
                </button>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
                <button type="button" onClick={() => goTo(1)} className={secondary}>
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  Change number
                </button>
                <button type="submit" disabled={isLoading || otp.length < OTP_LENGTH} className={primary}>
                  {isLoading && <Spinner size="sm" tone="white" />}
                  {isLoading ? 'Verifying…' : 'Verify & Sign In'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EasyApplyLogin;
