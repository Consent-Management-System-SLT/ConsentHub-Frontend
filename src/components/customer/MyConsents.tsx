import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCustomerConsents, logoutCustomer } from '../../services/customerApiService';
import { Shield, LogOut, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function MyConsents() {
  const [consents, setConsents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadConsents = async () => {
      try {
        const response = await fetchCustomerConsents();
        setConsents(response.data);
      } catch (err: any) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          logoutCustomer();
          navigate('/customer/login');
        } else {
          setError('Failed to load consents.');
        }
      } finally {
        setLoading(false);
      }
    };
    loadConsents();
  }, [navigate]);

  const handleLogout = () => {
    logoutCustomer();
    navigate('/customer/login');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'granted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'revoked':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'expired':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-slate-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'granted':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Granted</span>;
      case 'revoked':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Revoked</span>;
      case 'expired':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Expired</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-slate-900">My Consents</span>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-slate-500 hover:text-slate-700 focus:outline-none transition"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:text-3xl sm:truncate">
              Consent History
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              View your active and past consent records
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {consents.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <FileText className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                <p>No consent records found.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-200">
                {consents.map((consent) => (
                  <li key={consent.consentId}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-slate-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {getStatusIcon(consent.status)}
                          <p className="ml-3 text-sm font-medium text-blue-600 truncate">
                            {consent.purpose}
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          {getStatusBadge(consent.status)}
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-slate-500">
                            Service: {consent.serviceType || consent.applicationReference}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-slate-500 sm:mt-0 sm:ml-6">
                            Channel: {consent.channel || consent.sourceSystem}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-slate-500 sm:mt-0">
                          <p>
                            {consent.status === 'granted' && consent.grantedAt
                              ? `Granted on ${new Date(consent.grantedAt).toLocaleDateString()}`
                              : consent.status === 'revoked' && consent.revokedAt
                              ? `Revoked on ${new Date(consent.revokedAt).toLocaleDateString()}`
                              : `Updated on ${new Date(consent.updatedAt || consent.createdAt).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-slate-400">
                        Notice Version: {consent.privacyNoticeVersion || 'N/A'} | ID: {consent.consentId}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
