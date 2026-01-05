import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

let embeddingPipeline: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

export async function initEmbeddingModel(onProgress?: (progress: number) => void): Promise<void> {
  if (embeddingPipeline) return;
  
  if (isLoading && loadPromise) {
    await loadPromise;
    return;
  }
  
  isLoading = true;
  
  loadPromise = pipeline(
    'feature-extraction',
    'Xenova/all-MiniLM-L6-v2',
    {
      progress_callback: (progress: any) => {
        if (progress.status === 'progress' && onProgress) {
          onProgress(progress.progress);
        }
      },
    }
  );
  
  embeddingPipeline = await loadPromise;
  isLoading = false;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!embeddingPipeline) {
    await initEmbeddingModel();
  }
  
  const output = await embeddingPipeline(text, {
    pooling: 'mean',
    normalize: true,
  });
  
  return Array.from(output.data);
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];
  
  for (const text of texts) {
    const embedding = await generateEmbedding(text);
    embeddings.push(embedding);
  }
  
  return embeddings;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (normA * normB);
}

export function findBestMatch(
  skillEmbedding: number[],
  candidateEmbeddings: { skill: string; embedding: number[] }[]
): { skill: string; similarity: number } | null {
  let bestMatch: { skill: string; similarity: number } | null = null;
  
  for (const candidate of candidateEmbeddings) {
    const similarity = cosineSimilarity(skillEmbedding, candidate.embedding);
    
    if (!bestMatch || similarity > bestMatch.similarity) {
      bestMatch = { skill: candidate.skill, similarity };
    }
  }
  
  return bestMatch;
}
