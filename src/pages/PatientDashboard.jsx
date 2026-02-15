import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  Users, 
  FileText, 
  MessageSquare, 
  Activity, 
  User,
  Menu,
  X,
  Shield,
  LogOut
} from 'lucide-react';
import MedicalHistory from '../components/dashboard/MedicalHistory';
import Connections from '../components/dashboard/Connections';
import LatestReports from '../components/dashboard/LatestReports';
import AIChat from '../components/dashboard/AIChat';
import MajorOperations from '../components/dashboard/MajorOperations';
import Profile from '../components/dashboard/Profile';

const PatientDashboard = () => {
  const [activeSection, setActiveSection] = useState('medical-history');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/patient/profile');
        if (response.ok) {
          const data = await response.json();
          // Add cache buster to photo URL to ensure fresh render in header
          if (data.profile_photo) {
            data.profile_photo = `${data.profile_photo}?t=${Date.now()}`;
          }
          setProfile(data);
        }
      } catch (error) {
        console.error("Error fetching profile in dashboard:", error);
      }
    };

    fetchProfile();

    // Listen for updates from Profile tab
    window.addEventListener('mediguard:profile-updated', fetchProfile);
    return () => window.removeEventListener('mediguard:profile-updated', fetchProfile);
  }, []);

  const navItems = [
    { id: 'medical-history', label: 'Medical History', icon: History },
    { id: 'connections', label: 'Connections', icon: Users },
    { id: 'latest-reports', label: 'Latest Reports', icon: FileText },
    { id: 'ai-chat', label: 'AI Assistant', icon: MessageSquare },
    { id: 'major-operations', label: 'Major Operations', icon: Activity },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'medical-history':
        return <MedicalHistory />;
      case 'connections':
        return <Connections />;
      case 'latest-reports':
        return <LatestReports />;
      case 'ai-chat':
        return <AIChat />;
      case 'major-operations':
        return <MajorOperations />;
      case 'profile':
        return <Profile />;
      default:
        return <MedicalHistory />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 z-40 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-3">
              <Shield className="text-primary" size={32} />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent-green bg-clip-text text-transparent">
                  MediGuard
                </h1>
                <p className="text-xs text-gray-500">Patient Dashboard</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {profile && (
              <div className="hidden md:flex items-center gap-3 bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-2 rounded-full">
                <img
                  src={profile.profile_photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2080&auto=format&fit=crop"}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border-2 border-primary/20"
                />
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{profile.full_name}</p>
                  <p className="text-xs text-gray-500">{profile.patient_uid}</p>
                </div>
              </div>
            )}
            <button
              className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-600 hover:text-red-600"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <div className="flex pt-20">
        {/* Sidebar */}
        <AnimatePresence>
          {(sidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-20 bottom-0 w-72 bg-white border-r border-gray-200 shadow-lg z-30 overflow-y-auto"
            >
              <div className="p-6 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id);
                        if (typeof window !== 'undefined' && window.innerWidth < 1024) setSidebarOpen(false);
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-gradient-primary text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-semibold">{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="ml-auto w-2 h-2 bg-white rounded-full"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Sidebar Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-gray-50 to-transparent">
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-4 rounded-xl border border-primary/20">
                  <p className="text-xs text-gray-600 mb-1">Need Help?</p>
                  <p className="text-sm font-semibold text-primary">Contact Support</p>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'ml-0'}`}>
          <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderSection()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && typeof window !== 'undefined' && window.innerWidth < 1024 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
        />
      )}
    </div>
  );
};

export default PatientDashboard;
