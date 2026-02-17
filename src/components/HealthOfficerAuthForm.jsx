import React, { useState } from 'react';
import { useSignIn, useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, TrendingUp, Info } from 'lucide-react';

export default function HealthOfficerAuthForm() {
    // Hardcoded credentials removed as requested
    const [loginForm, setLoginForm] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { signIn } = useSignIn();
    const { isSignedIn } = useClerkAuth();
    const clerk = useClerk();
    const navigate = useNavigate();

    // Auto-redirect if already signed in
    React.useEffect(() => {
        if (isSignedIn) {
            navigate('/admin');
        }
    }, [isSignedIn, navigate]);

    const handleLoginChange = (e) => {
        setLoginForm((s) => ({ ...s, [e.target.name]: e.target.value }));
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
                navigate('/admin');
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

    return (
        <div className="auth-card">
            <div className="auth-visual admin-visual">
                <div className="auth-badge">
                    <ShieldCheck size={16} />
                    <span>Health Officer</span>
                </div>
                <h3 className="auth-title">Monitor disease trends & ensure public safety</h3>
                <p className="auth-sub">Access surveillance dashboards, track disease outbreaks, and manage health resources efficiently.</p>

                <div className="mini-cards">
                    <div className="mini-card">
                        <div className="mini-icon"><TrendingUp size={18} /></div>
                        <div>
                            <strong>Disease Trends</strong>
                            <div className="muted">Real-time Data</div>
                        </div>
                    </div>
                    <div className="mini-card">
                        <div className="mini-icon"><ShieldCheck size={18} /></div>
                        <div>
                            <strong>Surveillance</strong>
                            <div className="muted">Region-based</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="auth-panel">
                {error && <div className="alert error">{error}</div>}

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
                    </div>
                </form>
            </div>
        </div>
    );
}
