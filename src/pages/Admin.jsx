import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, ShieldCheck, Phone, Map, BadgeAlert, Mail, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Admin = () => {
    const { userProfile, signOutUser } = useAuth();

    return (
        <div className="page-container">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="dashboard-container"
            >
                <div className="dashboard-header">
                    <div>
                        <h1>Health Officer Portal</h1>
                        <p>Disease surveillance and public health monitoring</p>
                    </div>
                    <button onClick={signOutUser} className="btn-secondary">
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>

                <div className="dashboard-content">
                    <div className="profile-section theme-red">
                        <h2>
                            <ShieldCheck className="section-icon" size={24} />
                            Officer Profile
                        </h2>

                        <div className="profile-grid">
                            <div className="profile-item">
                                <label>Officer Name</label>
                                <div className="value">{userProfile?.officerName || 'N/A'}</div>
                            </div>
                            <div className="profile-item">
                                <label>Officer ID</label>
                                <div className="value badge red">
                                    <BadgeAlert size={16} />
                                    {userProfile?.officerId || 'N/A'}
                                </div>
                            </div>
                            <div className="profile-item">
                                <label>Region</label>
                                <div className="value">
                                    <Map size={16} />
                                    {userProfile?.region || 'N/A'}
                                </div>
                            </div>
                            <div className="profile-item">
                                <label>Phone</label>
                                <div className="value">
                                    <Phone size={16} />
                                    {userProfile?.phone || 'N/A'}
                                </div>
                            </div>
                            <div className="profile-item">
                                <label>Email</label>
                                <div className="value">
                                    <Mail size={16} />
                                    {userProfile?.email || 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="action-cards">
                        <div className="action-card">
                            <h3>Disease Trends</h3>
                            <p>View real-time analytics of disease outbreaks in your region.</p>
                            <button className="btn-primary" disabled>View Dashboard (Coming Soon)</button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Admin;
