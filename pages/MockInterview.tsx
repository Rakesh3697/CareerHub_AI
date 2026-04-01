import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { Resume, MockInterviewData, MCQ } from '../types';
import { CircleCheck, AlertCircle, Upload } from '../components/Icons';

// Helper component for individual MCQ interaction
const MCQItem = ({ mcq, index }: { mcq: MCQ, index: number }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  const handleSelect = (option: string) => {
    if (isRevealed) return; // Prevent changing after answer is revealed
    setSelectedOption(option);
    setIsRevealed(true);
  };

  const isCorrect = selectedOption === mcq.correctAnswer;

  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
      <p className="font-semibold text-slate-800 mb-4 text-lg">
        <span className="text-slate-400 mr-2">Q{index + 1}.</span>
        {mcq.question}
      </p>
      <div className="space-y-2">
        {mcq.options.map((option, idx) => {
          let buttonClass = "w-full text-left p-3 rounded-lg border transition-all duration-200 text-sm ";
          
          if (isRevealed) {
            if (option === mcq.correctAnswer) {
              buttonClass += "bg-green-100 border-green-500 text-green-900 font-medium";
            } else if (option === selectedOption && option !== mcq.correctAnswer) {
              buttonClass += "bg-red-100 border-red-500 text-red-900";
            } else {
              buttonClass += "bg-slate-50 border-slate-200 text-slate-400 opacity-70";
            }
          } else {
            buttonClass += "bg-white border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 text-slate-700";
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(option)}
              disabled={isRevealed}
              className={buttonClass}
            >
              <div className="flex items-center">
                 <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs mr-3 opacity-50">
                   {String.fromCharCode(65 + idx)}
                 </span>
                 {option}
              </div>
            </button>
          );
        })}
      </div>
      
      {isRevealed && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-slate-50 text-slate-700'}`}>
          <div className="flex items-start">
             {isCorrect ? <CircleCheck className="w-5 h-5 mr-2 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />}
             <div>
                <span className="font-bold">{isCorrect ? "Correct!" : "Explanation:"}</span>
                <span className="ml-1">{mcq.explanation}</span>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MockInterview: React.FC = () => {
  const [role, setRole] = useState('');
  const [type, setType] = useState('Behavioral');
  const [difficulty, setDifficulty] = useState('Medium');
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [interviewData, setInterviewData] = useState<MockInterviewData | null>(null);

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
    if (!role) return;
    setIsLoading(true);
    setInterviewData(null);
    
    let resume: Resume | undefined = undefined;
    if (resumeText) {
      resume = { id: 'uploaded', name: fileName, text: resumeText, content: resumeText };
    }

    try {
      const data = await geminiService.generateInterviewQuestions(role, type, difficulty, resume);
      setInterviewData(data);
    } catch (e) {
      console.error(e);
      alert('Error generating questions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <h2 className="text-3xl font-bold text-slate-800">Mock Interview</h2>
      
      {/* Configuration Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input 
            className="md:col-span-2 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 placeholder-slate-400"
            placeholder="Target Role (e.g. UX Designer)"
            value={role}
            onChange={e => setRole(e.target.value)}
          />
          <select 
            className="p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
            value={type}
            onChange={e => setType(e.target.value)}
          >
            <option>Behavioral</option>
            <option>Technical</option>
            <option>Situational</option>
          </select>
          <select 
            className="p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Personalize with Resume (Optional)</label>
          <label htmlFor="resume-upload-mock" className="w-full flex items-center justify-center px-4 py-6 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
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
            <input id="resume-upload-mock" type="file" className="sr-only" onChange={handleFileChange} accept=".txt,.docx,.pdf" />
          </label>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={isLoading || !role}
          className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all"
        >
          {isLoading ? 'Generating Interview...' : 'Generate 20 MCQs & 10 Questions'}
        </button>
      </div>

      {isLoading && (
         <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
            <p className="text-slate-500">Crafting your personalized interview...</p>
         </div>
      )}

      {interviewData && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {/* Section 1: MCQs */}
          {interviewData.mcqs && interviewData.mcqs.length > 0 && (
            <div>
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-xl font-bold text-slate-800">Part 1: Multiple Choice Questions</h3>
                 <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">20 Questions</span>
               </div>
               <div className="grid grid-cols-1 gap-6">
                 {interviewData.mcqs.map((mcq, i) => (
                   <MCQItem key={i} mcq={mcq} index={i} />
                 ))}
               </div>
            </div>
          )}

          {/* Section 2: Standard Questions */}
          {interviewData.interviewQuestions && interviewData.interviewQuestions.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4 mt-12">
                 <h3 className="text-xl font-bold text-slate-800">Part 2: Interview Questions</h3>
                 <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-medium">10 Questions</span>
               </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {interviewData.interviewQuestions.map((q, i) => (
                    <div key={i} className="p-5 flex items-start hover:bg-slate-50 transition-colors">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-sm mr-4 border border-teal-100">
                        {i + 1}
                      </span>
                      <p className="text-slate-700 font-medium pt-1">{q}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MockInterview;