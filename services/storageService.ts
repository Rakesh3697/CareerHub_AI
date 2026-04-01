import { Job, Resume, StudyPlan, TrackedCompany } from '../types';

// Helper to simulate async delay for realism
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const STORAGE_KEYS = {
  JOBS: 'career_hub_jobs',
  RESUMES: 'career_hub_resumes',
  PLANS: 'career_hub_plans',
  COMPANIES: 'career_hub_companies',
};

export const storageService = {
  getJobs: async (): Promise<Job[]> => {
    await delay(300);
    const data = localStorage.getItem(STORAGE_KEYS.JOBS);
    return data ? JSON.parse(data) : [];
  },

  saveJob: async (job: Job): Promise<void> => {
    await delay(300);
    const jobs = await storageService.getJobs();
    const existingIndex = jobs.findIndex(j => j.id === job.id);
    if (existingIndex >= 0) {
      jobs[existingIndex] = job;
    } else {
      jobs.push(job);
    }
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
  },

  deleteJob: async (id: string): Promise<void> => {
    await delay(200);
    const jobs = await storageService.getJobs();
    const filtered = jobs.filter(j => j.id !== id);
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(filtered));
  },

  getResumes: async (): Promise<Resume[]> => {
    await delay(300);
    const data = localStorage.getItem(STORAGE_KEYS.RESUMES);
    return data ? JSON.parse(data) : [];
  },

  saveResume: async (resume: Resume): Promise<void> => {
    await delay(300);
    const resumes = await storageService.getResumes();
    resumes.push(resume);
    localStorage.setItem(STORAGE_KEYS.RESUMES, JSON.stringify(resumes));
  },

  deleteResume: async (id: string): Promise<void> => {
    await delay(200);
    const resumes = await storageService.getResumes();
    const filtered = resumes.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.RESUMES, JSON.stringify(filtered));
  },

  getStudyPlans: async (): Promise<StudyPlan[]> => {
    await delay(300);
    const data = localStorage.getItem(STORAGE_KEYS.PLANS);
    return data ? JSON.parse(data) : [];
  },

  saveStudyPlan: async (plan: StudyPlan): Promise<void> => {
    await delay(300);
    const plans = await storageService.getStudyPlans();
    plans.unshift(plan); // Add to top
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
  },

  getTrackedCompanies: async (): Promise<TrackedCompany[]> => {
    await delay(300);
    const data = localStorage.getItem(STORAGE_KEYS.COMPANIES);
    return data ? JSON.parse(data) : [];
  },

  saveTrackedCompany: async (company: TrackedCompany): Promise<void> => {
    await delay(200);
    const companies = await storageService.getTrackedCompanies();
    const existingIndex = companies.findIndex(c => c.id === company.id);
    if (existingIndex >= 0) {
      companies[existingIndex] = company;
    } else {
      companies.push(company);
    }
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
  },

  deleteTrackedCompany: async (id: string): Promise<void> => {
    await delay(200);
    const companies = await storageService.getTrackedCompanies();
    const filtered = companies.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(filtered));
  }
};