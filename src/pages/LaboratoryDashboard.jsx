import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function LaboratoryDashboard() {
  const { userProfile, currentUser, signOutUser } = useAuth();

  return (
    <div className="page-container">
      <div className="content-box">
        <h1>Laboratory Dashboard</h1>
        <p>Welcome, {userProfile?.adminName || userProfile?.labName || currentUser?.email}</p>
        <div className="card">
          <h3>Lab details</h3>
          <p><strong>Lab name:</strong> {userProfile?.labName}</p>
          <p><strong>Reg. number:</strong> {userProfile?.registrationNumber}</p>
          <p><strong>Address:</strong> {userProfile?.address}</p>
          <p><strong>Phone:</strong> {userProfile?.phone1} {userProfile?.phone2 ? ` / ${userProfile.phone2}` : ''}</p>
        </div>

        <div style={{ marginTop: 16 }}>
          <button className="btn-primary" onClick={() => alert('(placeholder) open lab features')}>Open lab features</button>
          <Link to="/" className="btn-secondary" style={{ marginLeft: 8 }}>Back to home</Link>
          <button className="btn-danger" style={{ marginLeft: 8 }} onClick={() => signOutUser()}>Sign out</button>
        </div>
      </div>
    </div>
  );
}
