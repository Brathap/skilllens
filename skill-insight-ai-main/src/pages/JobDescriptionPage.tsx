import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/Layout";
import { useAnalysisStore, Skill } from "@/stores/analysisStore";
import { extractSkillsFromText } from "@/lib/textExtraction";
import { apiClient } from "@/lib/api";
import { 
  FileText, Upload, Sparkles, X, Plus, ArrowRight, 
  GripVertical, Loader2, CheckCircle2 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function JobDescriptionPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addJobDescription, updateJDSkills, updateJDWeights, currentJD } = useAnalysisStore();
  
  const [title, setTitle] = useState(currentJD?.title || "");
  const [rawText, setRawText] = useState(currentJD?.rawText || "");
  const [skills, setSkills] = useState<Skill[]>(currentJD?.skills || []);
  const [experienceWeight, setExperienceWeight] = useState(currentJD?.experienceWeight || 0.3);
  const [certificationWeight, setCertificationWeight] = useState(currentJD?.certificationWeight || 0.1);
  const [isExtracting, setIsExtracting] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  const handleExtractSkills = useCallback(async () => {
    if (!rawText.trim()) {
      toast({
        title: "No text provided",
        description: "Please paste or upload a job description first.",
        variant: "destructive",
      });
      return;
    }

    setIsExtracting(true);
    
    // Simulate async extraction with animation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const extractedSkills = extractSkillsFromText(rawText);
    const skillsWithWeights: Skill[] = extractedSkills.map((name, index) => ({
      name,
      weight: 1.0,
    }));

    // Animate skills appearing one by one
    for (let i = 0; i < skillsWithWeights.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setSkills(prev => [...prev.slice(0, i), skillsWithWeights[i]]);
    }
    
    setSkills(skillsWithWeights);
    setIsExtracting(false);
    
    toast({
      title: "Skills Extracted",
      description: `Found ${skillsWithWeights.length} skills in the job description.`,
    });
  }, [rawText, toast]);

  const handleRemoveSkill = (index: number) => {
    setSkills(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.find(s => s.name.toLowerCase() === newSkill.toLowerCase())) {
      setSkills(prev => [...prev, { name: newSkill.trim(), weight: 1.0 }]);
      setNewSkill("");
    }
  };

  const handleSkillWeightChange = (index: number, weight: number) => {
    setSkills(prev => prev.map((skill, i) => 
      i === index ? { ...skill, weight } : skill
    ));
  };

  const handleContinue = async () => {
    if (!rawText.trim()) {
      toast({
        title: "Job description required",
        description: "Please provide a job description before continuing.",
        variant: "destructive",
      });
      return;
    }

    if (skills.length === 0) {
      toast({
        title: "No skills extracted",
        description: "Please extract or add skills before continuing.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Upload to backend
      const response = await apiClient.uploadJobDescription({
        title: title || "Untitled Position",
        raw_text: rawText,
        skills: skills.map(s => ({ name: s.name, weight: s.weight })),
        experience_weight: experienceWeight,
        certification_weight: certificationWeight,
      });

      // Store in local state for frontend
      const jd = {
        id: response.id,
        title: response.title,
        rawText,
        skills,
        experienceWeight,
        certificationWeight,
        createdAt: new Date(),
      };

      addJobDescription(jd);
      
      toast({
        title: "Job description saved",
        description: "Job description uploaded successfully.",
      });

      navigate("/upload-resumes");
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload job description.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For demo, we'll just read text files or show a message for PDFs
    if (file.type === "text/plain") {
      const text = await file.text();
      setRawText(text);
    } else {
      toast({
        title: "PDF parsing",
        description: "For the demo, please paste the job description text directly.",
      });
    }
  };

  return (
    <Layout>
      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 text-primary mb-2">
              <FileText className="h-5 w-5" />
              <span className="text-sm font-medium">Step 1 of 3</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Job Description
            </h1>
            <p className="text-muted-foreground">
              Paste or upload the job description. We'll extract required skills automatically.
            </p>
          </motion.div>

          <div className="grid gap-8">
            {/* Title Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Position Title</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    placeholder="e.g., Senior Software Engineer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-background"
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* JD Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="glass-card border-border/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Job Description Text</CardTitle>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".txt,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </span>
                    </Button>
                  </label>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Paste the full job description here..."
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    className="min-h-[200px] bg-background"
                  />
                  <Button 
                    onClick={handleExtractSkills}
                    disabled={isExtracting || !rawText.trim()}
                    className="w-full"
                  >
                    {isExtracting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Extracting Skills...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Extract Skills with AI
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Extracted Skills */}
            <AnimatePresence>
              {skills.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="glass-card border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-status-strong" />
                        Extracted Skills ({skills.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <AnimatePresence mode="popLayout">
                          {skills.map((skill, index) => (
                            <motion.div
                              key={skill.name}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.2 }}
                              layout
                            >
                              <Badge 
                                variant="secondary" 
                                className="px-3 py-1.5 text-sm flex items-center gap-2 bg-primary/10 hover:bg-primary/20 transition-colors"
                              >
                                {skill.name}
                                <button
                                  onClick={() => handleRemoveSkill(index)}
                                  className="hover:text-destructive transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>

                      {/* Add custom skill */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add custom skill..."
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
                          className="bg-background"
                        />
                        <Button onClick={handleAddSkill} variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Weight Sliders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Scoring Weights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Skill Match Weight</Label>
                      <span className="text-sm text-muted-foreground">
                        {Math.round((1 - experienceWeight - certificationWeight) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-primary/20 rounded-full">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(1 - experienceWeight - certificationWeight) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Experience Weight</Label>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(experienceWeight * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[experienceWeight * 100]}
                      onValueChange={([value]) => setExperienceWeight(value / 100)}
                      max={50}
                      step={5}
                      className="[&_[role=slider]]:bg-accent"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Certification Weight</Label>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(certificationWeight * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[certificationWeight * 100]}
                      onValueChange={([value]) => setCertificationWeight(value / 100)}
                      max={30}
                      step={5}
                      className="[&_[role=slider]]:bg-skill-pink"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Continue Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button
                onClick={handleContinue}
                size="lg"
                className="w-full text-lg glow-effect"
              >
                Continue to Resume Upload
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
