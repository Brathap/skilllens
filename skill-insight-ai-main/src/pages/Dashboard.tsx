import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Trophy, Plus, ArrowRight, TrendingUp } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useAnalysisStore } from "@/stores/analysisStore";

const statCards = [
  {
    title: "Resumes Analyzed",
    icon: Users,
    color: "primary",
    getValue: (store: any) => store.candidates.length,
  },
  {
    title: "Job Descriptions",
    icon: FileText,
    color: "accent",
    getValue: (store: any) => store.jobDescriptions.length,
  },
  {
    title: "Top Match Score",
    icon: Trophy,
    color: "skill-pink",
    getValue: (store: any) => {
      const topScore = store.candidates.reduce((max: number, c: any) => 
        Math.max(max, c.overallScore || 0), 0
      );
      return topScore > 0 ? `${Math.round(topScore * 100)}%` : "—";
    },
  },
];

export default function Dashboard() {
  const store = useAnalysisStore();

  return (
    <Layout>
      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: "3rem" }}
          >
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Welcome to SkillLens AI
            </h1>
            <p className="text-muted-foreground text-lg">
              AI-powered resume screening at your fingertips
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="glass-card border-border/50 hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg bg-${stat.color}/10`}>
                      <stat.icon className={`h-5 w-5 text-${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    >
                      <span className="text-3xl font-bold font-display">
                        {stat.getValue(store)}
                      </span>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="font-display text-xl font-bold mb-6">Quick Actions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Link to="/job-description">
                <Card className="glass-card border-border/50 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-4 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Plus className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display text-lg font-bold mb-1">
                          New Analysis
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          Start by uploading a job description
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {store.candidates.length > 0 && (
                <Link to="/results">
                  <Card className="glass-card border-border/50 hover:shadow-lg hover:border-accent/50 transition-all cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-4 rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
                          <TrendingUp className="h-8 w-8 text-accent" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-display text-lg font-bold mb-1">
                            View Results
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            See your latest candidate rankings
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </div>
          </motion.div>

          {/* Recent Job Descriptions */}
          {store.jobDescriptions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              style={{ marginTop: "3rem" }}
            >
              <h2 className="font-display text-xl font-bold mb-6">Recent Job Descriptions</h2>
              <div className="space-y-4">
                {store.jobDescriptions.slice(-3).reverse().map((jd, index) => (
                  <motion.div
                    key={jd.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="glass-card border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{jd.title || "Untitled JD"}</h3>
                            <p className="text-sm text-muted-foreground">
                              {jd.skills.length} skills extracted
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {jd.skills.slice(0, 3).map((skill) => (
                              <span
                                key={skill.name}
                                className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                              >
                                {skill.name}
                              </span>
                            ))}
                            {jd.skills.length > 3 && (
                              <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                                +{jd.skills.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}
