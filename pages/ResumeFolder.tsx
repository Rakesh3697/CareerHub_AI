import React, { useState, useRef } from 'react';
import { Resume } from '../types';
import { storageService } from '../services/storageService';
import { Plus, Trash2, FileText } from '../components/Icons';

interface ResumeFolderProps {
  resumes: Resume[];
  onRefresh: () => void;
}

const ResumeFolder: React.FC<ResumeFolderProps> = ({ resumes, onRefresh }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Simple validation for demo purposes (limit to 2MB)
      if (selectedFile.size > 2 * 1024 * 1024) {
        alert("File size must be less than 2MB for this demo.");
        return;
      }
      setFile(selectedFile);
      if (!name) {
        // Auto-fill name from file name
        setName(selectedFile.name.split('.')[0]);
      }
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const convertFileToText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsText(file);
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !file) return;

    setIsUploading(true);

    try {
      const resume: Resume = {
        id: crypto.randomUUID(),
        name,
        createdAt: new Date().toISOString(),
        mimeType: file.type
      };

      if (file.type === 'application/pdf') {
        resume.base64Data = await convertFileToBase64(file);
      } else {
        // Treat as text for other types (txt, md)
        resume.text = await convertFileToText(file);
      }

      await storageService.saveResume(resume);
      setName('');
      setFile(null);
      setIsAdding(false);
      onRefresh();
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to process file.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this resume?")) {
      await storageService.deleteResume(id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800">Resume Folder</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Upload Resume</span>
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <h3 className="text-xl font-bold mb-4 text-slate-800">Upload New Resume</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Resume Name</label>
              <input 
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Senior Developer 2024"
                required
              />
            </div>
            
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
                <FileText className="w-12 h-12 text-slate-400 mb-2" />
                <p className="text-slate-600 font-medium">{file ? file.name : "Click to select a file"}</p>
                <p className="text-xs text-slate-400 mt-1">Supports PDF, TXT (Max 2MB)</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
              <button 
                type="submit" 
                disabled={!file || isUploading}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Save Resume'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resumes.map(resume => (
          <div key={resume.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                <FileText className="w-8 h-8" />
              </div>
              <button 
                onClick={() => handleDelete(resume.id)}
                className="text-slate-400 hover:text-red-500 transition"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-1">{resume.name}</h3>
            <p className="text-xs text-slate-500 mb-4">
              Added: {new Date(resume.createdAt).toLocaleDateString()}
            </p>
            <div className="bg-slate-50 p-3 rounded text-xs text-slate-600 h-24 overflow-hidden relative">
              {resume.mimeType === 'application/pdf' ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <span className="font-bold">PDF Document</span>
                  <span className="text-[10px] mt-1">Preview available in Analyzer</span>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{resume.text?.substring(0, 150)}...</div>
              )}
            </div>
          </div>
        ))}
        
        {resumes.length === 0 && !isAdding && (
          <div className="col-span-full text-center py-12 text-slate-500 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300">
            <p>No resumes found. Upload one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeFolder;