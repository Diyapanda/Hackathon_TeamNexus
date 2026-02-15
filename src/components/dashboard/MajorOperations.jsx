import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Activity, Clock, ChevronRight } from 'lucide-react';

const MajorOperations = () => {
  const [operations, setOperations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOperations = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/patient/operations');
        if (response.ok) {
          const data = await response.json();
          setOperations(data);
        } else {
          throw new Error('Failed to fetch surgical records');
        }
      } catch (error) {
        console.error("Error fetching operations:", error);
        setError("Unable to load surgical history. Please ensure the backend is running.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOperations();
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
          Major Operations
        </h1>
        <p className="text-gray-600">History of surgical procedures and clinical interventions</p>
      </motion.div>

      <div className="space-y-6">
        {operations.length > 0 ? (
          operations.map((op, index) => (
            <motion.div
              key={op.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all border border-gray-100 overflow-hidden"
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-48 bg-gray-50 p-6 flex flex-col justify-center border-r border-gray-100">
                  <div className="text-primary mb-2">
                    <Calendar size={20} className="inline mr-2" />
                    <span className="font-bold">{op.date}</span>
                  </div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 w-fit">
                    <Activity size={12} className="mr-1" />
                    Completed
                  </div>
                </div>

                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                        {op.operation}
                      </h3>
                      <p className="text-gray-600 font-medium">Hospital: {op.hospital}</p>
                    </div>
                    <ChevronRight className="text-gray-300 group-hover:text-primary transition-transform group-hover:translate-x-1" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                      <User className="text-blue-600" size={20} />
                      <div>
                        <p className="text-xs text-blue-600 uppercase font-bold tracking-wider">Surgeon</p>
                        <p className="font-semibold text-gray-900">{op.surgeon}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-purple-50/50 p-3 rounded-xl border border-purple-100/50">
                      <Clock className="text-purple-600" size={20} />
                      <div>
                        <p className="text-xs text-purple-600 uppercase font-bold tracking-wider">Recovery Time</p>
                        <p className="font-semibold text-gray-900">{op.recoveryTime || "Normal recovery"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      <span className="font-bold text-gray-900">Notes: </span>
                      {op.notes || "No complication reported. Routine follow-up scheduled."}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center p-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500">No surgical records found in database.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MajorOperations;
