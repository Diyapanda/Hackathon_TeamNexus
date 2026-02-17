import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute({ children, requiredRole }) {
  const { currentUser, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!currentUser) return <Navigate to="/login/laboratory" state={{ from: location }} replace />;
  if (requiredRole && userProfile?.role !== requiredRole) return <div className="page-container"><div className="content-box"><h2>Access denied</h2><p>Insufficient permissions.</p></div></div>;
  return children;
}

