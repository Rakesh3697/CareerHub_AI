import React, { useState } from 'react';
import { StudyPlan } from '../types';
import { geminiService } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { GraduationCap, Save, Github, Youtube } from '../components/Icons';

interface Props {
  studyPlans: StudyPlan[];
  onRefresh: () => void;
}

const CareerBridge: React.FC<Props> = ({ studyPlans, onRefresh }) => {
  const [role, setRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<Omit<StudyPlan, 'id' | 'createdAt'> | null>(null);

  const handleGenerate = async () => {
    if (!role) return;
    setIsLoading(true);
    setGeneratedPlan(null);
    try {
      const plan = await geminiService.generateStudyPlan(role);
      setGeneratedPlan(plan);
    } catch (e) {
      console.error(e);
      alert('Failed to generate plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (generatedPlan) {
      const fullPlan: StudyPlan = {
        ...generatedPlan,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      };
      await storageService.saveStudyPlan(fullPlan);
      onRefresh();
      setGeneratedPlan(null);
      setRole('');
      alert('Plan saved to Dashboard!');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Career Bridge</h2>
        <p className="text-slate-500 mt-2">Generate a personalized monthly roadmap with projects and resources.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900 placeholder-slate-400"
            placeholder="Target Role (e.g., Senior React Engineer, Data Scientist)"
            value={role}
            onChange={e => setRole(e.target.value)}
          />
          <button 
            onClick={handleGenerate}
            disabled={isLoading || !role}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 whitespace-nowrap"
          >
            {isLoading ? 'Generating Roadmap...' : 'Generate Roadmap'}
          </button>
        </div>
      </div>

      {generatedPlan && (
        <div className="bg-white border-l-4 border-indigo-500 rounded-xl shadow-lg p-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-2xl font-bold text-slate-800">{generatedPlan.title}</h3>
            <button onClick={handleSave} className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 font-semibold bg-indigo-50 px-4 py-2 rounded-lg">
              <Save className="w-5 h-5" />
              <span>Save Plan</span>
            </button>
          </div>
          <div className="grid grid-cols-1 gap-8">
            {generatedPlan.months?.map((month, index) => (
              <div key={index} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-100 p-4 border-b border-slate-200 flex items-center">
                  <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full mr-3">Month {month.month}</span>
                  <h4 className="font-bold text-slate-800 text-lg">{month.title}</h4>
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Topics & Project */}
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Key Topics</p>
                      <ul className="space-y-1">
                        {month.topics.map((t, i) => (
                          <li key={i} className="text-sm text-slate-700 flex items-start">
                             <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 mr-2 flex-shrink-0"></div>
                             {t}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
                      <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Monthly Project</p>
                      <p className="text-sm font-medium text-slate-800">{month.project}</p>
                    </div>
                  </div>

                  {/* Right Column: Resources */}
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center mb-2">
                        <Github className="w-4 h-4 text-slate-700 mr-2" />
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">GitHub Resources</p>
                      </div>
                      <ul className="text-sm space-y-2">
                        {month.githubResources.map((res, i) => (
                          <li key={i} className="text-indigo-600 hover:underline cursor-pointer truncate">
                             <a href={`https://github.com/search?q=${encodeURIComponent(res)}`} target="_blank" rel="noopener noreferrer">
                                {res}
                             </a>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="flex items-center mb-2">
                         <Youtube className="w-4 h-4 text-red-600 mr-2" />
                         <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">YouTube Channels/Topics</p>
                      </div>
                      <ul className="text-sm space-y-2">
                        {month.youtubeResources.map((res, i) => (
                          <li key={i} className="text-indigo-600 hover:underline cursor-pointer truncate">
                            <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(res)}`} target="_blank" rel="noopener noreferrer">
                                {res}
                             </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {studyPlans.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-4">Saved Plans</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studyPlans.map(plan => (
              <div key={plan.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex justify-between items-center group hover:shadow-md transition">
                <div>
                   <h4 className="font-bold text-slate-800">{plan.title}</h4>
                   <p className="text-sm text-slate-500">
                     {plan.months?.length || 0} Months • Created {new Date(plan.createdAt).toLocaleDateString()}
                   </p>
                </div>
                <GraduationCap className="w-8 h-8 text-indigo-200 group-hover:text-indigo-300 transition" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerBridge;