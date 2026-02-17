import React from 'react';
import { ArrowLeft, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import PatientAuthForm from '../components/PatientAuthForm';

const LoginPatient = () => {
    return (
        <div className="page-container">
            <Link to="/" className="back-link">
                <ArrowLeft size={20} /> Back to Home
            </Link>

            <PatientAuthForm />
        </div>
    );
};

export default LoginPatient;
