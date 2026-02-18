import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, LogOut, Beaker } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';

const Laboratory = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0); // 0: Login, 1: Register, 2: OTP
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

    const [formData, setFormData] = useState({
        lab_name: '',
        email: '',
        password: '',
        otp: '',
        license_number: '',
        address: '',
        city: '',
        lab_head_name: ''
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
        setLoading(true);
        try {
            const data = await authApi.registerRequestLab({
                lab_name: formData.lab_name,
                email: formData.email,
                password: formData.password,
                license_number: formData.license_number,
                address: formData.address,
                city: formData.city,
                lab_head_name: formData.lab_head_name
            });
            setStep(2);
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
            await authApi.verifyRegistration(formData.email, formData.otp);
            setStep(0);
            setSuccess('Registration Successful! Please login.');
            setFormData(prev => ({ ...prev, otp: '', password: '' }));
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
        setFormData({ ...formData, email: '', password: '', otp: '' });
    };

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
                        <h1>Laboratory Dashboard</h1>
                        <button onClick={handleLogout} className="btn-logout" style={{ width: 'auto' }}>
                            <LogOut size={20} style={{ marginRight: '8px' }} />
                            Logout
                        </button>
                    </div>
                    <div className="grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.5)' }}>
                            <Beaker size={32} color="var(--primary-color)" />
                            <h3>Lab Overview</h3>
                            <p><strong>Lab Name:</strong> {formData.lab_name || "Lab"}</p>
                            <p>No pending test orders.</p>
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
                        <h2 style={{ fontSize: '2rem', color: 'var(--primary-dark)' }}>Laboratory Portal</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            {step === 0 ? 'Login to access lab dashboard' :
                                step === 1 ? 'Register Laboratory' : 'Verify Email'}
                        </p>
                    </div>

                    {error && <div className="error-msg" style={{ marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                    {success && <div className="success-msg" style={{ marginBottom: '1rem', textAlign: 'center' }}>{success}</div>}

                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <motion.form key="login" variants={slideVariants} initial="hidden" animate="visible" exit="exit" onSubmit={handleLogin}>
                                <div className="input-group">
                                    <label className="input-label">Email Address</label>
                                    <input className="input-field" type="email" name="email" value={formData.email} onChange={handleChange} required />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Password</label>
                                    <input className="input-field" type="password" name="password" value={formData.password} onChange={handleChange} required />
                                </div>
                                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
                                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                                    <p style={{ color: 'var(--text-secondary)' }}>
                                        New Lab?
                                        <button type="button" onClick={() => { setStep(1); setError(''); }} className="btn-secondary" style={{ display: 'inline', width: 'auto', padding: '0 8px', marginLeft: '5px', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                                            Sign Up
                                        </button>
                                    </p>
                                </div>
                            </motion.form>
                        )}

                        {step === 1 && (
                            <motion.form key="register" variants={slideVariants} initial="hidden" animate="visible" exit="exit" onSubmit={handleRegisterRequest}>
                                <div className="input-group">
                                    <label className="input-label">Lab Name</label>
                                    <input className="input-field" type="text" name="lab_name" value={formData.lab_name} onChange={handleChange} required />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Lab Head Name</label>
                                    <input className="input-field" type="text" name="lab_head_name" value={formData.lab_head_name} onChange={handleChange} required />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Email</label>
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
                                    <label className="input-label">Address</label>
                                    <textarea className="input-field" name="address" value={formData.address} onChange={handleChange} required rows={2} />
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
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default Laboratory;
