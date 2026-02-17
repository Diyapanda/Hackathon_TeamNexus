import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import DoctorAuthForm from '../components/DoctorAuthForm';

export default function LoginDoctor() {
    return (
        <div className="page-container">
            <Link to="/" className="back-link">
                <ArrowLeft size={24} /> Back to Home
            </Link>

            <div className="content-box">
                <h1>Doctor Login / Register</h1>
                <p>Sign in to access patient records and manage treatments.</p>
                <DoctorAuthForm />
            </div>
        </div>
    );
}
