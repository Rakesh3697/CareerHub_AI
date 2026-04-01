import React, { useState } from 'react';
import { Resume } from '../types';
import { geminiService } from '../services/geminiService';
import { Send, Upload } from '../components/Icons';

const ColdEmailGenerator: React.FC = () => {
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState('Professional');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setResumeText(text);
      };
      reader.readAsText(file);
    }
  };

  const handleGenerate = async () => {
    if (!resumeText) return;

    setIsGenerating(true);
    try {
      const resume: Resume = { id: 'uploaded', name: fileName, text: resumeText, content: resumeText };
      const email = await geminiService.generateColdEmail(resume, jobDescription, tone);
      setGeneratedEmail(email);
    } catch (e) {
      console.error(e);
      setGeneratedEmail("Error generating email.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-slate-800">Cold Email Generator</h2>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Upload Resume</label>
            <label htmlFor="resume-upload" className="w-full flex items-center justify-center px-4 py-6 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-2 text-sm text-slate-600">
                  <span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop
                </p>
                {fileName ? (
                  <p className="text-xs text-slate-500 mt-1">{fileName}</p>
                ) : (
                  <p className="text-xs text-slate-500 mt-1">TXT, DOCX, or PDF</p>
                )}
              </div>
              <input id="resume-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".txt,.docx,.pdf" />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Target Job Context</label>
            <textarea 
              className="w-full p-3 border border-slate-300 rounded-lg h-32 text-sm"
              placeholder="Paste job description or company details..."
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-2">Tone</label>
             <div className="flex space-x-4">
               {['Professional', 'Casual', 'Enthusiastic'].map(t => (
                 <label key={t} className="flex items-center space-x-2 cursor-pointer">
                   <input 
                    type="radio" 
                    name="tone" 
                    value={t} 
                    checked={tone === t} 
                    onChange={e => setTone(e.target.value)}
                    className="text-indigo-600 focus:ring-indigo-500"
                   />
                   <span className="text-sm text-slate-700">{t}</span>
                 </label>
               ))}
             </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={!resumeText || isGenerating}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isGenerating ? 'Drafting...' : 'Generate Email'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-transparent select-none">&nbsp;</h2>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 h-full min-h-[400px] flex flex-col">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center">
            <Send className="w-5 h-5 mr-2 text-indigo-600" />
            Draft Output
          </h3>
          <textarea 
            className="flex-1 w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono text-sm leading-relaxed focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            value={generatedEmail}
            onChange={(e) => setGeneratedEmail(e.target.value)}
            placeholder="Generated email will appear here..."
          />
          <div className="mt-4 text-right">
             <button 
              onClick={() => navigator.clipboard.writeText(generatedEmail)}
              className="text-sm text-indigo-600 font-medium hover:text-indigo-800"
              disabled={!generatedEmail}
            >
               Copy to Clipboard
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColdEmailGenerator;