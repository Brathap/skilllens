import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, LayoutDashboard, FileText, Users, BarChart3 } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/job-description", label: "Job Description", icon: FileText },
  { path: "/upload-resumes", label: "Resumes", icon: Users },
  { path: "/results", label: "Results", icon: BarChart3 },
];

export function Navbar() {
  const location = useLocation();

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors"
          >
            <Brain className="h-6 w-6 text-primary" />
          </motion.div>
          <span className="font-display text-xl font-bold gradient-text">
            SkillLens AI
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/dashboard">
            <Button size="sm" className="hidden sm:flex">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
