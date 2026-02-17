import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { User, Stethoscope, ShieldCheck, Microscope, Activity, Database, Lock, QrCode, TrendingUp, Globe, Shield, Heart, Zap, CheckCircle, ArrowRight, Menu, X, Users, Clock, FileCheck, Sparkles, Code, Cpu, Cloud } from 'lucide-react';

const LandingPage = () => {
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fadeInUp = {
        initial: { opacity: 0, y: 60 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.8, ease: "easeOut" }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    return (
        <div className="landing-page">
            {/* Navigation Bar */}
            <motion.nav
                className={`navbar ${scrolled ? 'scrolled' : ''}`}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="nav-container">
                    <div className="nav-logo">
                        <Shield className="logo-icon" size={28} />
                        <span className="logo-text">MediGuard</span>
                    </div>
                    <div className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
                        <a href="#portals" onClick={() => setMobileMenuOpen(false)}>Portals</a>
                        <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
                        <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
                        <a href="#tech" onClick={() => setMobileMenuOpen(false)}>Technology</a>
                        <a href="#portals" className="nav-cta" onClick={() => setMobileMenuOpen(false)}>Get Started</a>
                    </div>
                    <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </motion.nav>

            {/* Animated Background Particles */}
            <div className="particles-bg">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="particle"
                        animate={{
                            y: [0, -30, 0],
                            x: [0, Math.random() * 20 - 10, 0],
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2
                        }}
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`
                        }}
                    />
                ))}
            </div>

            {/* Hero Section with Image */}
            <header className="hero-section">
                <motion.div
                    className="hero-overlay"
                    style={{ y, opacity }}
                />

                <div className="hero-content-wrapper">
                    <div className="hero-content">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="hero-badge"
                        >
                            <Zap size={16} />
                            <span>AI-Powered Healthcare Platform</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: -30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.2 }}
                        >
                            Welcome to <span className="highlight-gradient">MediGuard</span><br />
                            <span className="hero-tagline">Smart Health Records & Disease Intelligence</span>
                        </motion.h1>

                        <motion.p
                            variants={fadeInUp}
                            initial="initial"
                            animate="animate"
                            className="hero-subtitle"
                        >
                            Revolutionary digital healthcare platform that centralizes patient records,
                            streamlines prescriptions, and enables real-time disease monitoring for early prevention.
                        </motion.p>

                        <motion.div
                            className="hero-stats"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            <div className="stat-item">
                                <CheckCircle size={20} />
                                <span><strong>100%</strong> Secure</span>
                            </div>
                            <div className="stat-item">
                                <Activity size={20} />
                                <span><strong>Real-time</strong> Monitoring</span>
                            </div>
                            <div className="stat-item">
                                <Globe size={20} />
                                <span><strong>24/7</strong> Access</span>
                            </div>
                        </motion.div>

                        <motion.div
                            className="hero-buttons"
                            variants={fadeInUp}
                            initial="initial"
                            animate="animate"
                        >
                            <a href="#portals" className="btn-primary">
                                <span>Access Portals</span>
                                <ArrowRight size={20} />
                            </a>
                            <a href="#features" className="btn-secondary">
                                <span>Explore Features</span>
                            </a>
                        </motion.div>
                    </div>

                    <motion.div
                        className="hero-visual"
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.4 }}
                    >
                        <div className="hero-image-container">
                            <img
                                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80"
                                alt="Healthcare Professional"
                                className="hero-image"
                            />
                            <div className="floating-card card-1">
                                <QrCode size={24} />
                                <div>
                                    <h4>Smart Health Card</h4>
                                    <p>Instant Access</p>
                                </div>
                            </div>
                            <div className="floating-card card-2">
                                <TrendingUp size={24} />
                                <div>
                                    <h4>Disease Trends</h4>
                                    <p>Real-time Analytics</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    className="scroll-indicator"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <div className="scroll-line" />
                </motion.div>
            </header>

            {/* How It Works Section */}
            <section id="how-it-works" className="how-it-works-section">
                <div className="section-header">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="section-badge"
                    >
                        <Sparkles size={16} />
                        <span>Simple Process</span>
                    </motion.div>
                    <h2>How MediGuard Works</h2>
                    <p className="section-subtitle">
                        Three simple steps to revolutionize your healthcare experience
                    </p>
                </div>

                <div className="steps-container">
                    <StepCard
                        number="01"
                        icon={<QrCode size={32} />}
                        title="Get Your Smart Health Card"
                        description="Receive a unique QR/NFC-enabled Smart Health Card that securely links to your complete medical history."
                        delay={0}
                    />
                    <StepCard
                        number="02"
                        icon={<Activity size={32} />}
                        title="Access Anywhere, Anytime"
                        description="Healthcare providers scan your card to instantly access your records, prescriptions, and medical history."
                        delay={0.2}
                    />
                    <StepCard
                        number="03"
                        icon={<TrendingUp size={32} />}
                        title="Real-time Health Intelligence"
                        description="Our AI analyzes anonymized data to detect disease patterns and enable early prevention measures."
                        delay={0.4}
                    />
                </div>
            </section>

            {/* Access Portals Section */}
            <section id="portals" className="portals-section">
                <div className="section-header">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="section-badge"
                    >
                        <Shield size={16} />
                        <span>Secure Access</span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        Choose Your Portal
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="section-subtitle"
                    >
                        Role-based access for patients, healthcare providers, and administrators
                    </motion.p>
                </div>

                <motion.div
                    className="portal-grid"
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                >
                    <PortalCard
                        to="/login/patient"
                        icon={<User size={32} />}
                        title="Patient Portal"
                        description="Access your complete medical history securely via Smart Health Card (QR/NFC)."
                        color="blue"
                        image="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80"
                        features={["Medical Records", "Prescriptions", "Appointments"]}
                    />
                    <PortalCard
                        to="/login/doctor"
                        icon={<Stethoscope size={32} />}
                        title="Doctor Portal"
                        description="View patient records, update diagnoses, and manage prescriptions efficiently."
                        color="green"
                        image="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80"
                        features={["Patient Records", "Diagnosis", "E-Prescriptions"]}
                    />
                    <PortalCard
                        to="/login/health-officer"
                        icon={<ShieldCheck size={32} />}
                        title="Health Officer"
                        description="Monitor disease trends, analyze patterns, and manage surveillance data."
                        color="red"
                        image="https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&q=80"
                        features={["Analytics Dashboard", "Disease Mapping", "Reports"]}
                    />
                    <PortalCard
                        to="/login/laboratory"
                        icon={<Microscope size={32} />}
                        title="Laboratory"
                        description="Upload test results, generate reports, and contribute to health data."
                        color="purple"
                        image="https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400&q=80"
                        features={["Test Results", "Reports", "Data Upload"]}
                    />
                </motion.div>
            </section>

            {/* Features Section with Images */}
            <section id="features" className="features-section">
                <div className="features-content">
                    <div className="features-text">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="section-badge"
                        >
                            <Heart size={16} />
                            <span>Key Features</span>
                        </motion.div>
                        <h2>Revolutionizing Healthcare Management</h2>
                        <p className="features-intro">
                            Our platform combines cutting-edge technology with healthcare expertise
                            to deliver a comprehensive solution for modern medical challenges.
                        </p>

                        <div className="features-list">
                            <FeatureItem
                                icon={<Database size={28} />}
                                title="Centralized Medical Records"
                                description="Unified medical history accessible via Smart Health Card (QR/NFC). All patient data in one secure location."
                            />
                            <FeatureItem
                                icon={<Activity size={28} />}
                                title="Real-time Disease Surveillance"
                                description="Advanced analytics monitor disease patterns by location and time, enabling early intervention and prevention."
                            />
                            <FeatureItem
                                icon={<Lock size={28} />}
                                title="Military-Grade Security"
                                description="End-to-end encryption, role-based access control, and complete patient anonymity in analytics."
                            />
                        </div>
                    </div>

                    <motion.div
                        className="features-visual"
                        initial={{ opacity: 0, x: 100 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="feature-image-grid">
                            <div className="feature-img-card">
                                <img
                                    src="https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=600&q=80"
                                    alt="Disease Surveillance Dashboard"
                                />
                                <div className="img-overlay">
                                    <TrendingUp size={32} />
                                    <h4>Disease Analytics</h4>
                                </div>
                            </div>
                            <div className="feature-img-card">
                                <img
                                    src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80"
                                    alt="Secure Data"
                                />
                                <div className="img-overlay">
                                    <Shield size={32} />
                                    <h4>Data Security</h4>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Technology Stack Section */}
            <section id="tech" className="tech-section">
                <div className="section-header">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="section-badge"
                    >
                        <Code size={16} />
                        <span>Technology</span>
                    </motion.div>
                    <h2>Built with Cutting-Edge Technology</h2>
                    <p className="section-subtitle">
                        Powered by modern, scalable, and secure technologies
                    </p>
                </div>

                <div className="tech-grid">
                    <TechCard icon={<Cpu />} title="AI & Machine Learning" description="Advanced pattern recognition" />
                    <TechCard icon={<Cloud />} title="Cloud Infrastructure" description="Scalable & reliable" />
                    <TechCard icon={<Lock />} title="Blockchain Security" description="Immutable records" />
                    <TechCard icon={<Database />} title="Big Data Analytics" description="Real-time insights" />
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="stats-grid">
                    <StatCard number="100%" label="Encrypted Data" />
                    <StatCard number="24/7" label="System Uptime" />
                    <StatCard number="Real-time" label="Disease Tracking" />
                    <StatCard number="Multi-role" label="Access Control" />
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <motion.div
                    className="cta-content"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2>Ready to Transform Healthcare?</h2>
                    <p>Join thousands of healthcare providers using MediGuard to deliver better patient care</p>
                    <div className="cta-buttons">
                        <a href="#portals" className="btn-primary">
                            <span>Get Started Now</span>
                            <ArrowRight size={20} />
                        </a>
                        <a href="#features" className="btn-secondary">
                            <span>Learn More</span>
                        </a>
                    </div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <h3>MediGuard</h3>
                        <p>Your Health, Intelligently Protected</p>
                    </div>
                    <div className="footer-links">
                        <a href="#portals">Portals</a>
                        <a href="#features">Features</a>
                        <a href="#privacy">Privacy</a>
                        <a href="#contact">Contact</a>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 MediGuard. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

const StepCard = ({ number, icon, title, description, delay }) => (
    <motion.div
        className="step-card"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.6 }}
    >
        <div className="step-number">{number}</div>
        <div className="step-icon">{icon}</div>
        <h3>{title}</h3>
        <p>{description}</p>
    </motion.div>
);

const TechCard = ({ icon, title, description }) => (
    <motion.div
        className="tech-card"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        whileHover={{ y: -10 }}
    >
        <div className="tech-icon">{icon}</div>
        <h4>{title}</h4>
        <p>{description}</p>
    </motion.div>
);

const PortalCard = ({ to, icon, title, description, color, image, features }) => (
    <motion.div
        className={`portal-card ${color}`}
        variants={{
            initial: { opacity: 0, y: 40 },
            animate: { opacity: 1, y: 0 }
        }}
        whileHover={{ y: -15, transition: { duration: 0.3 } }}
    >
        <Link to={to} className="portal-link">
            <div className="portal-image">
                <img src={image} alt={title} />
                <div className="portal-image-overlay" />
            </div>
            <div className="portal-content">
                <div className="icon-wrapper">{icon}</div>
                <h3>{title}</h3>
                <p>{description}</p>
                <ul className="portal-features">
                    {features.map((feature, idx) => (
                        <li key={idx}>
                            <CheckCircle size={14} />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
                <div className="portal-arrow">
                    <span>Access Now</span>
                    <ArrowRight size={18} />
                </div>
            </div>
        </Link>
    </motion.div>
);

const FeatureItem = ({ icon, title, description }) => (
    <motion.div
        className="feature-item"
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
    >
        <div className="feature-icon-wrapper">{icon}</div>
        <div className="feature-text">
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    </motion.div>
);

const StatCard = ({ number, label }) => (
    <motion.div
        className="stat-card"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.05 }}
    >
        <h3>{number}</h3>
        <p>{label}</p>
    </motion.div>
);

export default LandingPage;
