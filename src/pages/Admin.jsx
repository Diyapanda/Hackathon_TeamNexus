import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, LogOut, ShieldAlert } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';

const Admin = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token')); // Simple check, ideally verify role

    const [formData, setFormData] = useState({
        email: '',
        password: ''
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
            if (data.role !== 'authority') {
                throw new Error("Unauthorized access");
            }
            localStorage.setItem('token', data.access_token);
            setIsAuthenticated(true);
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setFormData({ email: '', password: '' });
    };

    if (isAuthenticated) {
        return (
            <div className="page-container" style={{ padding: '2rem' }}>
                <div className="glass-panel" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h1>Health Officer Portal</h1>
                        <button onClick={handleLogout} className="btn-logout" style={{ width: 'auto' }}>
                            <LogOut size={20} style={{ marginRight: '8px' }} />
                            Logout
                        </button>
                    </div>

                    <div className="grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.5)' }}>
                            <ShieldAlert size={32} color="var(--primary-color)" />
                            <h3>Surveillance Dashboard</h3>
                            <p>Monitor disease outbreaks and trends.</p>
                            <p><em>(Analytics Coming Soon)</em></p>
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
                        <h2 style={{ fontSize: '2rem', color: 'var(--primary-dark)' }}>Health Officer Login</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Restricted Access. Authorized Personnel Only.
                        </p>
                    </div>

                    {error && <div className="error-msg" style={{ marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                    <form onSubmit={handleLogin}>
                        <div className="input-group">
                            <label className="input-label">Email Address</label>
                            <input className="input-field" type="email" name="email" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Password</label>
                            <input className="input-field" type="password" name="password" value={formData.password} onChange={handleChange} required />
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default Admin;
