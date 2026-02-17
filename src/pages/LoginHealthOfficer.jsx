import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import HealthOfficerAuthForm from '../components/HealthOfficerAuthForm';

export default function LoginHealthOfficer() {
    return (
        <div className="page-container">
            <Link to="/" className="back-link">
                <ArrowLeft size={24} /> Back to Home
            </Link>

            <div className="content-box">
                <h1>Health Officer Login / Register</h1>
                <p>Sign in to access disease surveillance data and reports.</p>
                <HealthOfficerAuthForm />
            </div>
        </div>
    );
}
