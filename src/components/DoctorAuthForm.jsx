import React, { useState } from 'react';
import { useSignIn, useSignUp, useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, HeartPulse } from 'lucide-react';

const initialRegister = {
    doctorName: '',
    licenseNumber: '',
    specialization: '',
    hospitalName: '',
    city: '',
    email: '',
    password: '',
    confirmPassword: '',
};

export default function DoctorAuthForm() {
    const [mode, setMode] = useState('login');
    const [registerForm, setRegisterForm] = useState(initialRegister);
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [verificationCode, setVerificationCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const { signIn } = useSignIn();
    const { signUp } = useSignUp();
    const { isSignedIn } = useClerkAuth();
    const clerk = useClerk();
    const navigate = useNavigate();

    // Auto-redirect if already signed in
    React.useEffect(() => {
        if (isSignedIn) {
            navigate('/doctor');
        }
    }, [isSignedIn, navigate]);

    const handleRegisterChange = (e) => {
        setRegisterForm((s) => ({ ...s, [e.target.name]: e.target.value }));
    };

    const handleLoginChange = (e) => {
        setLoginForm((s) => ({ ...s, [e.target.name]: e.target.value }));
    };

    const validateRegister = () => {
        const r = registerForm;

        // Required fields
        if (!r.doctorName?.trim()) return 'Doctor Name is required';
        if (!r.licenseNumber?.trim()) return 'License Number is required';
        if (!r.specialization?.trim()) return 'Specialization is required';
        if (!r.hospitalName?.trim()) return 'Hospital Name is required';
        if (!r.city?.trim()) return 'City is required';
        if (!r.email?.trim()) return 'Email is required';
        if (!r.password?.trim()) return 'Password is required';

        // Email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(r.email)) return 'Email format is invalid (e.g., user@example.com)';

        // Password strength
        if (r.password.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(r.password)) return 'Password must contain at least 1 uppercase letter';
        if (!/[0-9]/.test(r.password)) return 'Password must contain at least 1 number';

        // Confirm password
        if (r.password !== r.confirmPassword) return "Passwords don't match";

        return null;
    };

    const onRegister = async (e) => {
        e.preventDefault();
        setError(null);
        const v = validateRegister();
        if (v) return setError(v);
        setLoading(true);
        try {
            // Create Clerk account (only email & password)
            const result = await signUp.create({
                emailAddress: registerForm.email,
                password: registerForm.password,
            });

            // Store doctor metadata in localStorage temporarily
            localStorage.setItem('pendingDoctorMetadata', JSON.stringify({
                doctorName: String(registerForm.doctorName).trim(),
                licenseNumber: String(registerForm.licenseNumber).trim(),
                specialization: String(registerForm.specialization).trim(),
                hospitalName: String(registerForm.hospitalName).trim(),
                city: String(registerForm.city).trim(),
                role: 'doctor',
            }));

            // Start email verification
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            setMessage('Account created! Check your email for a 6-digit verification code. Enter it to complete registration.');
            setRegisterForm(initialRegister);
            setMode('verify');
        } catch (err) {
            console.error('Clerk signup error:', err);
            const clerkError = err?.errors?.[0];
            if (clerkError) {
                const field = clerkError.metadata?.paramName || clerkError.code || 'form';
                const msg = clerkError.message || 'Validation error';
                setError(`${field}: ${msg}`);
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('Registration failed. Please check your inputs and try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const onLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const result = await signIn.create({
                identifier: loginForm.email,
                password: loginForm.password,
            });

            if (result.status === 'complete') {
                await clerk.setActive({ session: result.createdSessionId });
                navigate('/doctor');
            } else {
                console.log('SignIn status:', result.status);
            }
        } catch (err) {
            console.error('Clerk signin error:', err);
            const clerkError = err?.errors?.[0];
            if (clerkError) {
                const msg = clerkError.message || 'Login failed';
                setError(msg);
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('Login failed. Check your email and password.');
            }
        } finally {
            setLoading(false);
        }
    };

    const onVerify = async (e) => {
        e.preventDefault();
        setError(null);
        if (!verificationCode.trim()) return setError('Enter the 6-digit verification code');
        setLoading(true);
        try {
            const result = await signUp.attemptEmailAddressVerification({
                code: verificationCode.trim(),
            });

            if (result.status === 'complete') {
                setMessage('Email verified! Please log in with your credentials.');
                setTimeout(() => {
                    setMode('login');
                    setVerificationCode('');
                    setMessage(null);
                }, 2000);
            } else {
                setError('Verification incomplete. Please try again.');
            }
        } catch (err) {
            console.error('Clerk verification error:', err);

            const errorCode = err?.errors?.[0]?.code;
            const errorMessage = err?.message || '';

            if (errorMessage.includes('session_exists') || errorCode === 'session_exists') {
                setMessage('Email verified! Please log in with your credentials.');
                setTimeout(() => {
                    setMode('login');
                    setVerificationCode('');
                    setMessage(null);
                }, 2000);
                return;
            }

            const clerkError = err?.errors?.[0];
            if (clerkError) {
                const msg = clerkError.message || 'Invalid verification code';
                setError(msg);
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('Verification failed. Check the code and try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-card">
            <div className="auth-visual doctor-visual">
                <div className="auth-badge">
                    <Stethoscope size={16} />
                    <span>Doctor</span>
                </div>
                <h3 className="auth-title">Manage patient care & prescriptions effectively</h3>
                <p className="auth-sub">Access patient history, update diagnoses, and manage treatments securely.</p>

                <div className="mini-cards">
                    <div className="mini-card">
                        <div className="mini-icon"><HeartPulse size={18} /></div>
                        <div>
                            <strong>Patient Care</strong>
                            <div className="muted">Holistic View</div>
                        </div>
                    </div>
                    <div className="mini-card">
                        <div className="mini-icon"><Stethoscope size={18} /></div>
                        <div>
                            <strong>Diagnosis</strong>
                            <div className="muted">Quick Updates</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="auth-panel">
                {mode !== 'verify' && (
                    <div className="auth-tabs">
                        <button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError(null); setMessage(null); }}>Login</button>
                        <button className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setError(null); setMessage(null); }}>Register</button>
                    </div>
                )}

                {message && <div className="alert success">{message}</div>}
                {error && <div className="alert error">{error}</div>}

                {mode === 'verify' ? (
                    <form onSubmit={onVerify} className="auth-form">
                        <h3 style={{ marginTop: '0px', marginBottom: '10px', fontSize: '16px', fontWeight: '600' }}>Verify your email</h3>
                        <p style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>Enter the 6-digit code sent to your email</p>
                        <label>
                            Verification Code
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder="000000"
                                maxLength="6"
                                required
                                style={{ letterSpacing: '4px', fontSize: '18px', textAlign: 'center', fontWeight: 'bold' }}
                            />
                        </label>

                        <div className="form-actions">
                            <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Verifying…' : 'Verify email'}</button>
                            <button type="button" className="btn-secondary" onClick={() => { setMode('register'); setVerificationCode(''); }}>Back</button>
                        </div>
                    </form>
                ) : mode === 'login' ? (
                    <form onSubmit={onLogin} className="auth-form">
                        <label>
                            Email
                            <input name="email" value={loginForm.email} onChange={handleLoginChange} type="email" required />
                        </label>
                        <label>
                            Password
                            <input name="password" value={loginForm.password} onChange={handleLoginChange} type="password" required />
                        </label>

                        <div className="form-actions">
                            <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
                            <button type="button" className="btn-secondary" onClick={() => setLoginForm({ email: '', password: '' })}>Reset</button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={onRegister} className="auth-form">
                        <label>
                            Doctor Name *
                            <input name="doctorName" value={registerForm.doctorName} onChange={handleRegisterChange} type="text" required />
                        </label>

                        <div className="two-col">
                            <label>
                                License Number *
                                <input name="licenseNumber" value={registerForm.licenseNumber} onChange={handleRegisterChange} type="text" required />
                            </label>
                            <label>
                                Specialization *
                                <input name="specialization" value={registerForm.specialization} onChange={handleRegisterChange} type="text" required />
                            </label>
                        </div>

                        <div className="two-col">
                            <label>
                                Hospital Name *
                                <input name="hospitalName" value={registerForm.hospitalName} onChange={handleRegisterChange} type="text" required />
                            </label>
                            <label>
                                City *
                                <input name="city" value={registerForm.city} onChange={handleRegisterChange} type="text" required />
                            </label>
                        </div>

                        <div className="two-col">
                            <label>
                                Email *
                                <input name="email" value={registerForm.email} onChange={handleRegisterChange} type="email" required />
                            </label>
                            <label>
                                Password * (min 8 chars)
                                <input name="password" value={registerForm.password} onChange={handleRegisterChange} type="password" required />
                            </label>
                        </div>

                        <label>
                            Confirm Password *
                            <input name="confirmPassword" value={registerForm.confirmPassword} onChange={handleRegisterChange} type="password" required />
                        </label>

                        <div className="form-actions">
                            <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</button>
                            <button type="button" className="btn-secondary" onClick={() => setRegisterForm(initialRegister)}>Reset</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
