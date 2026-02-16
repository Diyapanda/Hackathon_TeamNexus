import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, Stethoscope, Building2, MapPin, BadgeCheck, Mail, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Doctor = () => {
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
                        <h1>Doctor Portal</h1>
                        <p>Manage patient records and prescriptions</p>
                    </div>
                    <button onClick={signOutUser} className="btn-secondary">
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>

                <div className="dashboard-content">
                    <div className="profile-section">
                        <h2>
                            <User className="section-icon" size={24} />
                            Doctor Profile
                        </h2>

                        <div className="profile-grid">
                            <div className="profile-item">
                                <label>Doctor Name</label>
                                <div className="value">{userProfile?.doctorName || 'N/A'}</div>
                            </div>
                            <div className="profile-item">
                                <label>License Number</label>
                                <div className="value badge">
                                    <BadgeCheck size={16} />
                                    {userProfile?.licenseNumber || 'N/A'}
                                </div>
                            </div>
                            <div className="profile-item">
                                <label>Specialization</label>
                                <div className="value">
                                    <Stethoscope size={16} />
                                    {userProfile?.specialization || 'N/A'}
                                </div>
                            </div>
                            <div className="profile-item">
                                <label>Hospital Name</label>
                                <div className="value">
                                    <Building2 size={16} />
                                    {userProfile?.hospitalName || 'N/A'}
                                </div>
                            </div>
                            <div className="profile-item">
                                <label>City</label>
                                <div className="value">
                                    <MapPin size={16} />
                                    {userProfile?.city || 'N/A'}
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
                            <h3>Patient Access</h3>
                            <p>Scan a Patient's Smart Health Card to view their medical history.</p>
                            <button className="btn-primary" disabled>Scan QR Code (Coming Soon)</button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Doctor;
