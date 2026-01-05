import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Layout } from "@/components/Layout";
import { useAnalysisStore } from "@/stores/analysisStore";
import { 
  Trophy, ArrowUpDown, Filter, Search, Eye, 
  Download, RefreshCw, ArrowUp, ArrowDown
} from "lucide-react";

type SortField = 'rank' | 'score' | 'status';
type SortOrder = 'asc' | 'desc';

export default function ResultsPage() {
  const navigate = useNavigate();
  const { candidates, currentJD, reset } = useAnalysisStore();
  
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [minScore, setMinScore] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  const filteredAndSortedCandidates = useMemo(() => {
    let result = [...candidates];

    // Filter by minimum score
    if (minScore > 0) {
      result = result.filter(c => c.overallScore * 100 >= minScore);
    }

    // Filter by status
    if (statusFilter.length > 0) {
      result = result.filter(c => statusFilter.includes(c.status));
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.anonymizedId.toLowerCase().includes(term) ||
        c.skills.some(s => s.name.toLowerCase().includes(term))
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'score') {
        comparison = a.overallScore - b.overallScore;
      } else if (sortField === 'status') {
        const statusOrder = { strong: 3, medium: 2, weak: 1 };
        comparison = statusOrder[a.status] - statusOrder[b.status];
      }
      // rank is default (already sorted by score desc from processing)
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [candidates, sortField, sortOrder, minScore, searchTerm, statusFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilter(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handleNewAnalysis = () => {
    reset();
    navigate('/job-description');
  };

  const getStatusBadge = (status: 'strong' | 'medium' | 'weak') => {
    const styles = {
      strong: 'bg-status-strong text-white',
      medium: 'bg-status-medium text-white',
      weak: 'bg-status-weak text-white',
    };
    return (
      <Badge className={`${styles[status]} capitalize`}>
        {status}
      </Badge>
    );
  };

  if (candidates.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen py-12 px-4 flex items-center justify-center">
          <Card className="glass-card border-border/50 max-w-md text-center p-8">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold mb-2">No Results Yet</h2>
            <p className="text-muted-foreground mb-6">
              Start by uploading a job description and resumes to analyze.
            </p>
            <Link to="/job-description">
              <Button>Start New Analysis</Button>
            </Link>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
          >
            <div>
              <div className="flex items-center gap-2 text-primary mb-2">
                <Trophy className="h-5 w-5" />
                <span className="text-sm font-medium">Analysis Complete</span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-1">
                Candidate Rankings
              </h1>
              <p className="text-muted-foreground">
                Results for: <strong>{currentJD?.title}</strong>
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleNewAnalysis}>
                <RefreshCw className="h-4 w-4 mr-2" />
                New Analysis
              </Button>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            <Card className="glass-card border-border/50">
              <CardContent className="p-4">
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search candidates or skills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 bg-background"
                    />
                  </div>

                  {/* Min Score */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Min Score</Label>
                      <span className="text-sm text-muted-foreground">{minScore}%</span>
                    </div>
                    <Slider
                      value={[minScore]}
                      onValueChange={([value]) => setMinScore(value)}
                      max={100}
                      step={5}
                    />
                  </div>

                  {/* Status Filter */}
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    {(['strong', 'medium', 'weak'] as const).map((status) => (
                      <Button
                        key={status}
                        variant={statusFilter.includes(status) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleStatusFilter(status)}
                        className={`capitalize ${
                          statusFilter.includes(status) 
                            ? status === 'strong' ? 'bg-status-strong hover:bg-status-strong/90'
                              : status === 'medium' ? 'bg-status-medium hover:bg-status-medium/90'
                              : 'bg-status-weak hover:bg-status-weak/90'
                            : ''
                        }`}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="glass-card border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-16">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('rank')}
                        className="gap-1 -ml-2"
                      >
                        Rank
                        {sortField === 'rank' && (
                          sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>Candidate ID</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('score')}
                        className="gap-1 -ml-2"
                      >
                        Match Score
                        {sortField === 'score' && (
                          sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('status')}
                        className="gap-1 -ml-2"
                      >
                        Status
                        {sortField === 'status' && (
                          sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>Key Skills</TableHead>
                    <TableHead className="w-20">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {filteredAndSortedCandidates.map((candidate, index) => (
                      <motion.tr
                        key={candidate.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2, delay: index * 0.02 }}
                        layout
                        className="group hover:bg-muted/50 transition-colors"
                      >
                        <TableCell>
                          <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                            ${index === 0 ? 'bg-primary text-primary-foreground' : 
                              index === 1 ? 'bg-accent text-accent-foreground' :
                              index === 2 ? 'bg-skill-pink text-white' :
                              'bg-muted text-muted-foreground'}
                          `}>
                            {candidates.indexOf(candidate) + 1}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono font-medium">
                          {candidate.anonymizedId}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${candidate.overallScore * 100}%` }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                className={`h-full ${
                                  candidate.status === 'strong' ? 'bg-status-strong' :
                                  candidate.status === 'medium' ? 'bg-status-medium' :
                                  'bg-status-weak'
                                }`}
                              />
                            </div>
                            <span className="font-medium">
                              {(candidate.overallScore * 100).toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(candidate.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {candidate.skills
                              .filter(s => s.matched)
                              .slice(0, 3)
                              .map((skill) => (
                                <Badge 
                                  key={skill.name} 
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {skill.name}
                                </Badge>
                              ))}
                            {candidate.skills.filter(s => s.matched).length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{candidate.skills.filter(s => s.matched).length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link to={`/candidate/${candidate.id}`}>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>

              {filteredAndSortedCandidates.length === 0 && (
                <div className="p-12 text-center">
                  <p className="text-muted-foreground">
                    No candidates match the current filters.
                  </p>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Summary Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 grid grid-cols-3 gap-4"
          >
            {[
              { label: 'Strong Matches', count: candidates.filter(c => c.status === 'strong').length, color: 'status-strong' },
              { label: 'Medium Matches', count: candidates.filter(c => c.status === 'medium').length, color: 'status-medium' },
              { label: 'Weak Matches', count: candidates.filter(c => c.status === 'weak').length, color: 'status-weak' },
            ].map((stat) => (
              <Card key={stat.label} className="glass-card border-border/50">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold font-display text-foreground">
                    {stat.count}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
