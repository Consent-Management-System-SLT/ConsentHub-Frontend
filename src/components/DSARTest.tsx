import React, { useState } from 'react';
import { dsarService, DSARRequestListResponse } from '../services/dsarService';
import { ApiResponse } from '../services/apiClient';

const DSARTest: React.FC = () => {
  const [data, setData] = useState<ApiResponse<DSARRequestListResponse> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testDSAR = async () => {
    try {
      setLoading(true);
      setError('');
      
      // First, let's see if we can get token
      const token = localStorage.getItem('authToken');
      console.log('Current token:', token ? 'exists' : 'none');
      
      const response = await dsarService.getDSARRequests();
      console.log('DSAR Response:', response);
      
      setData(response);
    } catch (err) {
      console.error('DSAR Test Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = async () => {
    try {
      setError('');
      const response = await dsarService.exportDSARRequests('csv');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'test-dsar-export.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export Error:', err);
      setError(`Export failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">DSAR Service Test</h2>
      
      <div className="space-y-4">
        <button
          onClick={testDSAR}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Test DSAR Service'}
        </button>

        <button
          onClick={exportCSV}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-2"
        >
          Test CSV Export
        </button>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {data && (
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-bold">Response:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default DSARTest;
