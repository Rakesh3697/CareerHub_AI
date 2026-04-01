
export interface Job {
  id: string;
  company: string;
  role: string;
  dateApplied: string;
  status: 'Wishlist' | 'Applied' | 'Interview' | 'Offer' | 'Rejected';
  nextStepDate?: string;
  notes?: string;
}

export interface Resume {
  id: string;
  name: string;
  text?: string;        // For plain text resumes
  base64Data?: string;  // For PDF/File resumes
  mimeType?: string;    // e.g., 'application/pdf'
  createdAt: string;
}

export interface StudyMonth {
  month: number;
  title: string;
  topics: string[];
  project: string;
  githubResources: string[];
  youtubeResources: string[];
}

export interface StudyPlan {
  id: string;
  title: string;
  months: StudyMonth[];
  createdAt: string;
}

export interface SearchResult {
  title: string;
  uri: string;
  snippet?: string;
}

export interface AnalysisResult {
  matchScore: number;
  missingKeywords: string[];
  feedback: string[];
}

export interface MCQ {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface MockInterviewData {
  mcqs: MCQ[];
  interviewQuestions: string[];
}

export interface TrackedCompany {
  id: string;
  name: string;
  url: string;
  lastChecked?: string;
}

export interface CompanyJob {
  title: string;
  location: string;
  description: string;
  url: string;
}
