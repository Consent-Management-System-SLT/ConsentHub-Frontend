import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';

const EnterpriseActivation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!token || !email) {
      addNotification({ type: 'system', category: 'error', title: 'Invalid Link', message: 'Missing activation token or email' });
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return addNotification({ type: 'system', category: 'error', title: 'Error', message: 'Passwords do not match' });
    }
    if (password.length < 8) {
      return addNotification({ type: 'system', category: 'error', title: 'Error', message: 'Password must be at least 8 characters' });
    }

    try {
      setLoading(true);
      const res = await fetch('http://localhost:3001/api/v2/enterprise/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password })
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess(true);
        addNotification({ type: 'system', category: 'success', title: 'Account Activated', message: 'You can now log in' });
      } else {
        throw new Error(data.message || 'Activation failed');
      }
    } catch (e: any) {
      addNotification({ type: 'system', category: 'error', title: 'Error', message: e.message });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center bg-white py-8 px-4 shadow sm:rounded-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Activated</h2>
          <p className="text-gray-600 mb-6">Your Enterprise account has been successfully activated.</p>
          <Link to="/login" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            Proceed to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          SLT ConsentHub
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Activate Enterprise Account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {!token || !email ? (
            <div className="text-center text-red-600">Invalid activation link. Please check your email.</div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Login Email</label>
                <div className="mt-1">
                  <input type="text" disabled value={email} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <div className="mt-1">
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="mt-1">
                  <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
              </div>

              <div>
                <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300">
                  {loading ? 'Activating...' : 'Activate Account'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnterpriseActivation;
