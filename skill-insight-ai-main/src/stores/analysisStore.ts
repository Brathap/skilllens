import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Skill {
  name: string;
  weight: number;
  embedding?: number[];
}

export interface JobDescription {
  id: string;
  title: string;
  rawText: string;
  skills: Skill[];
  experienceWeight: number;
  certificationWeight: number;
  createdAt: Date;
}

export interface ResumeSkill {
  name: string;
  similarity: number;
  matched: boolean;
  matchedWith?: string;
}

export interface Candidate {
  id: string;
  anonymizedId: string;
  fileName: string;
  rawText: string;
  skills: ResumeSkill[];
  overallScore: number;
  skillScore: number;
  experienceScore: number;
  certificationScore: number;
  status: 'strong' | 'medium' | 'weak';
  missingSkills: string[];
  explanations: string[];
}

interface AnalysisState {
  jobDescriptions: JobDescription[];
  currentJD: JobDescription | null;
  resumes: File[];
  candidates: Candidate[];
  isProcessing: boolean;
  processingStep: number;
  totalSteps: number;
  
  // Actions
  setCurrentJD: (jd: JobDescription) => void;
  addJobDescription: (jd: JobDescription) => void;
  updateJDSkills: (skills: Skill[]) => void;
  updateJDWeights: (experienceWeight: number, certificationWeight: number) => void;
  setResumes: (files: File[]) => void;
  addResumes: (files: File[]) => void;
  setCandidates: (candidates: Candidate[]) => void;
  setProcessing: (isProcessing: boolean) => void;
  setProcessingStep: (step: number) => void;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set, get) => ({
      jobDescriptions: [],
      currentJD: null,
      resumes: [],
      candidates: [],
      isProcessing: false,
      processingStep: 0,
      totalSteps: 5,

      setCurrentJD: (jd) => set({ currentJD: jd }),
      
      addJobDescription: (jd) => set((state) => ({
        jobDescriptions: [...state.jobDescriptions, jd],
        currentJD: jd,
      })),
      
      updateJDSkills: (skills) => set((state) => ({
        currentJD: state.currentJD ? { ...state.currentJD, skills } : null,
      })),
      
      updateJDWeights: (experienceWeight, certificationWeight) => set((state) => ({
        currentJD: state.currentJD 
          ? { ...state.currentJD, experienceWeight, certificationWeight } 
          : null,
      })),
      
      setResumes: (files) => set({ resumes: files }),
      
      addResumes: (files) => set((state) => ({
        resumes: [...state.resumes, ...files],
      })),
      
      setCandidates: (candidates) => set({ candidates }),
      
      setProcessing: (isProcessing) => set({ isProcessing }),
      
      setProcessingStep: (step) => set({ processingStep: step }),
      
      reset: () => set({
        currentJD: null,
        resumes: [],
        candidates: [],
        isProcessing: false,
        processingStep: 0,
      }),
    }),
    {
      name: 'skilllens-analysis',
      partialize: (state) => ({
        jobDescriptions: state.jobDescriptions,
        candidates: state.candidates,
      }),
    }
  )
);
