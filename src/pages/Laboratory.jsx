import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Laboratory = () => {
  const { currentUser, userProfile, signOutUser, loading } = useAuth();

  if (loading) {
    return <div className="page-container"><div className="content-box">Loading...</div></div>;
  }

  if (!currentUser) {
    return <Navigate to="/login/laboratory" replace />;
  }

  // Signed in but wrong role
  if (userProfile?.role !== 'laboratory') {
    return (
      <div className="page-container">
        <Link to="/" className="back-link">
          <ArrowLeft size={24} /> Back to Home
        </Link>
        <div className="content-box">
          <h2>Access denied</h2>
          <p>Your account does not have Laboratory access.</p>
        </div>
      </div>
    );
  }

  // All good — show a minimal dashboard entry
  return (
    <div className="page-container">
      <Link to="/" className="back-link">
        <ArrowLeft size={24} /> Back to Home
      </Link>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="content-box">
        <h1>Laboratory Dashboard</h1>
        <p>Welcome, {userProfile?.adminName || userProfile?.labName || currentUser?.emailAddresses?.[0]?.emailAddress}</p>
        <div className="dashboard-actions">
          <Link to="/laboratory/dashboard" className="btn-primary">Open Dashboard</Link>
          <button className="btn-secondary" onClick={() => signOutUser()} style={{ marginLeft: 8 }}>Sign out</button>
        </div>
      </motion.div>
    </div>
  );
};

export default Laboratory;
