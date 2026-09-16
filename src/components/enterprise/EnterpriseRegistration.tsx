import React, { useState } from 'react';
import { Building, Upload, CheckCircle } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { API_ORIGIN } from '../../config/api';
import { Link } from 'react-router-dom';

const EnterpriseRegistration: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    legalName: '', tradingName: '', registrationNumber: '', organizationType: 'Corporation', industry: '', website: '',
    country: '', registeredAddress: '',
    authRepName: '', authRepEmail: '', authRepPhone: '', authRepDesignation: '', authRepDepartment: '',
    privacyName: '', privacyEmail: '', privacyPhone: '', privacyDesignation: '',
    requestedCapabilities: ['marketing.sms', 'marketing.email'], requestedChannels: ['sms', 'email']
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useNotifications();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      addNotification({ type: 'system', category: 'warning', title: 'Missing Document', message: 'Please upload your business registration certificate' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          data.append(key, JSON.stringify(value));
        } else {
          data.append(key, value as string);
        }
      });
      data.append('document', file);

      const res = await fetch(`${API_ORIGIN}/api/v2/enterprise/register`, {
        method: 'POST',
        body: data
      });
      
      if (res.ok) {
        setStep(4);
        addNotification({ type: 'system', category: 'success', title: 'Application Submitted', message: 'Your enterprise registration has been received.' });
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      addNotification({ type: 'system', category: 'error', title: 'Submission Failed', message: 'There was an error submitting your application. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 flex items-center justify-center">
          <Building className="h-8 w-8 text-blue-600 mr-3" />
          Enterprise Registration
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {step < 4 && (
            <div className="mb-8 flex items-center justify-between">
              <span className={`font-bold ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>1. Details</span>
              <span className={`font-bold ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>2. Contacts</span>
              <span className={`font-bold ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>3. Documents</span>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={() => setStep(2)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium">Legal Name</label><input required type="text" name="legalName" value={formData.legalName} onChange={handleInputChange} className="mt-1 block w-full border rounded-md p-2"  aria-label="Legal Name"/></div>
                <div><label className="block text-sm font-medium">Trading Name</label><input type="text" name="tradingName" value={formData.tradingName} onChange={handleInputChange} className="mt-1 block w-full border rounded-md p-2"  aria-label="Trading Name"/></div>
                <div><label className="block text-sm font-medium">Registration Number</label><input required type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleInputChange} className="mt-1 block w-full border rounded-md p-2"  aria-label="Registration Number"/></div>
                <div>
                  <label className="block text-sm font-medium">Organization Type</label>
                  <select name="organizationType" value={formData.organizationType} onChange={handleInputChange} className="mt-1 block w-full border rounded-md p-2" aria-label="Organization Type">
                    <option>Corporation</option><option>LLC</option><option>Partnership</option><option>Non-Profit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Industry</label>
                  <select required name="industry" value={formData.industry} onChange={handleInputChange} className="mt-1 block w-full border rounded-md p-2" aria-label="Industry">
                    <option value="">Select Industry</option><option value="Finance">Finance</option><option value="Healthcare">Healthcare</option><option value="Retail">Retail</option><option value="Technology">Technology</option><option value="Telecommunications">Telecommunications</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium">Website</label><input type="url" name="website" value={formData.website} onChange={handleInputChange} className="mt-1 block w-full border rounded-md p-2"  aria-label="Website"/></div>
                <div><label className="block text-sm font-medium">Country</label><input required type="text" name="country" value={formData.country} onChange={handleInputChange} className="mt-1 block w-full border rounded-md p-2"  aria-label="Country"/></div>
              </div>
              <div><label className="block text-sm font-medium">Registered Address</label><textarea required name="registeredAddress" value={formData.registeredAddress} onChange={handleInputChange} className="mt-1 block w-full border rounded-md p-2" aria-label="Registered Address"></textarea></div>
              <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-md">Next</button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={() => setStep(3)} className="space-y-6">
              <h3 className="font-bold border-b pb-2">Authorized Representative</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm">Full Name</label><input required type="text" name="authRepName" value={formData.authRepName} onChange={handleInputChange} className="mt-1 block w-full border rounded-md p-2"  aria-label="Full Name"/></div>
                <div><label className="block text-sm">Email</label><input required type="email" name="authRepEmail" value={formData.authRepEmail} onChange={handleInputChange} className="mt-1 block w-full border rounded-md p-2"  aria-label="Email"/></div>
                <div><label className="block text-sm">Phone</label><input required type="text" name="authRepPhone" value={formData.authRepPhone} onChange={handleInputChange} className="mt-1 block w-full border rounded-md p-2"  aria-label="Phone"/></div>
                <div><label className="block text-sm">Designation</label><input required type="text" name="authRepDesignation" value={formData.authRepDesignation} onChange={handleInputChange} className="mt-1 block w-full border rounded-md p-2"  aria-label="Designation"/></div>
                <div><label className="block text-sm">Department</label><input type="text" name="authRepDepartment" value={formData.authRepDepartment} onChange={handleInputChange} className="mt-1 block w-full border rounded-md p-2"  aria-label="Department"/></div>
              </div>
              <h3 className="font-bold border-b pb-2">Privacy/Compliance Contact</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm">Full Name</label><input required type="text" name="privacyName" value={formData.privacyName} onChange={handleInputChange} className="mt-1 block w-full border rounded-md p-2"  aria-label="Full Name"/></div>
                <div><label className="block text-sm">Email</label><input required type="email" name="privacyEmail" value={formData.privacyEmail} onChange={handleInputChange} className="mt-1 block w-full border rounded-md p-2"  aria-label="Email"/></div>
                <div><label className="block text-sm">Phone</label><input required type="text" name="privacyPhone" value={formData.privacyPhone} onChange={handleInputChange} className="mt-1 block w-full border rounded-md p-2"  aria-label="Phone"/></div>
                <div><label className="block text-sm">Designation</label><input type="text" name="privacyDesignation" value={formData.privacyDesignation} onChange={handleInputChange} className="mt-1 block w-full border rounded-md p-2"  aria-label="Designation"/></div>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(1)} className="w-1/3 bg-gray-200 p-2 rounded-md">Back</button>
                <button type="submit" className="w-2/3 bg-blue-600 text-white p-2 rounded-md">Next</button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium">Business Registration Certificate</label>
                <div className="mt-2 border-2 border-dashed p-6 text-center cursor-pointer">
                  <input type="file" onChange={handleFileChange} required className="mb-4"  aria-label="Business Registration Certificate"/>
                  <p className="text-sm text-gray-500">PDF, PNG, JPG up to 10MB</p>
                  {file && <p className="text-green-600 mt-2">{file.name}</p>}
                </div>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(2)} className="w-1/3 bg-gray-200 p-2 rounded-md">Back</button>
                <button type="submit" disabled={isSubmitting} className="w-2/3 bg-blue-600 text-white p-2 rounded-md">{isSubmitting ? 'Submitting...' : 'Submit Registration'}</button>
              </div>
            </form>
          )}

          {step === 4 && (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Application Received</h3>
              <p className="text-gray-600 mb-6">Your registration is under review. You will receive an email upon approval.</p>
              <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-md">Return to Login</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default EnterpriseRegistration;
