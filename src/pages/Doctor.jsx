import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Lock, Mail, Activity, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';

const Doctor = () => {
    const navigate = useNavigate();
    // Steps: 0: Login, 1: Register Details, 2: OTP Verification
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

    // Form Data
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        otp: '',
        license_number: '',
        specialization: '',
        hospital_name: '',
        city: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await authApi.login(formData.email, formData.password);
            localStorage.setItem('token', data.access_token);
            setIsAuthenticated(true);
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterRequest = async (e) => {
        e.preventDefault();
        console.log("Submitting Registration:", formData); // DEBUG
        setLoading(true);
        try {
            const data = await authApi.registerRequest({
                full_name: formData.full_name,
                email: formData.email,
                password: formData.password,
                license_number: formData.license_number,
                specialization: formData.specialization,
                hospital_name: formData.hospital_name,
                city: formData.city
            });
            setStep(2); // Go to OTP
            setSuccess(data.message);
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyRegistration = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // After successful verification, we do NOT login automatically.
            // We redirect to Login Step.
            await authApi.verifyRegistration(formData.email, formData.otp);
            setStep(0); // Redirect to Login
            setSuccess('Registration Successful! Please login with your credentials.');
            setFormData(prev => ({ ...prev, otp: '', password: '' })); // Clear sensitive data
        } catch (err) {
            setError(err.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setStep(0);
        setFormData({
            full_name: '',
            email: '',
            password: '',
            otp: '',
            license_number: '',
            specialization: '',
            hospital_name: '',
            city: ''
        });
        setSuccess('');
        setError('');
    };

    // Animation Variants
    const slideVariants = {
        hidden: { x: 50, opacity: 0 },
        visible: { x: 0, opacity: 1 },
        exit: { x: -50, opacity: 0 }
    };

    if (isAuthenticated) {
        return (
            <div className="page-container" style={{ padding: '2rem' }}>
                <div className="glass-panel" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h1>Doctor Dashboard</h1>
                        {/* Use the new .btn-logout class */}
                        <button onClick={handleLogout} className="btn-logout" style={{ width: 'auto' }}>
                            <LogOut size={20} style={{ marginRight: '8px' }} />
                            Logout
                        </button>
                    </div>
                    <div className="grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.5)' }}>
                            <Activity size={32} color="var(--primary-color)" />
                            <h3>Patient Overview</h3>
                            <p>You have 12 appointments today.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <Link to="/" style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', color: 'var(--primary-dark)' }}>
                    <ArrowLeft size={20} style={{ marginRight: '8px' }} /> Back to Home
                </Link>

                <motion.div
                    className="glass-panel"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '2rem', color: 'var(--primary-dark)' }}>Doctor Portal</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            {step === 0 ? 'Login to access your dashboard' :
                                step === 1 ? 'Register as a Doctor' : 'Verify your email'}
                        </p>
                    </div>

                    {error && <div className="error-msg" style={{ marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                    {success && <div className="success-msg" style={{ marginBottom: '1rem', textAlign: 'center' }}>{success}</div>}

                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <motion.form key="login" variants={slideVariants} initial="hidden" animate="visible" exit="exit" onSubmit={handleLogin}>
                                <div className="input-group">
                                    <label className="input-label">Email Address</label>
                                    <input className="input-field" type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="doctor@hospital.com" />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Password</label>
                                    <input className="input-field" type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" />
                                </div>
                                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
                                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                                    <p style={{ color: 'var(--text-secondary)' }}>
                                        Don't have an account?
                                        <button
                                            type="button"
                                            onClick={() => { setStep(1); setSuccess(''); setError(''); }}
                                            className="btn-secondary"
                                            style={{ display: 'inline', width: 'auto', padding: '0 8px', marginLeft: '5px', color: 'var(--primary-color)', fontWeight: 'bold' }}
                                        >
                                            Sign Up
                                        </button>
                                    </p>
                                </div>
                            </motion.form>
                        )}

                        {step === 1 && (
                            <motion.form key="register" variants={slideVariants} initial="hidden" animate="visible" exit="exit" onSubmit={handleRegisterRequest}>
                                <div className="input-group">
                                    <label className="input-label">Full Name</label>
                                    <input className="input-field" type="text" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Dr. John Doe" required />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Email Address</label>
                                    <input className="input-field" type="email" name="email" value={formData.email} onChange={handleChange} required />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Password</label>
                                    <input className="input-field" type="password" name="password" value={formData.password} onChange={handleChange} required />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">License Number</label>
                                    <input className="input-field" type="text" name="license_number" value={formData.license_number} onChange={handleChange} required />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Specialization</label>
                                    <input className="input-field" type="text" name="specialization" value={formData.specialization} onChange={handleChange} required />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Hospital Name</label>
                                    <input className="input-field" type="text" name="hospital_name" value={formData.hospital_name} onChange={handleChange} required />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">City</label>
                                    <input className="input-field" type="text" name="city" value={formData.city} onChange={handleChange} required />
                                </div>
                                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
                                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                    <button type="button" onClick={() => setStep(0)} className="btn-secondary">Back to Login</button>
                                </div>
                            </motion.form>
                        )}

                        {step === 2 && (
                            <motion.form key="otp" variants={slideVariants} initial="hidden" animate="visible" exit="exit" onSubmit={handleVerifyRegistration}>
                                <div className="input-group">
                                    <label className="input-label">Enter OTP Sent to {formData.email}</label>
                                    <input className="input-field" type="text" name="otp" value={formData.otp} onChange={handleChange} required placeholder="123456" maxLength={6} />
                                </div>
                                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Verifying...' : 'Verify & Login'}</button>
                                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                    <button type="button" onClick={() => setStep(1)} className="btn-secondary">Change Details</button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default Doctor;
