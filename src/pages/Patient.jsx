import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, LogOut, QrCode, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';

const Patient = () => {
    const navigate = useNavigate();
    // Steps: 0: Login, 1: Register Details, 2: OTP Verification
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
    const [userData, setUserData] = useState(null); // To store user details/QR after login

    // Form Data
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        otp: '',
        phone_number: '', // Added
        date_of_birth: '',
        gender: 'male',
        blood_group: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        emergency_name: '',
        emergency_phone: '',
        emergency_relation: ''
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
            if (data.user_id) {
                localStorage.setItem('user_id', data.user_id);
                setUserData({ id: data.user_id });
            }
            setIsAuthenticated(true);
            // Ideally fetch user profile here to get QR code, but for now just showing dashboard
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterRequest = async (e) => {
        e.preventDefault();
        console.log("Submitting Patient Registration:", formData);
        setLoading(true);
        try {
            const data = await authApi.registerRequestPatient({
                full_name: formData.full_name,
                email: formData.email,
                password: formData.password,
                phone_number: formData.phone_number, // Added
                date_of_birth: formData.date_of_birth,
                gender: formData.gender,
                blood_group: formData.blood_group,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                emergency_name: formData.emergency_name,
                emergency_phone: formData.emergency_phone,
                emergency_relation: formData.emergency_relation
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
            const data = await authApi.verifyRegistration(formData.email, formData.otp);
            setStep(0); // Redirect to Login
            setSuccess('Registration Successful! Please login to view your QR Code.');
            setFormData(prev => ({ ...prev, otp: '', password: '' }));
            // Optional: Auto-login
        } catch (err) {
            setError(err.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id'); // Clear user_id
        setIsAuthenticated(false);
        setUserData(null);
        setStep(0);
        // Clear form
        setFormData({ ...formData, email: '', password: '', otp: '' });
    };

    // Animation Variants
    const slideVariants = {
        hidden: { x: 50, opacity: 0 },
        visible: { x: 0, opacity: 1 },
        exit: { x: -50, opacity: 0 }
    };

    if (isAuthenticated) {
        const userId = userData?.id || localStorage.getItem('user_id');
        const qrCodeUrl = userId ? `http://localhost:8000/static/qrcodes/${userId}.png` : null;

        return (
            <div className="page-container" style={{ padding: '2rem' }}>
                <div className="glass-panel" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h1>Patient Dashboard</h1>
                        <button onClick={handleLogout} className="btn-logout" style={{ width: 'auto' }}>
                            <LogOut size={20} style={{ marginRight: '8px' }} />
                            Logout
                        </button>
                    </div>

                    <div className="grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {/* QR Code Section */}
                        <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
                            <QrCode size={48} color="var(--primary-color)" style={{ margin: '0 auto 1rem' }} />
                            <h3>My Health ID</h3>
                            <p>Show this QR code to doctors or labs.</p>
                            {/* In a real app, fetch the actual QR image path from backend */}
                            <div style={{ margin: '1rem auto', padding: '1rem', background: 'white', display: 'inline-block', borderRadius: '10px' }}>
                                {qrCodeUrl ? (
                                    <img src={qrCodeUrl} alt="Patient QR Code" style={{ width: '200px', height: '200px' }} />
                                ) : (
                                    <p style={{ color: '#666', fontSize: '0.9rem' }}>QR Code not found</p>
                                )}
                            </div>
                        </div>

                        <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.5)' }}>
                            <User size={32} color="var(--primary-color)" />
                            <h3>Profile</h3>
                            <p><strong>Name:</strong> {formData.full_name || "Patient"}</p>
                            <p><strong>Email:</strong> {formData.email}</p>
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
                        <h2 style={{ fontSize: '2rem', color: 'var(--primary-dark)' }}>Patient Portal</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            {step === 0 ? 'Login to access your records' :
                                step === 1 ? 'Register as a Patient' : 'Verify your email'}
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
                                        New User?
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
                                    <label className="input-label">Full Name</label>
                                    <input className="input-field" type="text" name="full_name" value={formData.full_name} onChange={handleChange} required />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Email</label>
                                    <input className="input-field" type="email" name="email" value={formData.email} onChange={handleChange} required />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Phone Number</label>
                                    <input className="input-field" type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} required placeholder="+91 9876543210" />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Password</label>
                                    <input className="input-field" type="password" name="password" value={formData.password} onChange={handleChange} required />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="input-group">
                                        <label className="input-label">Date of Birth</label>
                                        <input className="input-field" type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Gender</label>
                                        <select className="input-field" name="gender" value={formData.gender} onChange={handleChange}>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Blood Group</label>
                                    <input className="input-field" type="text" name="blood_group" value={formData.blood_group} onChange={handleChange} placeholder="O+" />
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Address</label>
                                    <textarea className="input-field" name="address" value={formData.address} onChange={handleChange} rows={2} />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="input-group">
                                        <label className="input-label">City</label>
                                        <input className="input-field" type="text" name="city" value={formData.city} onChange={handleChange} required />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">State</label>
                                        <input className="input-field" type="text" name="state" value={formData.state} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Pincode</label>
                                    <input className="input-field" type="text" name="pincode" value={formData.pincode} onChange={handleChange} required />
                                </div>

                                <h4>Emergency Contact</h4>
                                <div className="input-group">
                                    <label className="input-label">Name</label>
                                    <input className="input-field" type="text" name="emergency_name" value={formData.emergency_name} onChange={handleChange} />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Phone</label>
                                    <input className="input-field" type="text" name="emergency_phone" value={formData.emergency_phone} onChange={handleChange} />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Relation</label>
                                    <input className="input-field" type="text" name="emergency_relation" value={formData.emergency_relation} onChange={handleChange} />
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

export default Patient;
