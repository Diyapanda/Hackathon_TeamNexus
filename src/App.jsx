import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import LandingPage from './pages/LandingPage';
import Patient from './pages/Patient';
import Doctor from './pages/Doctor';
import Admin from './pages/Admin';
import Laboratory from './pages/Laboratory';
import LoginLaboratory from './pages/LoginLaboratory';
import LaboratoryDashboard from './pages/LaboratoryDashboard';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey} afterSignOutUrl="/">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/patient" element={<Patient />} />
            <Route path="/doctor" element={<Doctor />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/laboratory" element={<Laboratory />} />
            <Route path="/login/laboratory" element={<LoginLaboratory />} />
            <Route
              path="/laboratory/dashboard"
              element={
                <PrivateRoute requiredRole="laboratory">
                  <LaboratoryDashboard />
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ClerkProvider>
  );
}

export default App;
