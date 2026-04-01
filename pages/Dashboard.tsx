import React, { useMemo } from 'react';
import { Job, StudyPlan } from '../types';

interface DashboardProps {
  jobs: Job[];
  studyPlans: StudyPlan[];
}

const Dashboard: React.FC<DashboardProps> = ({ jobs, studyPlans }) => {
  const kpis = useMemo(() => {
    return {
      total: jobs.length,
      interviewing: jobs.filter(j => j.status === 'Interview').length,
      applied: jobs.filter(j => j.status === 'Applied').length,
      offers: jobs.filter(j => j.status === 'Offer').length,
    };
  }, [jobs]);

  const upcomingInterviews = useMemo(() => {
    return jobs
      .filter(j => j.status === 'Interview' && j.nextStepDate)
      .sort((a, b) => new Date(a.nextStepDate!).getTime() - new Date(b.nextStepDate!).getTime())
      .slice(0, 5);
  }, [jobs]);

  const activePlan = studyPlans.length > 0 ? studyPlans[0] : null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Welcome back!</h2>
        <p className="text-slate-500 mt-2">Here is what is happening with your job search today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Applications', value: kpis.total, color: 'bg-blue-500' },
          { label: 'Applied', value: kpis.applied, color: 'bg-yellow-500' },
          { label: 'Interviewing', value: kpis.interviewing, color: 'bg-purple-500' },
          { label: 'Offers', value: kpis.offers, color: 'bg-green-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
            </div>
            <div className={`w-2 h-12 rounded-full ${stat.color}`}></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Upcoming Interviews</h3>
          {upcomingInterviews.length > 0 ? (
            <div className="space-y-4">
              {upcomingInterviews.map(job => (
                <div key={job.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <p className="font-semibold text-slate-800">{job.role}</p>
                    <p className="text-sm text-slate-600">{job.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-indigo-600">
                      {new Date(job.nextStepDate!).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(job.nextStepDate!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              No upcoming interviews scheduled.
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Active Study Plan</h3>
          {activePlan && activePlan.months ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-indigo-700">{activePlan.title}</h4>
                <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                  Month 1 of {activePlan.months.length}
                </span>
              </div>
              
              {activePlan.months[0] && (
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <h5 className="font-semibold text-indigo-900 mb-2">Current Focus: {activePlan.months[0].title}</h5>
                  <ul className="space-y-2">
                    {activePlan.months[0].topics.slice(0, 3).map((topic, idx) => (
                      <li key={idx} className="flex items-center text-sm text-indigo-800">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2"></div>
                        {topic}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 pt-3 border-t border-indigo-200">
                    <p className="text-xs font-bold text-indigo-600 uppercase">Project</p>
                    <p className="text-sm text-indigo-900">{activePlan.months[0].project}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              No active study plans. Go to Career Bridge to create one!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;