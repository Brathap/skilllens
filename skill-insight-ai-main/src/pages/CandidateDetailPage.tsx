import { motion } from "framer-motion";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Layout } from "@/components/Layout";
import { useAnalysisStore } from "@/stores/analysisStore";
import { 
  ArrowLeft, User, Trophy, CheckCircle2, XCircle, 
  AlertCircle, Shield, Sparkles, BarChart3, Award,
  Briefcase, GraduationCap
} from "lucide-react";

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { candidates, currentJD } = useAnalysisStore();

  const candidate = candidates.find(c => c.id === id);

  if (!candidate) {
    return (
      <Layout>
        <div className="min-h-screen py-12 px-4 flex items-center justify-center">
          <Card className="glass-card border-border/50 max-w-md text-center p-8">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold mb-2">Candidate Not Found</h2>
            <p className="text-muted-foreground mb-6">
              This candidate doesn't exist or the session has expired.
            </p>
            <Link to="/results">
              <Button>Back to Results</Button>
            </Link>
          </Card>
        </div>
      </Layout>
    );
  }

  const getStatusColor = (status: 'strong' | 'medium' | 'weak') => {
    const colors = {
      strong: 'text-status-strong bg-status-strong/10',
      medium: 'text-status-medium bg-status-medium/10',
      weak: 'text-status-weak bg-status-weak/10',
    };
    return colors[status];
  };

  const matchedSkills = candidate.skills.filter(s => s.matched);
  const unmatchedSkills = candidate.skills.filter(s => !s.matched);

  return (
    <Layout>
      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <Button variant="ghost" onClick={() => navigate('/results')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Results
            </Button>
          </motion.div>

          {/* Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Card className="glass-card border-border/50 overflow-hidden">
              <div className={`h-2 ${
                candidate.status === 'strong' ? 'bg-status-strong' :
                candidate.status === 'medium' ? 'bg-status-medium' :
                'bg-status-weak'
              }`} />
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${getStatusColor(candidate.status)}`}>
                      <User className="h-8 w-8" />
                    </div>
                    <div>
                      <h1 className="font-display text-2xl font-bold">
                        {candidate.anonymizedId}
                      </h1>
                      <p className="text-muted-foreground">
                        Analyzed for: {currentJD?.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge 
                      className={`text-lg px-4 py-1 capitalize ${
                        candidate.status === 'strong' ? 'bg-status-strong' :
                        candidate.status === 'medium' ? 'bg-status-medium' :
                        'bg-status-weak'
                      } text-white`}
                    >
                      {candidate.status} Match
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Scores Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid md:grid-cols-4 gap-4 mb-8"
          >
            {[
              { 
                label: 'Overall Score', 
                value: candidate.overallScore, 
                icon: Trophy,
                color: candidate.status === 'strong' ? 'primary' : 
                       candidate.status === 'medium' ? 'skill-orange' : 'status-weak'
              },
              { label: 'Skill Match', value: candidate.skillScore, icon: Sparkles, color: 'primary' },
              { label: 'Experience', value: candidate.experienceScore, icon: Briefcase, color: 'accent' },
              { label: 'Certifications', value: candidate.certificationScore, icon: Award, color: 'skill-pink' },
            ].map((score, index) => (
              <motion.div
                key={score.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
              >
                <Card className="glass-card border-border/50 h-full">
                  <CardContent className="p-4 text-center">
                    <score.icon className={`h-6 w-6 mx-auto mb-2 text-${score.color}`} />
                    <motion.p
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.4 + index * 0.1 }}
                      className="text-3xl font-bold font-display"
                    >
                      {(score.value * 100).toFixed(0)}%
                    </motion.p>
                    <p className="text-sm text-muted-foreground">{score.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Skill Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8"
          >
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Skill-wise Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="space-y-2">
                  {/* Matched Skills */}
                  <AccordionItem value="matched" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-status-strong" />
                        <span>Matched Skills ({matchedSkills.length})</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="space-y-3">
                        {matchedSkills.map((skill, index) => (
                          <motion.div
                            key={skill.name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-4 p-3 rounded-lg bg-status-strong/5"
                          >
                            <CheckCircle2 className="h-4 w-4 text-status-strong flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{skill.name}</span>
                                <span className="text-muted-foreground">→</span>
                                <span className="text-primary">{skill.matchedWith}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Progress 
                                  value={skill.similarity * 100} 
                                  className="h-1.5 flex-1"
                                />
                                <span className="text-sm font-medium text-status-strong">
                                  {(skill.similarity * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        {matchedSkills.length === 0 && (
                          <p className="text-muted-foreground text-center py-4">
                            No matched skills found
                          </p>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Missing Skills */}
                  <AccordionItem value="missing" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-status-weak" />
                        <span>Missing Skills ({candidate.missingSkills.length})</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="flex flex-wrap gap-2">
                        {candidate.missingSkills.map((skill) => (
                          <Badge 
                            key={skill} 
                            variant="outline" 
                            className="border-status-weak/30 text-status-weak"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {candidate.missingSkills.length === 0 && (
                          <p className="text-muted-foreground">
                            All required skills are present!
                          </p>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Other Skills */}
                  {unmatchedSkills.length > 0 && (
                    <AccordionItem value="other" className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-muted-foreground" />
                          <span>Additional Skills ({unmatchedSkills.length})</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <div className="flex flex-wrap gap-2">
                          {unmatchedSkills.map((skill) => (
                            <Badge key={skill.name} variant="secondary">
                              {skill.name}
                            </Badge>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Explanations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-8"
          >
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Explanations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {candidate.explanations.slice(0, 5).map((explanation, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-primary/5"
                  >
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{explanation}</p>
                  </motion.div>
                ))}
                {candidate.explanations.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No skill matches to explain
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Fairness Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="glass-card border-border/50 border-accent/30 bg-accent/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-accent/10">
                    <Shield className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold mb-2">
                      Bias-Free Evaluation
                    </h3>
                    <p className="text-muted-foreground">
                      This candidate was evaluated using semantic AI matching, focusing solely on 
                      skills and experience. Personal identifiers such as name, gender, age, 
                      ethnicity, and educational institution were not considered in the scoring 
                      process, ensuring a fair and objective assessment.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
