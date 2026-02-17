import React, { useState, useEffect } from 'react';
import { useSignIn, useSignUp, useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, MapPin, Calendar, Activity, Heart, ArrowRight, Loader } from 'lucide-react';

const PatientAuthForm = () => {
    const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn();
    const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
    const { client } = useClerk();
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [code, setCode] = useState('');

    // Patient Registration State
    const [registerData, setRegisterData] = useState({
        fullName: '',
        dateOfBirth: '',
        gender: 'select',
        bloodGroup: 'select',
        address: '',
        phone: '',
        emergencyContact: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // Login State
    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });

    // Auto-redirect if already signed in
    useEffect(() => {
        if (client.sessions?.length > 0) {
            const session = client.sessions[0];
            if (session.user.publicMetadata.role === 'patient' || session.user.unsafeMetadata.role === 'patient') {
                navigate('/patient');
            }
        }
    }, [client.sessions, navigate]);

    const handleRegisterChange = (e) => {
        setRegisterData({ ...registerData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleLoginChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!isSignInLoaded) return;
        setLoading(true);
        setError('');

        try {
            const result = await signIn.create({
                identifier: loginData.email,
                password: loginData.password,
            });

            if (result.status === 'complete') {
                await setSignInActive({ session: result.createdSessionId });
                navigate('/patient');
            } else {
                console.log('Login incomplete:', result);
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.errors?.[0]?.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!isSignUpLoaded) return;

        if (registerData.password !== registerData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (registerData.gender === 'select' || registerData.bloodGroup === 'select') {
            setError("Please select Gender and Blood Group");
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Create user in Clerk
            await signUp.create({
                emailAddress: registerData.email,
                password: registerData.password,
                firstName: registerData.fullName.split(' ')[0],
                lastName: registerData.fullName.split(' ').slice(1).join(' '),
            });

            // Prepare Patient Metadata
            const patientMetadata = {
                role: 'patient',
                fullName: registerData.fullName,
                dateOfBirth: registerData.dateOfBirth,
                gender: registerData.gender,
                bloodGroup: registerData.bloodGroup,
                address: registerData.address,
                phone: registerData.phone,
                emergencyContact: registerData.emergencyContact,
                patientId: `PAT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
            };

            // Store in localStorage for sync after verification
            localStorage.setItem('pendingPatientMetadata', JSON.stringify(patientMetadata));

            // Send verification email
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            setVerifying(true);

        } catch (err) {
            console.error('Registration error:', err);
            setError(err.errors?.[0]?.message || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!isSignUpLoaded) return;
        setLoading(true);

        try {
            const result = await signUp.attemptEmailAddressVerification({ code });

            if (result.status === 'complete') {
                // Verification successful.
                // We do NOT automatically set active session here to ensure metadata sync works reliably on next login
                // or we rely on the AuthContext metadata sync if we used setActive.
                // For consistency with other forms, we'll ask them to login.
                alert('Verification successful! Please log in to access your dashboard.');
                setVerifying(false);
                setIsLogin(true);
            } else {
                setError('Verification failed. Please try again.');
            }
        } catch (err) {
            console.error('Verification error:', err);
            if (err.errors?.[0]?.code === 'session_exists') {
                alert("You are already verified. Please log in.");
                setIsLogin(true);
                setVerifying(false);
            } else {
                setError(err.errors?.[0]?.message || 'Verification failed');
            }
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <div className="auth-card">
                <div className="auth-visual">
                    <div className="auth-badge">
                        <User size={16} /> Patient Portal
                    </div>
                    <h2 className="auth-title">Verify Email</h2>
                    <p className="auth-sub">Enter the code sent to {registerData.email}</p>
                </div>
                <div className="auth-panel">
                    <form onSubmit={handleVerify} className="auth-form">
                        <label>Verification Code</label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Enter 6-digit code"
                            required
                        />
                        {error && <div className="alert error">{error}</div>}
                        <div className="form-actions">
                            <button type="submit" disabled={loading}>
                                {loading ? 'Verifying...' : 'Verify Email'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-card">
            <div className="auth-visual">
                <div className="auth-badge">
                    <User size={16} /> Patient Portal
                </div>
                <h2 className="auth-title">
                    {isLogin ? 'Welcome Back' : 'Patient Registration'}
                </h2>
                <p className="auth-sub">
                    {isLogin
                        ? 'Access your medical history securely.'
                        : 'Join MediGuard for secure health records.'}
                </p>

                <div className="mini-cards">
                    <div className="mini-card">
                        <div className="mini-icon"><Activity size={18} /></div>
                        <div>
                            <strong>Health Records</strong>
                            <div className="muted">Secure Access</div>
                        </div>
                    </div>
                    <div className="mini-card">
                        <div className="mini-icon"><Heart size={18} /></div>
                        <div>
                            <strong>Vital Tracking</strong>
                            <div className="muted">Real-time</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="auth-panel">
                <div className="auth-tabs">
                    <button
                        className={isLogin ? 'active' : ''}
                        onClick={() => setIsLogin(true)}
                    >
                        Login
                    </button>
                    <button
                        className={!isLogin ? 'active' : ''}
                        onClick={() => setIsLogin(false)}
                    >
                        Register
                    </button>
                </div>

                {error && <div className="alert error">{error}</div>}

                {isLogin ? (
                    <form onSubmit={handleLogin} className="auth-form">
                        <div>
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={loginData.email}
                                onChange={handleLoginChange}
                                placeholder="Ex: john.doe@example.com"
                                required
                            />
                        </div>
                        <div>
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={loginData.password}
                                onChange={handleLoginChange}
                                placeholder="********"
                                required
                            />
                        </div>
                        <div className="form-actions">
                            <button type="submit" disabled={loading} className="btn-primary">
                                {loading ? <Loader className="spin" size={20} /> : (
                                    <>Sign In <ArrowRight size={18} /></>
                                )}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleRegister} className="auth-form">
                        <div>
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={registerData.fullName}
                                onChange={handleRegisterChange}
                                placeholder="Ex: John Doe"
                                required
                            />
                        </div>

                        <div className="two-col">
                            <div>
                                <label>Date of Birth</label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={registerData.dateOfBirth}
                                    onChange={handleRegisterChange}
                                    required
                                />
                            </div>
                            <div>
                                <label>Gender</label>
                                <select
                                    name="gender"
                                    value={registerData.gender}
                                    onChange={handleRegisterChange}
                                    style={{
                                        width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px',
                                        border: '1px solid rgba(2,6,23,0.06)', background: 'white', marginTop: '0.45rem'
                                    }}
                                >
                                    <option value="select">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="two-col">
                            <div>
                                <label>Blood Group</label>
                                <select
                                    name="bloodGroup"
                                    value={registerData.bloodGroup}
                                    onChange={handleRegisterChange}
                                    style={{
                                        width: '100%', padding: '0.75rem 0.9rem', borderRadius: '10px',
                                        border: '1px solid rgba(2,6,23,0.06)', background: 'white', marginTop: '0.45rem'
                                    }}
                                >
                                    <option value="select">Select</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                </select>
                            </div>
                            <div>
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={registerData.phone}
                                    onChange={handleRegisterChange}
                                    placeholder="Ex: +1 234 567 890"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label>Address</label>
                            <input
                                type="text"
                                name="address"
                                value={registerData.address}
                                onChange={handleRegisterChange}
                                placeholder="Ex: 123 Main St, City"
                                required
                            />
                        </div>

                        <div>
                            <label>Emergency Contact</label>
                            <input
                                type="text"
                                name="emergencyContact"
                                value={registerData.emergencyContact}
                                onChange={handleRegisterChange}
                                placeholder="Name & Phone Number"
                                required
                            />
                        </div>

                        <div>
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={registerData.email}
                                onChange={handleRegisterChange}
                                placeholder="Ex: john@example.com"
                                required
                            />
                        </div>

                        <div className="two-col">
                            <div>
                                <label>Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={registerData.password}
                                    onChange={handleRegisterChange}
                                    placeholder="Create password"
                                    required
                                />
                            </div>
                            <div>
                                <label>Confirm</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={registerData.confirmPassword}
                                    onChange={handleRegisterChange}
                                    placeholder="Repeat password"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" disabled={loading} className="btn-primary">
                                {loading ? <Loader className="spin" size={20} /> : 'Create Patient Account'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div >
    );
};

export default PatientAuthForm;
