import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Trash2, Shield, Search, User as UserIcon, Building2, MapPin, FlaskConical, Stethoscope, Eye, Check, X, Phone, Mail, Award, Calendar, BadgeCheck } from 'lucide-react';
import Button from '../ui/Button';

const ConnectionModal = ({ connection, onClose }) => {
  if (!connection) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className={`p-8 text-white ${
          connection.entity_type === 'doctor' ? 'bg-gradient-to-br from-blue-600 to-indigo-700' : 'bg-gradient-to-br from-purple-600 to-pink-700'
        }`}>
          <div className="flex justify-between items-start mb-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
              {connection.entity_type === 'doctor' ? <Stethoscope size={40} /> : <FlaskConical size={40} />}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>
          <h2 className="text-3xl font-bold mb-2">{connection.entity_name}</h2>
          <p className="text-white/80 font-medium flex items-center gap-2">
            {connection.entity_type === 'doctor' ? connection.specialty : `Laboratory Head: ${connection.lab_head_name}`}
          </p>
        </div>

        <div className="p-8 grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Facility Information</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <Building2 size={18} className="text-primary" />
                  <span className="font-semibold">{connection.hospital_name || connection.entity_name}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin size={18} className="text-primary" />
                  <span>{connection.city}, India</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Credentials</h4>
              <div className="flex items-center gap-3 text-gray-700">
                <Award size={18} className="text-yellow-500" />
                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                  {connection.entity_type === 'doctor' ? `License: ${connection.doc_id}` : `Lab ID: ${connection.lab_id}`}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Contact Details</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone size={18} className="text-green-500" />
                  <span>+91 98XXX XXX00</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail size={18} className="text-blue-500" />
                  <span className="truncate">contact@{connection.entity_name.toLowerCase().replace(/\s/g, '')}.com</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Authorization Status</h4>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
                connection.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {connection.status === 'active' ? <Shield size={16} /> : <Calendar size={16} />}
                {connection.status === 'active' ? 'Verified Partner' : 'Pending Verification'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 flex justify-end">
          <Button variant="secondary" onClick={onClose}>Close Details</Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Connections = () => {
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showRequests, setShowRequests] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState(null);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/patient/connections');
      if (response.ok) {
        const data = await response.json();
        setConnections(data);
      } else {
        throw new Error('Failed to fetch connections');
      }
    } catch (error) {
      console.error("Error fetching connections:", error);
      setError("Unable to load connections.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/patient/connections/${id}/approve`, {
        method: 'POST'
      });
      if (response.ok) {
        alert("Access granted successfully!");
        fetchData();
      }
    } catch (err) {
      alert("Error approving request.");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this request?")) return;
    try {
      const response = await fetch(`http://localhost:8000/api/patient/connections/${id}/reject`, {
        method: 'DELETE'
      });
      if (response.ok) {
        alert("Request rejected and removed.");
        fetchData();
      }
    } catch (err) {
      alert("Error rejecting request.");
    }
  };

  const handleRevoke = async (id) => {
    if (!window.confirm("Are you sure you want to revoke this connection's access? They will no longer be able to view or manage your medical records.")) return;
    try {
      const response = await fetch(`http://localhost:8000/api/patient/connections/${id}/revoke`, {
        method: 'DELETE'
      });
      if (response.ok) {
        alert("Access revoked successfully.");
        fetchData();
      }
    } catch (err) {
      alert("Error revoking access.");
    }
  };

  const activeConnections = connections.filter(c => c.status === 'active');
  const pendingRequests = connections.filter(c => c.status === 'pending');

  const filteredItems = (showRequests ? pendingRequests : activeConnections).filter(conn => 
    conn.entity_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (conn.specialty && conn.specialty.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (conn.hospital_name && conn.hospital_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return <div className="flex items-center justify-center p-12"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent-green bg-clip-text text-transparent mb-2">
          Health Network
        </h1>
        <p className="text-gray-600">Authorized medical professionals and diagnostic centers</p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, specialty or hospital..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-100 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
        <Button 
          variant={showRequests ? "primary" : "secondary"} 
          icon={Bell} 
          className="relative px-8"
          onClick={() => setShowRequests(!showRequests)}
        >
          {showRequests ? "View Active" : "Access Requests"}
          {pendingRequests.length > 0 && !showRequests && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg">
              {pendingRequests.length}
            </span>
          )}
        </Button>
      </div>

      <div className="grid gap-6">
        <h2 className="text-xl font-bold text-gray-800 border-l-4 border-primary pl-4">
          {showRequests ? `Pending Access Requests (${pendingRequests.length})` : "Active Connections"}
        </h2>
        <AnimatePresence mode="wait">
          {filteredItems.length > 0 ? (
            <div className="grid gap-4">
              {filteredItems.map((conn) => (
                <motion.div
                  key={conn.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all border border-gray-100 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                          conn.entity_type === 'doctor' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-purple-500 to-pink-500'
                        }`}>
                          {conn.entity_type === 'doctor' ? <Stethoscope size={32} /> : <FlaskConical size={32} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-gray-900">{conn.entity_name}</h3>
                            {conn.status === 'active' && (
                              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                                <BadgeCheck size={12} /> Authorized
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-1">
                            <p className={`font-semibold flex items-center gap-1 ${conn.entity_type === 'doctor' ? 'text-primary' : 'text-purple-600'}`}>
                              <UserIcon size={14} /> {conn.entity_type === 'doctor' ? conn.specialty : `Head: ${conn.lab_head_name}`}
                            </p>
                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                              <Building2 size={14} /> {conn.hospital_name || conn.entity_name}
                              <span className="flex items-center gap-1 text-gray-400 text-xs">
                                <MapPin size={12} /> {conn.city}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 items-center bg-gray-50/50 p-2 rounded-2xl">
                        <button 
                          onClick={() => setSelectedConnection(conn)}
                          className="p-3 text-gray-500 hover:text-primary hover:bg-white rounded-xl transition-all hover:shadow-sm" 
                          title="View Details"
                        >
                          <Eye size={22} />
                        </button>
                        {conn.status === 'pending' ? (
                          <>
                            <button 
                              onClick={() => handleApprove(conn.id)}
                              className="p-3 text-white bg-green-500 hover:bg-green-600 rounded-xl transition-all shadow-md active:scale-95" 
                              title="Grant Access"
                            >
                              <Check size={22} />
                            </button>
                            <button 
                              onClick={() => handleReject(conn.id)}
                              className="p-3 text-white bg-red-400 hover:bg-red-500 rounded-xl transition-all shadow-md active:scale-95" 
                              title="Reject Request"
                            >
                              <X size={22} />
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => handleRevoke(conn.id)}
                            className="p-3 text-red-400 hover:text-red-500 hover:bg-white rounded-xl transition-all hover:shadow-sm" 
                            title="Revoke Access"
                          >
                            <Trash2 size={22} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-gray-300" size={40} />
              </div>
              <p className="text-gray-400 font-medium">{showRequests ? "You're all caught up! No pending requests." : "No active connections found."}</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedConnection && (
          <ConnectionModal 
            connection={selectedConnection} 
            onClose={() => setSelectedConnection(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Connections;
