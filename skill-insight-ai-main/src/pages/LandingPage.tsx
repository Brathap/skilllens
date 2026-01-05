import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, FileText, Users, Sparkles, ArrowRight, Check, Shield, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const flowSteps = [
  { icon: FileText, label: "Job Description", color: "skill-purple" },
  { icon: Brain, label: "AI Analysis", color: "skill-cyan" },
  { icon: Users, label: "Ranked Candidates", color: "skill-pink" },
];

const features = [
  {
    icon: Sparkles,
    title: "Semantic Understanding",
    description: "Goes beyond keywords to understand the meaning and context of skills.",
  },
  {
    icon: Shield,
    title: "Bias-Free Evaluation",
    description: "Anonymized screening removes unconscious bias from the process.",
  },
  {
    icon: Zap,
    title: "Explainable Results",
    description: "Transparent AI that shows exactly why each candidate scored.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              style={{ padding: "0.5rem", borderRadius: "0.75rem", background: "rgba(var(--primary), 0.1)" }}
            >
              <Brain className="h-6 w-6 text-primary" />
            </motion.div>
            <span className="font-display text-xl font-bold gradient-text">
              SkillLens AI
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/dashboard">
              <Button>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-primary/20 blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity }}
            style={{ position: "absolute", top: "10rem", right: "25%", width: "20rem", height: "20rem", borderRadius: "9999px", background: "rgba(var(--accent), 0.2)", filter: "blur(48px)" }}
          />
        </div>

        <div className="container mx-auto max-w-5xl relative">
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            style={{ textAlign: "center" }}
          >
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Sparkles className="h-4 w-4" />
              AI-Powered Resume Screening
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              Resume Screening that
              <br />
              <span className="gradient-text">Understands Skills,</span>
              <br />
              Not Just Keywords
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            >
              Leverage semantic AI to find the best candidates. Our embeddings-based 
              matching understands context and meaning, not just word matches.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/dashboard">
                <Button size="lg" className="text-lg px-8 glow-effect">
                  Start Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  How It Works
                </Button>
              </a>
            </motion.div>
          </motion.div>

          {/* Animated Flow Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-20"
          >
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
              {flowSteps.map((step, index) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.2 }}
                  className="flex items-center gap-4"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="glass-card p-6 rounded-2xl flex flex-col items-center gap-3"
                  >
                    <div className={`p-4 rounded-xl bg-${step.color}/10`}>
                      <step.icon className={`h-8 w-8 text-${step.color}`} />
                    </div>
                    <span className="font-medium text-foreground">{step.label}</span>
                  </motion.div>
                  {index < flowSteps.length - 1 && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.5, delay: 1.1 + index * 0.2 }}
                      className="hidden md:block"
                    >
                      <ArrowRight className="h-6 w-6 text-muted-foreground" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Why SkillLens AI?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Traditional resume screening misses qualified candidates by focusing on exact keyword matches. 
              We understand what candidates can actually do.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="glass-card p-8 rounded-2xl"
              >
                <div className="p-4 rounded-xl bg-primary/10 w-fit mb-6">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Simple 3-Step Process
            </h2>
          </motion.div>

          <div className="space-y-8">
            {[
              {
                step: "1",
                title: "Upload Job Description",
                description: "Paste or upload your JD. Our AI extracts required skills automatically.",
              },
              {
                step: "2",
                title: "Add Resumes",
                description: "Bulk upload candidate resumes. We support PDF and text formats.",
              },
              {
                step: "3",
                title: "Get Ranked Results",
                description: "AI analyzes semantic similarity and ranks candidates with full explanations.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-start gap-6"
              >
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="font-display text-xl font-bold text-primary-foreground">
                    {item.step}
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="container mx-auto max-w-4xl"
        >
          <div className="glass-card rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
            <div className="relative">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Ready to Transform Your Hiring?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                Start screening resumes with AI that truly understands skills and experience.
              </p>
              <Link to="/dashboard">
                <Button size="lg" className="text-lg px-8 glow-effect">
                  Start Free Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>Built for Hackathon Demo • SkillLens AI © 2026</p>
        </div>
      </footer>
    </div>
  );
}
