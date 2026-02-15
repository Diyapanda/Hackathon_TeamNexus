import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Save, X, User, Mail, Phone, MapPin, Heart, Calendar, Users as UsersIcon, Camera, Upload, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Local state for photo editing
  const [tempPhoto, setTempPhoto] = useState(null); // Holds Blob or File for upload
  const [previewUrl, setPreviewUrl] = useState(null); // Holds local preview URL

  // Camera states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/patient/profile');
        if (response.ok) {
          const data = await response.json();
          setFormData({
            ...data,
            name: data.full_name,
            dateOfBirth: data.dob,
            bloodGroup: data.blood_group,
            uniqueId: data.patient_uid,
            profilePhoto: data.profile_photo,
            qr_code_url: data.qr_code_url,
            emergencyContact: {
              name: data.emergency_name || "",
              phone: data.emergency_phone || "",
              relation: data.emergency_relation || ""
            }
          });
        } else {
          throw new Error('Failed to fetch patient profile');
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Unable to load profile. Please ensure the backend is running.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `captured_photo_${Date.now()}.jpg`, { type: "image/jpeg" });
          setTempPhoto(file);
          setPreviewUrl(URL.createObjectURL(blob));
        }
      }, 'image/jpeg');
      stopCamera();
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTempPhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setIsUploading(true);
    try {
      // 1. Upload photo if changed
      let photoUrl = formData.profilePhoto;
      if (tempPhoto) {
        const uploadData = new FormData();
        uploadData.append('file', tempPhoto);
        const uploadRes = await fetch('http://localhost:8000/api/patient/profile/upload-photo', {
          method: 'POST',
          body: uploadData,
        });
        if (uploadRes.ok) {
          const result = await uploadRes.json();
          // Add cache buster for immediate refresh
          photoUrl = `${result.photo_url}?t=${Date.now()}`;
        }
      }

      // 2. Save other profile details
      const updateRes = await fetch('http://localhost:8000/api/patient/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          emergency_name: formData.emergencyContact.name,
          emergency_phone: formData.emergencyContact.phone,
          emergency_relation: formData.emergencyContact.relation
        }),
      });

      if (!updateRes.ok) throw new Error('Failed to update profile details');

      // Dispatch event for Synchronization across dashboard
      window.dispatchEvent(new CustomEvent('mediguard:profile-updated'));

      // Update local state and finish
      setFormData({ ...formData, profilePhoto: photoUrl });
      setIsEditing(false);
      setTempPhoto(null);
      setPreviewUrl(null);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error("Save error:", error);
      alert("Error saving profile changes: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempPhoto(null);
    setPreviewUrl(null);
    stopCamera();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 2) {
        const [parent, child] = parts;
        setFormData({
          ...formData,
          [parent]: {
            ...formData[parent],
            [child]: value
          }
        });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !formData) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center">
        <p className="font-bold mb-2">Error</p>
        <p>{error || "Patient not found."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent-green bg-clip-text text-transparent mb-2">
            My Profile
          </h1>
          <p className="text-gray-600">Health profile of {formData.name}</p>
        </div>
        {!isEditing ? (
          <Button variant="primary" icon={Edit2} onClick={() => setIsEditing(true)}>Edit Profile</Button>
        ) : (
          <div className="flex gap-3">
            <Button variant="secondary" icon={X} onClick={handleCancel}>Cancel</Button>
            <Button variant="success" icon={Save} onClick={handleSave} disabled={isUploading}>
              {isUploading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100 space-y-6 text-center">
            <div className="relative inline-block group">
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-primary/20 shadow-xl mx-auto bg-gray-50 flex items-center justify-center relative">
                {isCameraActive ? (
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform -scale-x-100" />
                ) : (previewUrl || formData.profilePhoto) ? (
                  <img src={previewUrl || formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={64} className="text-gray-300" />
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                    <RefreshCw className="text-white animate-spin" size={32} />
                  </div>
                )}
              </div>
              
              <AnimatePresence>
                {isEditing && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute -bottom-2 -right-2 flex flex-col gap-2 z-30"
                  >
                    {!isCameraActive ? (
                      <>
                        <button 
                          onClick={() => fileInputRef.current.click()}
                          className="bg-primary text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
                          title="Upload from computer"
                        >
                          <Upload size={20} />
                        </button>
                        <button 
                          onClick={startCamera}
                          className="bg-accent-blue text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
                          title="Take live photo"
                        >
                          <Camera size={20} />
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={capturePhoto}
                        className="bg-green-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform animate-pulse"
                        title="Capture Photo"
                      >
                        <Camera size={24} />
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileSelect}
            />
            
            <canvas ref={canvasRef} className="hidden" />

            <div className="mt-4">
              <h2 className="text-2xl font-bold text-gray-900">{formData.name}</h2>
              <p className="text-sm text-gray-500 font-mono mb-4">{formData.uniqueId}</p>
              
              <div className="bg-white p-4 rounded-xl border-2 border-dashed border-primary/10 inline-block mb-4">
                <img 
                  src={formData.qr_code_url || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${formData.uniqueId}`}
                  alt="Patient QR Code"
                  className="w-32 h-32 opacity-80"
                />
              </div>
              <Button variant="outline" className="w-full" onClick={() => alert("Scanner initialized...")}>Scan Doctor/Lab QR</Button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100 mt-6">
            <div className="flex items-center gap-2 mb-4 text-primary">
              <UsersIcon size={20} />
              <h3 className="font-bold">Emergency Contact</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Name', name: 'emergencyContact.name', value: formData.emergencyContact.name },
                { label: 'Relation', name: 'emergencyContact.relation', value: formData.emergencyContact.relation },
                { label: 'Phone', name: 'emergencyContact.phone', value: formData.emergencyContact.phone },
              ].map((field) => (
                <div key={field.name}>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{field.label}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name={field.name}
                      value={field.value}
                      onChange={handleChange}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{field.value || 'N/A'}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { label: 'Full Name', name: 'name', icon: User, value: formData.name, editable: true },
                { label: 'Email', name: 'email', icon: Mail, value: formData.email, editable: false },
                { label: 'Phone', name: 'phone', icon: Phone, value: formData.phone, editable: true },
                { label: 'DOB', name: 'dateOfBirth', icon: Calendar, value: formData.dateOfBirth, editable: false },
                { label: 'Gender', name: 'gender', icon: UsersIcon, value: formData.gender, editable: false },
                { label: 'Blood Group', name: 'bloodGroup', icon: Heart, value: formData.bloodGroup, editable: false },
              ].map((field) => (
                <div key={field.name}>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <field.icon size={16} className="text-primary" />
                    {field.label}
                  </label>
                  {isEditing && field.editable ? (
                    <input
                      type="text"
                      name={field.name}
                      value={field.value}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary outline-none transition-all"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">{field.value || 'N/A'}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MapPin size={20} className="text-primary" />
              Address Details
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { label: 'Street Address', name: 'address', value: formData.address },
                { label: 'City', name: 'city', value: formData.city },
                { label: 'State', name: 'state', value: formData.state },
                { label: 'Pincode', name: 'pincode', value: formData.pincode },
              ].map((field) => (
                <div key={field.name} className={field.name === 'address' ? 'md:col-span-2' : ''}>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">{field.label}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name={field.name}
                      value={field.value || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary outline-none transition-all"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">{field.value || 'N/A'}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
