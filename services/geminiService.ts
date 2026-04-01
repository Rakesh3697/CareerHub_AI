import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Resume, StudyPlan, MockInterviewData, CompanyJob } from '../types';

// Use the appropriate model for reasoning and data extraction
const REASONING_MODEL = "gemini-3-flash-preview";
// Use the appropriate model for grounding
const SEARCH_MODEL = "gemini-3-flash-preview"; // 3-flash supports search grounding

const getClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Helper to construct content parts from a Resume object
const getResumeContentParts = (resume: Resume) => {
  if (resume.base64Data && resume.mimeType) {
    return [{ inlineData: { mimeType: resume.mimeType, data: resume.base64Data } }];
  } else if (resume.text) {
    return [{ text: resume.text }];
  }
  return [];
};

export const geminiService = {
  /**
   * Analyzes a resume against a job description.
   */
  analyzeResume: async (resume: Resume, jobDescription: string): Promise<AnalysisResult> => {
    const ai = getClient();
    
    // Construct prompt with resume data (text or file)
    const parts = [
      { text: `Job Description:\n${jobDescription}\n\nAnalyze the provided resume against this job description.` },
      ...getResumeContentParts(resume)
    ];

    const response = await ai.models.generateContent({
      model: REASONING_MODEL,
      contents: { parts },
      config: {
        systemInstruction: "You are an expert technical recruiter. Analyze the resume against the job description. Provide a match score (0-100), missing keywords, and specific feedback.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchScore: { type: Type.INTEGER },
            missingKeywords: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            feedback: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ["matchScore", "missingKeywords", "feedback"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  },

  /**
   * Generates a cold email based on resume and tone.
   */
  generateColdEmail: async (resume: Resume, jobDescription: string, tone: string): Promise<string> => {
    const ai = getClient();
    
    const parts = [
      { text: `Target Job/Company Context: ${jobDescription}\n\nDraft a cold email to a hiring manager based on the attached resume.` },
      ...getResumeContentParts(resume)
    ];

    const response = await ai.models.generateContent({
      model: REASONING_MODEL,
      contents: { parts },
      config: {
        systemInstruction: `You are a career coach. Write a concise, professional cold email (under 150 words). Tone: ${tone}. Do not include subject lines or placeholders like [Name] unless necessary.`,
      }
    });

    return response.text || "Could not generate email.";
  },

  /**
   * Generates a 3-6 month study plan.
   */
  generateStudyPlan: async (targetRole: string): Promise<Omit<StudyPlan, 'id' | 'createdAt'>> => {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: REASONING_MODEL,
      contents: `Target Role: ${targetRole}`,
      config: {
        systemInstruction: "You are a senior engineering mentor. Create a comprehensive monthly study roadmap (3-6 months) to help a student transition to the target role. For each month, include a title, key topics, a significant project idea, relevant GitHub repository search terms or links, and recommended YouTube channels or specific video topics.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            months: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  month: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  topics: { type: Type.ARRAY, items: { type: Type.STRING } },
                  project: { type: Type.STRING },
                  githubResources: { type: Type.ARRAY, items: { type: Type.STRING } },
                  youtubeResources: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["month", "title", "topics", "project", "githubResources", "youtubeResources"]
              }
            }
          },
          required: ["title", "months"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  },

  /**
   * Searches for jobs using Google Search Grounding.
   */
  searchJobs: async (query: string, location: string): Promise<{ summary: string; links: { title: string; uri: string }[] }> => {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: SEARCH_MODEL,
      contents: `Find recent job postings for "${query}" in "${location}". Summarize the opportunities and list the direct links. Provide the response in plain text, do not use markdown formatting like ** or ###.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const summary = response.text || "No results found.";
    
    const links: { title: string; uri: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          links.push({ title: chunk.web.title, uri: chunk.web.uri });
        }
      });
    }

    return { summary, links };
  },

  /**
   * Fetches latest job openings for a specific company using its name and url.
   * Returns a structured list of jobs.
   */
  fetchCompanyJobs: async (companyName: string, url: string): Promise<CompanyJob[]> => {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: SEARCH_MODEL,
      contents: `Go to ${companyName}'s career page (${url}) or search for their current job openings. Identify the top 5-10 most relevant or recent open positions. Extract the Job Title, Location, a Detailed Description (key responsibilities or requirements), and the direct application Link for each.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              location: { type: Type.STRING },
              description: { type: Type.STRING },
              url: { type: Type.STRING }
            },
            required: ["title", "location", "description", "url"]
          }
        }
      }
    });

    try {
      if (response.text) {
        return JSON.parse(response.text) as CompanyJob[];
      }
    } catch (e) {
      console.error("Failed to parse Gemini response for company jobs", e);
    }

    return [];
  },

  /**
   * Generates mock interview questions (MCQ + Text), optionally based on a resume.
   */
  generateInterviewQuestions: async (role: string, type: string, difficulty: string, resume?: Resume): Promise<MockInterviewData> => {
    const ai = getClient();
    
    // Explicitly define type to allow mixed text and inlineData parts
    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
      { text: `Role: ${role}, Type: ${type}, Difficulty: ${difficulty}\n\nGenerate a mock interview session.` }
    ];

    if (resume) {
      parts.push({ text: "Tailor the questions based on the candidate's resume below:" });
      parts.push(...getResumeContentParts(resume));
    }

    const response = await ai.models.generateContent({
      model: REASONING_MODEL,
      contents: { parts },
      config: {
        systemInstruction: "You are a hiring manager. Create a mock interview consisting of exactly 20 Multiple Choice Questions (MCQs) and 10 Standard Interview Questions. For MCQs, provide 4 options, the correct answer, and a short explanation. Return the result in the specified JSON format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mcqs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["question", "options", "correctAnswer", "explanation"]
              }
            },
            interviewQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["mcqs", "interviewQuestions"]
        }
      }
    });

    const defaultResponse: MockInterviewData = { mcqs: [], interviewQuestions: [] };
    
    try {
      if (response.text) {
        return JSON.parse(response.text) as MockInterviewData;
      }
    } catch (e) {
      console.error("Failed to parse Gemini response", e);
    }
    
    return defaultResponse;
  }
};
