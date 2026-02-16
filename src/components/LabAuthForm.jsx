import React, { useState } from 'react';
import { useSignIn, useSignUp, useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Shield, Microscope } from 'lucide-react';

const initialRegister = {
  labName: '',
  registrationNumber: '',
  adminName: '',
  adminId: '',
  address: '',
  phone1: '',
  phone2: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export default function LabAuthForm() {
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
      navigate('/laboratory');
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
    if (!r.labName?.trim()) return 'Lab Name is required';
    if (!r.registrationNumber?.trim()) return 'Registration Number is required';
    if (!r.adminName?.trim()) return 'Admin Name is required';
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

      // Store lab metadata in localStorage temporarily
      // It will be synced to Clerk after email verification
      localStorage.setItem('pendingLabMetadata', JSON.stringify({
        labName: String(registerForm.labName).trim(),
        registrationNumber: String(registerForm.registrationNumber).trim(),
        adminName: String(registerForm.adminName).trim(),
        adminId: String(registerForm.adminId).trim(),
        address: String(registerForm.address).trim(),
        phone1: String(registerForm.phone1).trim(),
        phone2: String(registerForm.phone2).trim(),
        role: 'laboratory',
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
        navigate('/laboratory');
      } else {
        // Should not happen for passwordless/email-password flow unless MFA enabled
        console.log('SignIn status:', result.status);
      }
    } catch (err) {
      console.error('Clerk signin error:', err);
      // Extract detailed error message from Clerk
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
      // Attempt verification with the code
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode.trim(),
      });

      if (result.status === 'complete') {
        // Do not set active session immediately. Require user to login.
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

      // If session already exists, verification likely succeeded
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
      <div className="auth-visual">
        <div className="auth-badge">
          <Shield size={16} />
          <span>Laboratory</span>
        </div>
        <h3 className="auth-title">Secure lab access for test uploads & reporting</h3>
        <p className="auth-sub">Create an account to start uploading test results and contributing to public health surveillance.</p>

        <div className="mini-cards">
          <div className="mini-card">
            <div className="mini-icon"><Microscope size={18} /></div>
            <div>
              <strong>Fast uploads</strong>
              <div className="muted">CSV / PDF</div>
            </div>
          </div>
          <div className="mini-card">
            <div className="mini-icon"><Shield size={18} /></div>
            <div>
              <strong>Verified labs</strong>
              <div className="muted">Reg. & secure</div>
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
            <div className="two-col">
              <label>
                Lab Name *
                <input name="labName" value={registerForm.labName} onChange={handleRegisterChange} type="text" required />
              </label>
              <label>
                Registration Number *
                <input name="registrationNumber" value={registerForm.registrationNumber} onChange={handleRegisterChange} type="text" required />
              </label>
            </div>

            <div className="two-col">
              <label>
                Admin Name *
                <input name="adminName" value={registerForm.adminName} onChange={handleRegisterChange} type="text" required />
              </label>
              <label>
                Admin ID
                <input name="adminId" value={registerForm.adminId} onChange={handleRegisterChange} type="text" />
              </label>
            </div>

            <label>
              Lab Address
              <input name="address" value={registerForm.address} onChange={handleRegisterChange} type="text" />
            </label>

            <div className="two-col">
              <label>
                Phone 1
                <input name="phone1" value={registerForm.phone1} onChange={handleRegisterChange} type="text" />
              </label>
              <label>
                Phone 2
                <input name="phone2" value={registerForm.phone2} onChange={handleRegisterChange} type="text" />
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


