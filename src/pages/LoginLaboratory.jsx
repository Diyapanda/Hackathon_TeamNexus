import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import LabAuthForm from '../components/LabAuthForm';

export default function LoginLaboratory() {
  return (
    <div className="page-container">
      <Link to="/" className="back-link">
        <ArrowLeft size={24} /> Back to Home
      </Link>

      <div className="content-box">
        <h1>Laboratory Login / Register</h1>
        <p>Sign in or create a laboratory account to access lab features.</p>
        <LabAuthForm />
      </div>
    </div>
  );
}
