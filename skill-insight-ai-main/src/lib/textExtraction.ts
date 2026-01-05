// Simple skill extraction using pattern matching
// In production, this would use NLP or LLM for better extraction

const COMMON_SKILLS = [
  // Programming Languages
  'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'php', 'swift', 'kotlin', 'scala',
  // Frontend
  'react', 'angular', 'vue', 'svelte', 'html', 'css', 'sass', 'tailwind', 'bootstrap', 'next.js', 'nuxt',
  // Backend
  'node.js', 'express', 'django', 'flask', 'fastapi', 'spring', 'rails', 'asp.net', 'graphql', 'rest api',
  // Databases
  'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'dynamodb', 'firebase', 'supabase',
  // Cloud & DevOps
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'github actions', 'ci/cd',
  // Data & ML
  'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'data analysis',
  'nlp', 'computer vision', 'llm', 'transformers', 'neural networks',
  // Tools
  'git', 'jira', 'figma', 'agile', 'scrum', 'linux', 'bash',
  // Soft Skills
  'leadership', 'communication', 'problem solving', 'teamwork', 'project management',
];

const EXPERIENCE_PATTERNS = [
  /(\d+)\+?\s*years?\s*(of)?\s*(experience|exp)/gi,
  /experience:\s*(\d+)\+?\s*years?/gi,
  /(senior|lead|principal|staff|junior|entry)/gi,
];

const CERTIFICATION_PATTERNS = [
  /certified|certification|certificate/gi,
  /aws\s+(certified|solutions architect|developer)/gi,
  /google\s+(certified|cloud)/gi,
  /pmp|scrum master|csm|psm/gi,
];

export function extractSkillsFromText(text: string): string[] {
  const normalizedText = text.toLowerCase();
  const foundSkills: Set<string> = new Set();
  
  for (const skill of COMMON_SKILLS) {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(normalizedText)) {
      foundSkills.add(skill);
    }
  }
  
  // Also extract capitalized terms that might be skills (technologies, tools)
  const capitalizedPattern = /\b([A-Z][a-zA-Z]+(?:\.[a-zA-Z]+)?(?:\s+[A-Z][a-zA-Z]+)*)\b/g;
  const matches = text.match(capitalizedPattern) || [];
  
  for (const match of matches) {
    const normalized = match.toLowerCase();
    if (normalized.length >= 2 && normalized.length <= 30 && !['the', 'and', 'for', 'with'].includes(normalized)) {
      foundSkills.add(normalized);
    }
  }
  
  return Array.from(foundSkills);
}

export function extractExperienceLevel(text: string): number {
  const normalizedText = text.toLowerCase();
  
  // Try to find years of experience
  for (const pattern of EXPERIENCE_PATTERNS) {
    const matches = normalizedText.matchAll(pattern);
    for (const match of matches) {
      const years = parseInt(match[1] || match[0]);
      if (!isNaN(years) && years > 0 && years <= 50) {
        return Math.min(years / 10, 1); // Normalize to 0-1 scale (10+ years = 1.0)
      }
    }
  }
  
  // Check for seniority keywords
  if (/\b(senior|lead|principal|staff|architect)\b/i.test(text)) {
    return 0.8;
  }
  if (/\b(mid|intermediate)\b/i.test(text)) {
    return 0.5;
  }
  if (/\b(junior|entry|intern|graduate)\b/i.test(text)) {
    return 0.3;
  }
  
  return 0.5; // Default to mid-level
}

export function extractCertifications(text: string): string[] {
  const certifications: Set<string> = new Set();
  
  for (const pattern of CERTIFICATION_PATTERNS) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      certifications.add(match[0].trim());
    }
  }
  
  return Array.from(certifications);
}

export function generateAnonymizedId(index: number): string {
  const prefix = 'CAND';
  const suffix = String(index + 1).padStart(4, '0');
  return `${prefix}-${suffix}`;
}
