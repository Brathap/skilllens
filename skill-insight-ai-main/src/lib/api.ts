/**
 * API client for SkillLens AI backend
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Skill {
  name: string;
  weight: number;
}

export interface JobDescriptionCreate {
  title: string;
  raw_text: string;
  skills: Skill[];
  experience_weight: number;
  certification_weight: number;
}

export interface JobDescriptionResponse {
  id: string;
  title: string;
  raw_text: string;
  skills: Skill[];
  experience_weight: number;
  certification_weight: number;
  created_at: string;
}

export interface ResumeUploadResponse {
  uploaded: number;
  resumes: Array<{
    id: string;
    file_name: string;
    jd_id: string;
    uploaded_at: string;
  }>;
}

export interface ResumeSkillMatch {
  name: string;
  similarity: number;
  matched: boolean;
  matched_with?: string;
}

export interface CandidateResponse {
  id: string;
  anonymized_id: string;
  file_name: string;
  skills: ResumeSkillMatch[];
  overall_score: number;
  skill_score: number;
  experience_score: number;
  certification_score: number;
  status: 'strong' | 'medium' | 'weak';
  missing_skills: string[];
  explanations: string[];
}

export interface AnalysisResponse {
  jd_id: string;
  candidates: CandidateResponse[];
  total_processed: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Job Description endpoints
  async uploadJobDescription(jd: JobDescriptionCreate): Promise<{ id: string; title: string; skills: Skill[] }> {
    return this.request('/jd/upload', {
      method: 'POST',
      body: JSON.stringify(jd),
    });
  }

  async getJobDescription(jdId: string): Promise<JobDescriptionResponse> {
    return this.request(`/jd/${jdId}`);
  }

  // Resume endpoints
  async uploadResumes(jdId: string, files: File[]): Promise<ResumeUploadResponse> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await fetch(`${this.baseUrl}/resumes/upload?jd_id=${jdId}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getResumes(jdId: string): Promise<Array<{ id: string; file_name: string; uploaded_at: string }>> {
    return this.request(`/resumes/${jdId}`);
  }

  // Analysis endpoints
  async analyzeResumes(jdId: string): Promise<AnalysisResponse> {
    return this.request(`/analyze/${jdId}`, {
      method: 'POST',
    });
  }

  // Candidate endpoints
  async getCandidates(jdId?: string): Promise<CandidateResponse[]> {
    const endpoint = jdId ? `/candidates?jd_id=${jdId}` : '/candidates';
    return this.request(endpoint);
  }

  async getCandidate(candidateId: string): Promise<CandidateResponse> {
    return this.request(`/candidates/${candidateId}`);
  }
}

export const apiClient = new ApiClient();

