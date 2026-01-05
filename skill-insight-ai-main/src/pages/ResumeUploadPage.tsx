import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Layout } from "@/components/Layout";
import { useAnalysisStore } from "@/stores/analysisStore";
import { apiClient } from "@/lib/api";
import { 
  Upload, FileText, CheckCircle2, X, ArrowRight, 
  ArrowLeft, Users, Loader2 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
  file: File;
  progress: number;
  status: 'uploading' | 'done' | 'error';
}

export default function ResumeUploadPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentJD, setResumes, resumes } = useAnalysisStore();
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const simulateUpload = useCallback(async (file: File, index: number) => {
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 20) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUploadedFiles(prev => 
        prev.map((f, i) => i === index ? { ...f, progress } : f)
      );
    }
    setUploadedFiles(prev => 
      prev.map((f, i) => i === index ? { ...f, status: 'done' } : f)
    );
  }, []);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    if (!currentJD) {
      toast({
        title: "No job description",
        description: "Please create a job description first.",
        variant: "destructive",
      });
      return;
    }

    const fileArray = Array.from(files);
    const pdfFiles = fileArray.filter(
      f => f.type === 'application/pdf' || f.type === 'text/plain' || f.name.endsWith('.pdf') || f.name.endsWith('.txt')
    );

    if (pdfFiles.length === 0) {
      toast({
        title: "Invalid files",
        description: "Please upload PDF or TXT files only.",
        variant: "destructive",
      });
      return;
    }

    const startIndex = uploadedFiles.length;
    const newFiles: UploadedFile[] = pdfFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    try {
      // Upload to backend
      const response = await apiClient.uploadResumes(currentJD.id, pdfFiles);
      
      // Update progress for all files
      for (let i = 0; i < pdfFiles.length; i++) {
        setUploadedFiles(prev => 
          prev.map((f, idx) => 
            idx === startIndex + i ? { ...f, progress: 100, status: 'done' as const } : f
          )
        );
      }

      // Store the actual files locally for frontend
      setResumes([...resumes, ...pdfFiles]);

      toast({
        title: "Upload complete",
        description: `${response.uploaded} resume(s) uploaded successfully.`,
      });
    } catch (error) {
      // Mark files as error
      for (let i = 0; i < pdfFiles.length; i++) {
        setUploadedFiles(prev => 
          prev.map((f, idx) => 
            idx === startIndex + i ? { ...f, status: 'error' as const } : f
          )
        );
      }

      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload resumes.",
        variant: "destructive",
      });
    }
  }, [uploadedFiles.length, toast, resumes, setResumes, currentJD]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setResumes(resumes.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No resumes uploaded",
        description: "Please upload at least one resume to continue.",
        variant: "destructive",
      });
      return;
    }

    navigate("/processing");
  };

  if (!currentJD) {
    navigate("/job-description");
    return null;
  }

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
              <Users className="h-5 w-5" />
              <span className="text-sm font-medium">Step 2 of 3</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Upload Resumes
            </h1>
            <p className="text-muted-foreground">
              Upload candidate resumes for analysis against: <strong>{currentJD.title}</strong>
            </p>
          </motion.div>

          <div className="grid gap-8">
            {/* Drop Zone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="glass-card border-border/50">
                <CardContent className="p-0">
                  <motion.div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    animate={{
                      scale: isDragging ? 1.02 : 1,
                      borderColor: isDragging ? "hsl(var(--primary))" : "transparent",
                    }}
                    className={`
                      relative border-2 border-dashed rounded-lg p-12 text-center
                      transition-colors cursor-pointer
                      ${isDragging ? 'bg-primary/5 border-primary' : 'border-border hover:border-primary/50 hover:bg-muted/50'}
                    `}
                  >
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.txt"
                      onChange={handleFileInput}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    
                    <motion.div
                      animate={{
                        y: isDragging ? -10 : 0,
                      }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col items-center gap-4"
                    >
                      <div className={`
                        p-6 rounded-full transition-colors
                        ${isDragging ? 'bg-primary/20' : 'bg-primary/10'}
                      `}>
                        <Upload className={`h-10 w-10 ${isDragging ? 'text-primary' : 'text-primary/70'}`} />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-bold mb-2">
                          {isDragging ? 'Drop files here' : 'Drag & drop resumes'}
                        </h3>
                        <p className="text-muted-foreground">
                          or click to browse • PDF, TXT supported
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Uploaded Files List */}
            <AnimatePresence>
              {uploadedFiles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="glass-card border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Uploaded Resumes ({uploadedFiles.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <AnimatePresence mode="popLayout">
                        {uploadedFiles.map((file, index) => (
                          <motion.div
                            key={`${file.file.name}-${index}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            layout
                            className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                          >
                            <div className="p-2 rounded-lg bg-primary/10">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{file.file.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {(file.file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              {file.status === 'uploading' ? (
                                <div className="w-24">
                                  <Progress value={file.progress} className="h-2" />
                                </div>
                              ) : (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", duration: 0.3 }}
                                >
                                  <CheckCircle2 className="h-5 w-5 text-status-strong" />
                                </motion.div>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFile(index)}
                                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex gap-4"
            >
              <Button
                variant="outline"
                onClick={() => navigate("/job-description")}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleContinue}
                disabled={uploadedFiles.length === 0 || uploadedFiles.some(f => f.status === 'uploading')}
                className="flex-1 glow-effect"
              >
                {uploadedFiles.some(f => f.status === 'uploading') ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    Analyze Resumes
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
