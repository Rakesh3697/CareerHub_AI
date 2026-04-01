import React, { useState, useRef } from 'react';
import { Resume, AnalysisResult } from '../types';
import { geminiService } from '../services/geminiService';
import { Zap, FileText, Trash2 } from '../components/Icons';

const ResumeAnalyzer: React.FC = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  // State for the uploaded resume
  const [tempResume, setTempResume] = useState<Resume | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to convert file to Base64 (for PDF)
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:application/pdf;base64,") to get raw base64
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // Helper to convert file to Text (for TXT/MD)
  const convertFileToText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsText(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Basic validation
      if (file.size > 4 * 1024 * 1024) {
        alert("File size is too large. Please upload a file under 4MB.");
        return;
      }

      try {
        const resumeData: Resume = {
          id: 'temp-upload',
          name: file.name,
          createdAt: new Date().toISOString(),
          mimeType: file.type
        };

        if (file.type === 'application/pdf') {
          resumeData.base64Data = await convertFileToBase64(file);
        } else {
          // Default to treating as text for non-PDFs
          resumeData.text = await convertFileToText(file);
        }

        setTempResume(resumeData);
        setResult(null); // Clear previous analysis
      } catch (error) {
        console.error("Error processing file:", error);
        alert("Failed to read the file. Please try again.");
      }
    }
  };

  const clearFile = () => {
    setTempResume(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!tempResume || !jobDescription) return;

    setIsLoading(true);
    setResult(null);

    try {
      const data = await geminiService.analyzeResume(tempResume, jobDescription);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert('Analysis failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="space-y-6 flex flex-col h-full">
        <h2 className="text-3xl font-bold text-slate-800">Resume Analyzer</h2>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
          
          {/* File Upload Section */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Upload Resume</label>
            {!tempResume ? (
              <div 
                className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept=".pdf,.txt,.md"
                  onChange={handleFileChange}
                />
                <div className="flex flex-col items-center">
                  <FileText className="w-10 h-10 text-slate-400 mb-2" />
                  <p className="text-slate-600 font-medium">Click to upload resume</p>
                  <p className="text-xs text-slate-400 mt-1">PDF or Text (Max 4MB)</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 p-3 rounded-lg">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="bg-indigo-100 p-2 rounded text-indigo-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{tempResume.name}</p>
                    <p className="text-xs text-slate-500">{tempResume.mimeType === 'application/pdf' ? 'PDF Document' : 'Text File'}</p>
                  </div>
                </div>
                <button 
                  onClick={clearFile}
                  className="text-slate-400 hover:text-red-500 p-1 transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Job Description</label>
            <textarea 
              className="w-full p-3 border border-slate-300 rounded-lg h-32 focus:ring-2 focus:ring-indigo-500 text-sm focus:outline-none"
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
            />
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={!tempResume || !jobDescription || isLoading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all"
          >
            {isLoading ? (
              <span>Analyzing...</span>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>Analyze Match</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-transparent select-none hidden lg:block">&nbsp;</h2> {/* Spacer */}
        
        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 min-h-[500px]">
          {!result ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <Zap className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-center">Upload a resume and paste a job description<br/>to see AI-powered insights.</p>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-32 h-32" viewBox="0 0 128 128">
                    <circle className="text-slate-200" strokeWidth="8" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
                    <circle 
                      className="text-indigo-600 transition-all duration-1000 ease-out" 
                      strokeWidth="8" 
                      strokeDasharray={365}
                      strokeDashoffset={365 - (365 * result.matchScore) / 100}
                      strokeLinecap="round"
                      stroke="currentColor" 
                      fill="transparent" 
                      r="58" cx="64" cy="64" 
                      transform="rotate(-90 64 64)"
                    />
                  </svg>
                  <span className="absolute text-3xl font-bold text-slate-800">{result.matchScore}%</span>
                </div>
                <p className="text-slate-500 mt-2 font-medium">Match Score</p>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Missing Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.missingKeywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-100">
                      {kw}
                    </span>
                  ))}
                  {result.missingKeywords.length === 0 && <p className="text-sm text-green-600">No major keywords missing!</p>}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                  Actionable Feedback
                </h3>
                <ul className="space-y-3">
                  {result.feedback.map((fb, i) => (
                    <li key={i} className="flex items-start text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                      <span className="mr-2 mt-1 text-indigo-500">•</span>
                      {fb}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;