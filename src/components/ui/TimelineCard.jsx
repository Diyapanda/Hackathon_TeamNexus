import React from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, Microscope, Download } from 'lucide-react';
import Button from './Button';

const TimelineCard = ({ entry, isLast = false }) => {
  if (!entry) return null;

  // Backend uses 'visit' and 'lab_report'
  const isVisit = entry.type === 'visit';
  const isLab = entry.type === 'lab_report';
  
  const Icon = isVisit ? Stethoscope : Microscope;
  const iconBgColor = isVisit ? 'bg-gradient-to-br from-blue-500 to-cyan-500' : 'bg-gradient-to-br from-purple-500 to-pink-500';

  return (
    <div className="relative">
      {/* Timeline connector line */}
      {!isLast && (
        <div className="absolute left-6 top-24 bottom-0 w-0.5 bg-gradient-to-b from-green-400 to-green-600 -mb-8" />
      )}
      
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="relative ml-16 mb-8"
      >
        {/* Icon badge */}
        <div className={`absolute -left-16 top-4 w-12 h-12 rounded-full ${iconBgColor} flex items-center justify-center shadow-lg z-10`}>
          <Icon size={24} className="text-white" />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{entry.date}</p>
                {isVisit && (
                  <p className="text-sm text-gray-600 mt-1">
                    Dr. {entry.doctor_name || 'Medical Specialist'} • {entry.specialty || 'Consultation'}
                  </p>
                )}
                {isLab && (
                  <p className="text-sm text-gray-600 mt-1">
                    {entry.laboratory || 'Central Diagnostic'} • {entry.test_name || 'Lab Report'}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-primary">{entry.time || 'Scheduled'}</p>
                {isVisit && entry.hospital_name && (
                  <p className="text-xs text-gray-500 mt-1">{entry.hospital_name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Visit Content */}
            {isVisit && (
              <>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Diagnosis / Notes</h4>
                  <p className="text-lg font-semibold text-gray-900">{entry.diagnosis || "Regular checkup"}</p>
                </div>

                {entry.vitals && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Vital Signs</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(entry.vitals).map(([key, value]) => (
                        <div key={key} className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-600 capitalize">{key.replace(/_/g, ' ')}</p>
                          <p className="text-sm font-semibold text-gray-900">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {entry.prescription && entry.prescription.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Prescription</h4>
                    <div className="space-y-2">
                      {entry.prescription.map((med, idx) => (
                        <div key={idx} className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border-l-4 border-green-500 flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-gray-900">{med.medicine}</p>
                            <p className="text-sm text-gray-600">{med.duration}</p>
                          </div>
                          {med.pdf_url && (
                            <button 
                              onClick={() => window.open(med.pdf_url, '_blank')}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                            >
                              <Download size={20} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Lab Report Content */}
            {isLab && (
              <>
                {entry.results && typeof entry.results === 'object' && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Test Results</h4>
                    <div className="space-y-2">
                      {Object.entries(entry.results).map(([key, value]) => (
                        <div key={key} className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {key.replace(/_/g, ' ')}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Status</p>
                    <p className="text-lg font-bold text-green-600 capitalize">{entry.status || 'Normal'}</p>
                  </div>
                </div>

                {entry.pdf_url && (
                  <div className="pt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Download}
                      onClick={() => window.open(entry.pdf_url, '_blank')}
                    >
                      Download Lab Report
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TimelineCard;
