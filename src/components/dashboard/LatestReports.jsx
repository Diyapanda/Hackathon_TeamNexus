import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Sparkles, Activity } from 'lucide-react';
import Button from '../ui/Button';

const LatestReports = () => {
  const [latestPrescription, setLatestPrescription] = useState(null);
  const [latestLabReport, setLatestLabReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/patient/history');
        if (response.ok) {
          const data = await response.json();
          // Find the latest visit (which may contain a prescription)
          const prescription = data.find(item => item.type === 'visit');
          // Find the latest lab report
          const lab = data.find(item => item.type === 'lab_report');
          
          setLatestPrescription(prescription);
          setLatestLabReport(lab);
        } else {
          throw new Error('Failed to fetch latest reports');
        }
      } catch (error) {
        console.error("Error fetching latest reports:", error);
        setError("Unable to load latest records.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatest();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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
          Latest Reports & Prescriptions
        </h1>
        <p className="text-gray-600">Recent medical documents with AI-powered insights</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Latest Prescription */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all border border-gray-100 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <FileText size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Latest Prescription</h2>
                  <p className="text-green-100 text-sm">{latestPrescription?.date || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {latestPrescription ? (
              <>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{latestPrescription.doctor_name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2">Diagnosis</p>
                  <p className="text-base font-semibold text-gray-900">{latestPrescription.diagnosis}</p>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                  <div className="flex items-center gap-2 text-purple-700 mb-2">
                    <Sparkles size={18} />
                    <span className="font-semibold">AI Summary</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed italic">
                    "{latestPrescription.aiSummary || 'AI analysis pending...'}"
                  </p>
                </div>

                {latestPrescription.prescription && latestPrescription.prescription[0]?.pdf_url && (
                  <Button
                    variant="primary"
                    icon={Download}
                    className="w-full"
                    onClick={() => window.open(latestPrescription.prescription[0].pdf_url, '_blank')}
                  >
                    Download Prescription
                  </Button>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">No prescription records found.</div>
            )}
          </div>
        </motion.div>

        {/* Latest Lab Report */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all border border-gray-100 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Activity size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Latest Lab Report</h2>
                  <p className="text-purple-100 text-sm">{latestLabReport?.date || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {latestLabReport ? (
              <>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{latestLabReport.test_name}</p>
                  <p className="text-sm text-gray-600">{latestLabReport.laboratory}</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={20} className="text-blue-600" />
                    <h3 className="font-semibold text-gray-900">AI Summary</h3>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {latestLabReport.aiSummary || 'AI analysis pending...'}
                  </p>
                </div>

                {latestLabReport.pdf_url && (
                  <Button
                    variant="primary"
                    icon={Download}
                    className="w-full"
                    onClick={() => window.open(latestLabReport.pdf_url, '_blank')}
                  >
                    Download Lab Report
                  </Button>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">No lab reports found.</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LatestReports;
