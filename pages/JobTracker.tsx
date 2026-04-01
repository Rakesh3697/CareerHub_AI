import React, { useState } from 'react';
import { Job } from '../types';
import { storageService } from '../services/storageService';
import { Plus, Trash2 } from '../components/Icons';

interface JobTrackerProps {
  jobs: Job[];
  onRefresh: () => void;
}

const JOB_STATUSES = ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected'] as const;

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'Wishlist':
      return 'border-l-slate-400 bg-slate-100';
    case 'Applied':
      return 'border-l-blue-500 bg-blue-100';
    case 'Interview':
      return 'border-l-purple-500 bg-purple-100';
    case 'Offer':
      return 'border-l-green-500 bg-green-100';
    case 'Rejected':
      return 'border-l-red-500 bg-red-100';
    default:
      return 'border-l-slate-200 bg-white';
  }
};

const JobTracker: React.FC<JobTrackerProps> = ({ jobs, onRefresh }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newJob, setNewJob] = useState<Partial<Job>>({
    status: 'Wishlist',
    dateApplied: new Date().toISOString().split('T')[0],
    nextStepDate: ''
  });

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.company || !newJob.role) return;

    const job: Job = {
      id: crypto.randomUUID(),
      company: newJob.company,
      role: newJob.role,
      status: newJob.status as any,
      dateApplied: newJob.dateApplied || new Date().toISOString(),
      nextStepDate: newJob.nextStepDate || undefined
    };

    await storageService.saveJob(job);
    setIsAdding(false);
    setNewJob({ 
      status: 'Wishlist', 
      dateApplied: new Date().toISOString().split('T')[0], 
      company: '', 
      role: '',
      nextStepDate: ''
    });
    onRefresh();
  };

  const handleUpdateJob = async (job: Job, updates: Partial<Job>) => {
    const updatedJob = { ...job, ...updates };
    await storageService.saveJob(updatedJob);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this job?')) {
      await storageService.deleteJob(id);
      onRefresh();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-slate-800">Job Tracker</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Add Job</span>
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-4 text-slate-800">Add Application</h3>
            <form onSubmit={handleAddJob} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Company</label>
                <input 
                  placeholder="e.g. Google" 
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900 placeholder-slate-400"
                  value={newJob.company || ''}
                  onChange={e => setNewJob({...newJob, company: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Role</label>
                <input 
                  placeholder="e.g. Frontend Engineer" 
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900 placeholder-slate-400"
                  value={newJob.role || ''}
                  onChange={e => setNewJob({...newJob, role: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
                   <select 
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                    value={newJob.status}
                    onChange={e => setNewJob({...newJob, status: e.target.value as any})}
                  >
                    {JOB_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Date Applied</label>
                  <input 
                    type="date"
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                    value={newJob.dateApplied}
                    onChange={e => setNewJob({...newJob, dateApplied: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Next Interview (Optional)</label>
                <input 
                  type="datetime-local"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                  value={newJob.nextStepDate || ''}
                  onChange={e => setNewJob({...newJob, nextStepDate: e.target.value})}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Save Job</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex space-x-6 min-w-max h-full">
          {JOB_STATUSES.map(status => {
            const statusJobs = jobs.filter(j => j.status === status);
            return (
              <div key={status} className="w-80 bg-slate-200/60 rounded-xl p-4 flex flex-col h-full border border-slate-200/50">
                <div className="flex justify-between items-center mb-4 px-1">
                  <h3 className="font-bold text-slate-700">{status}</h3>
                  <span className="bg-white text-slate-600 text-xs px-2 py-1 rounded-full font-bold shadow-sm">
                    {statusJobs.length}
                  </span>
                </div>
                
                <div className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                  {statusJobs.map(job => (
                    <div 
                      key={job.id} 
                      className={`p-4 rounded-lg shadow-sm border border-slate-200 border-l-4 hover:shadow-md transition group relative ${getStatusStyles(job.status)}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-slate-800 text-lg leading-tight">{job.role}</h4>
                        <button 
                          onClick={() => handleDelete(job.id)} 
                          className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm font-medium text-slate-600 mb-3">{job.company}</p>
                      
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                        <span>Applied: {new Date(job.dateApplied).toLocaleDateString()}</span>
                      </div>

                      <div className="space-y-2">
                        <select 
                          className="w-full text-xs p-2 border border-slate-200 rounded bg-white text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={job.status}
                          onChange={(e) => handleUpdateJob(job, { status: e.target.value as any })}
                        >
                          {JOB_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>

                        {/* Show Date Picker for Interview Status */}
                        {job.status === 'Interview' && (
                          <div className="bg-white p-2 rounded border border-indigo-100 mt-2">
                             <label className="text-[10px] uppercase font-bold text-indigo-500 block mb-1">
                               Interview Date & Time
                             </label>
                             <input 
                              type="datetime-local"
                              className="w-full text-xs p-1 border border-indigo-200 rounded text-indigo-900 focus:outline-none focus:border-indigo-500 bg-white"
                              value={job.nextStepDate || ''}
                              onChange={(e) => handleUpdateJob(job, { nextStepDate: e.target.value })}
                             />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default JobTracker;