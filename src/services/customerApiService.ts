import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

const customerApi = axios.create({
  baseURL: API_URL,
});

customerApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('customerToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const requestOtp = async (mobileNumber: string) => {
  const response = await customerApi.post('/customer-auth/easyapply/request-otp', { mobileNumber });
  return response.data;
};

export const verifyOtp = async (mobileNumber: string, otp: string) => {
  const response = await customerApi.post('/customer-auth/easyapply/verify-otp', { mobileNumber, otp });
  if (response.data.token) {
    localStorage.setItem('customerToken', response.data.token);
  }
  return response.data;
};

export const logoutCustomer = () => {
  localStorage.removeItem('customerToken');
  // Optional backend call
  // return customerApi.post('/customer-auth/logout');
};

export const fetchCustomerConsents = async () => {
  const response = await customerApi.get('/customer/consents');
  return response.data;
};

export const getCustomerProfile = async () => {
  const response = await customerApi.get('/customer-auth/me');
  return response.data;
};
