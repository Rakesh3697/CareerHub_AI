import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Briefcase, Folder, FileText, Send, 
  GraduationCap, Search, MessageSquare, MessageCircle 
} from './components/Icons';
import { Job, Resume, StudyPlan } from './types';
import { storageService } from './services/storageService';

// Pages
import Dashboard from './pages/Dashboard';
import JobTracker from './pages/JobTracker';
import ResumeFolder from './pages/ResumeFolder';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import ColdEmailGenerator from './pages/ColdEmailGenerator';
import CareerBridge from './pages/CareerBridge';
import CareerSearch from './pages/CareerSearch';
import MockInterview from './pages/MockInterview';
import Feedback from './components/Feedback';

export default function App() {
  const [showFeedback, setShowFeedback] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Data Load
  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedJobs, loadedResumes, loadedPlans] = await Promise.all([
          storageService.getJobs(),
          storageService.getResumes(),
          storageService.getStudyPlans()
        ]);
        setJobs(loadedJobs);
        setResumes(loadedResumes);
        setStudyPlans(loadedPlans);
      } catch (error) {
        console.error("Failed to load initial data", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const refreshData = async () => {
    const [loadedJobs, loadedResumes, loadedPlans] = await Promise.all([
      storageService.getJobs(),
      storageService.getResumes(),
      storageService.getStudyPlans()
    ]);
    setJobs(loadedJobs);
    setResumes(loadedResumes);
    setStudyPlans(loadedPlans);
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, id: 'dashboard' },
    { name: 'Job Tracker', icon: Briefcase, id: 'jobTracker' },
    { name: 'Resume Folder', icon: Folder, id: 'resumeFolder' },
    { name: 'Resume Analyzer', icon: FileText, id: 'resumeAnalyzer' },
    { name: 'Cold Email Gen', icon: Send, id: 'coldEmail' },
    { name: 'Career Bridge', icon: GraduationCap, id: 'careerBridge' },
    { name: 'Career Search', icon: Search, id: 'careerSearch' },
    { name: 'Mock Interview', icon: MessageSquare, id: 'mockInterview' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-900 text-white flex flex-col flex-shrink-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight">Career Hub AI</h1>
          <p className="text-indigo-300 text-xs mt-1">Elevate your career</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  activePage === item.id 
                    ? 'bg-indigo-700 text-white shadow-lg' 
                    : 'text-indigo-100 hover:bg-indigo-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-indigo-800 space-y-4">
          <button 
            onClick={() => setShowFeedback(true)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-indigo-800 hover:bg-indigo-700 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Give Feedback</span>
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold">
              U
            </div>
            <div>
              <p className="text-sm font-medium">User</p>
              <p className="text-xs text-indigo-300">Demo Mode</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
        {showFeedback && <Feedback onClose={() => setShowFeedback(false)} />}
        <div className="max-w-7xl mx-auto">
          {activePage === 'dashboard' && <Dashboard jobs={jobs} studyPlans={studyPlans} />}
          {activePage === 'jobTracker' && <JobTracker jobs={jobs} onRefresh={refreshData} />}
          {activePage === 'resumeFolder' && <ResumeFolder resumes={resumes} onRefresh={refreshData} />}
          {activePage === 'resumeAnalyzer' && <ResumeAnalyzer />}
          {activePage === 'coldEmail' && <ColdEmailGenerator />}
          {activePage === 'careerBridge' && <CareerBridge studyPlans={studyPlans} onRefresh={refreshData} />}
          {activePage === 'careerSearch' && <CareerSearch />}
          {activePage === 'mockInterview' && <MockInterview />}
        </div>
      </main>
    </div>
  );
}