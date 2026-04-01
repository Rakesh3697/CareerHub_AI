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

// Menu Icon
const MenuIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);

// Close Icon
const CloseIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

export default function App() {
  const [showFeedback, setShowFeedback] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      {/* Mobile Menu Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative w-64 bg-indigo-900 text-white flex flex-col flex-shrink-0 z-50 h-full transition-transform duration-300 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Career Hub AI</h1>
              <p className="text-indigo-300 text-xs mt-1">Elevate your career</p>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 text-indigo-200 hover:text-white"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setSidebarOpen(false);
                }}
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
      <main className="flex-1 overflow-y-auto bg-slate-50 w-full md:w-auto">
        {/* Mobile Header with Menu Button */}
        <div className="md:hidden sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-start gap-3 z-30">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition flex-shrink-0"
          >
            {sidebarOpen ? (
              <CloseIcon className="w-6 h-6" />
            ) : (
              <MenuIcon className="w-6 h-6" />
            )}
          </button>
          <h2 className="text-lg font-bold text-slate-800">Career Hub AI</h2>
        </div>

        {showFeedback && <Feedback onClose={() => setShowFeedback(false)} />}
        <div className="max-w-7xl mx-auto p-4 md:p-8">
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