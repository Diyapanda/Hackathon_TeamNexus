import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TimelineCard from '../ui/TimelineCard';

const MedicalHistory = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/patient/history');
        if (response.ok) {
          const data = await response.json();
          setHistory(data);
        } else {
          throw new Error('Failed to fetch medical history');
        }
      } catch (error) {
        console.error("Error fetching history:", error);
        setError("Unable to load medical history. Please ensure the backend is running.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center">
        <p className="font-bold mb-2">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent-green bg-clip-text text-transparent mb-2">
          Medical History
        </h1>
        <p className="text-gray-600">Complete timeline of your medical consultations and lab reports</p>
      </motion.div>

      <div className="space-y-0">
        {history.length > 0 ? (
          history.map((entry, index) => (
            <TimelineCard 
              key={entry.id} 
              entry={entry} 
              isLast={index === history.length - 1}
            />
          ))
        ) : (
          <div className="text-center p-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500">No medical history found in database.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalHistory;
