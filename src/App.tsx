import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';import { AuthProvider } from './contexts/AuthContext';import { NotificationProvider } from './contexts/NotificationContext';import { ThemeProvider } from './contexts/ThemeContext';import Login from './components/auth/Login';import Signup from './components/auth/Signup';import ForgotPassword from './components/auth/ForgotPassword';import RoleBasedDashboard from './components/RoleBasedDashboard';import ProtectedRoute from './components/ProtectedRoute';import ToastContainer from './components/ToastContainer';
import DialogFocusManager from './components/shared/DialogFocusManager';import UserManagement from './components/admin/UserManagement';import EnterpriseRegistration from './components/enterprise/EnterpriseRegistration';
import EnterpriseActivation from './components/enterprise/EnterpriseActivation';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
      <NotificationProvider>
        <Router>
        <div className="min-h-screen bg-slate-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/users"
              element={
                <ProtectedRoute roles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route path="/enterprise/register" element={<EnterpriseRegistration />} />
            <Route path="/enterprise/activate" element={<EnterpriseActivation />} />
            <Route              path="/dashboard"              element={                <ProtectedRoute>                  <RoleBasedDashboard />                </ProtectedRoute>              }            />            <Route path="/" element={<Navigate to="/dashboard" replace />} />          </Routes>          <ToastContainer />
          <DialogFocusManager />        </div>      </Router>      </NotificationProvider>
      </ThemeProvider>    </AuthProvider>  );}export default App;
