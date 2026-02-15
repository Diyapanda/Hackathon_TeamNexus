import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Patient = () => {
    return (
        <div className="page-container">
            <Link to="/" className="back-link">
                <ArrowLeft size={24} /> Back to Home
            </Link>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="content-box"
            >
                <h1>Patient Portal</h1>
                <p>Access your medical history securely.</p>
            </motion.div>
        </div>
    );
};

export default Patient;
