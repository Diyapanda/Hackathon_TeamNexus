import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, User, Calendar, Droplet, MapPin, Phone, HeartPulse, QrCode } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import QRCode from 'react-qr-code';

const Patient = () => {
    const { userProfile, signOutUser } = useAuth();

    // QR Code Value - securely identifies the patient
    const qrValue = JSON.stringify({
        id: userProfile?.patientId,
        type: 'patient',
        name: userProfile?.fullName
    });

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
                        <h1>Patient Portal</h1>
                        <p>Your Secure Health Record</p>
                    </div>
                    <button onClick={signOutUser} className="btn-secondary">
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>

                <div className="dashboard-content">
                    <div className="profile-section theme-blue">
                        <h2>
                            <User className="section-icon" size={24} />
                            My Profile
                        </h2>

                        <div className="profile-grid">
                            <div className="profile-item">
                                <label>Full Name</label>
                                <div className="value">{userProfile?.fullName || 'N/A'}</div>
                            </div>
                            <div className="profile-item">
                                <label>Patient ID</label>
                                <div className="value badge bg-blue-light text-blue">
                                    {userProfile?.patientId || 'N/A'}
                                </div>
                            </div>
                            <div className="profile-item">
                                <label>Date of Birth</label>
                                <div className="value">
                                    <Calendar size={16} />
                                    {userProfile?.dateOfBirth || 'N/A'}
                                </div>
                            </div>
                            <div className="profile-item">
                                <label>Gender</label>
                                <div className="value">
                                    {userProfile?.gender || 'N/A'}
                                </div>
                            </div>
                            <div className="profile-item">
                                <label>Blood Group</label>
                                <div className="value badge red">
                                    <Droplet size={16} />
                                    {userProfile?.bloodGroup || 'N/A'}
                                </div>
                            </div>
                            <div className="profile-item">
                                <label>Phone</label>
                                <div className="value">
                                    <Phone size={16} />
                                    {userProfile?.phone || 'N/A'}
                                </div>
                            </div>
                            <div className="profile-item" style={{ gridColumn: 'span 2' }}>
                                <label>Address</label>
                                <div className="value">
                                    <MapPin size={16} />
                                    {userProfile?.address || 'N/A'}
                                </div>
                            </div>
                            <div className="profile-item" style={{ gridColumn: 'span 2' }}>
                                <label>Emergency Contact</label>
                                <div className="value">
                                    <HeartPulse size={16} style={{ color: '#e11d48' }} />
                                    {userProfile?.emergencyContact || 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="action-cards">
                        <div className="action-card" style={{ textAlign: 'center' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <QrCode size={24} /> Smart Health Card
                            </h3>
                            <p>Show this QR code to healthcare providers to grant access to your medical history.</p>

                            <div style={{
                                background: 'white',
                                padding: '1.5rem',
                                borderRadius: '16px',
                                display: 'inline-block',
                                border: '2px solid #e2e8f0',
                                marginTop: '1rem'
                            }}>
                                <QRCode
                                    value={qrValue}
                                    size={180}
                                    level="H"
                                    fgColor="#0f172a"
                                />
                            </div>
                            <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                                Securely Encrypted
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Patient;
