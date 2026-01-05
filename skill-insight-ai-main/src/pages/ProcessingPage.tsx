import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Layout } from "@/components/Layout";
import { useAnalysisStore, Candidate } from "@/stores/analysisStore";
import { apiClient } from "@/lib/api";
import { 
  FileSearch, Sparkles, Brain, BarChart3, Trophy, 
  CheckCircle2, Loader2 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const processingSteps = [
  { id: 1, label: "Resume Parsing", icon: FileSearch, description: "Extracting text from resumes" },
  { id: 2, label: "Skill Extraction", icon: Sparkles, description: "Identifying candidate skills" },
  { id: 3, label: "Embedding Generation", icon: Brain, description: "Creating semantic vectors" },
  { id: 4, label: "Semantic Similarity", icon: BarChart3, description: "Computing skill matches" },
  { id: 5, label: "Scoring & Ranking", icon: Trophy, description: "Calculating final scores" },
];

export default function ProcessingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentJD, setCandidates, setProcessing } = useAnalysisStore();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!currentJD) {
      navigate("/job-description");
      return;
    }

    const processResumes = async () => {
      setIsProcessing(true);
      setProcessing(true);

      try {
        // Simulate step progression
        const steps = [1, 2, 3, 4, 5];
        const stepProgress = [20, 40, 60, 80, 100];

        for (let i = 0; i < steps.length; i++) {
          setCurrentStep(steps[i]);
          setProgress(stepProgress[i]);
          
          // Small delay for visual feedback
          await new Promise(resolve => setTimeout(resolve, 800));
        }

        // Call backend API to analyze
        setCurrentStep(5);
        const analysisResult = await apiClient.analyzeResumes(currentJD.id);

        // Convert backend response to frontend format
        const candidates: Candidate[] = analysisResult.candidates.map(c => ({
          id: c.id,
          anonymizedId: c.anonymized_id,
          fileName: c.file_name,
          rawText: "", // Not needed in frontend
          skills: c.skills.map(s => ({
            name: s.name,
            similarity: s.similarity,
            matched: s.matched,
            matchedWith: s.matched_with,
          })),
          overallScore: c.overall_score,
          skillScore: c.skill_score,
          experienceScore: c.experience_score,
          certificationScore: c.certification_score,
          status: c.status,
          missingSkills: c.missing_skills,
          explanations: c.explanations,
        }));

        setCandidates(candidates);
        setProgress(100);

        toast({
          title: "Analysis Complete",
          description: `Processed ${analysisResult.total_processed} candidate(s).`,
        });

        // Navigate to results
        setTimeout(() => {
          navigate("/results");
        }, 1000);

      } catch (error) {
        console.error("Processing error:", error);
        toast({
          title: "Processing Failed",
          description: error instanceof Error ? error.message : "Failed to analyze resumes.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
        setProcessing(false);
      }
    };

    processResumes();
  }, [currentJD, navigate, setCandidates, setProcessing, toast]);

  return (
    <Layout>
      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Brain className="h-4 w-4 animate-pulse" />
              AI Processing
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Analyzing Resumes
            </h1>
            <p className="text-muted-foreground">
              Our AI is matching candidates against your job requirements
            </p>
          </motion.div>

          {/* Processing Steps */}
          <Card className="glass-card border-border/50">
            <CardContent className="p-6 space-y-4">
              {processingSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = currentStep === step.id;
                const isComplete = currentStep > step.id;
                const isPending = currentStep < step.id;

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`
                      flex items-center gap-4 p-4 rounded-xl transition-all
                      ${isActive ? 'bg-primary/10 border border-primary/30' : ''}
                      ${isComplete ? 'bg-status-strong/10' : ''}
                      ${isPending ? 'opacity-50' : ''}
                    `}
                  >
                    <div className={`
                      p-3 rounded-xl transition-colors
                      ${isActive ? 'bg-primary/20' : ''}
                      ${isComplete ? 'bg-status-strong/20' : 'bg-muted'}
                    `}>
                      {isComplete ? (
                        <CheckCircle2 className="h-6 w-6 text-status-strong" />
                      ) : isActive ? (
                        <Loader2 className="h-6 w-6 text-primary animate-spin" />
                      ) : (
                        <StepIcon className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-medium ${isActive ? 'text-primary' : ''}`}>
                        {step.label}
                      </h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                    {isComplete && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-sm font-medium text-status-strong"
                      >
                        Done
                      </motion.span>
                    )}
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>

          {/* Overall Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Overall Progress</span>
              <span className="text-sm font-medium">{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </motion.div>

          {/* Processing Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-muted-foreground">
              Processing resumes with{' '}
              <span className="text-primary font-medium">all-MiniLM-L6-v2</span> embeddings
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
