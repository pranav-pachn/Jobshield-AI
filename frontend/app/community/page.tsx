"use client";

import { useState, useEffect } from "react";
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  TrendingUp, 
  Flag, 
  ThumbsUp, 
  ThumbsDown,
  Calendar,
  Filter,
  Search
} from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CommunityReport {
  _id: string;
  reporter_name: string;
  reporter_email: string;
  job_title: string;
  company_name: string;
  recruiter_name: string;
  recruiter_email: string;
  job_description: string;
  scam_type: string;
  scam_details: string;
  evidence_urls: string[];
  status: 'pending' | 'reviewed' | 'resolved';
  reported_at: string;
  upvotes: number;
  downvotes: number;
}

interface ScamType {
  id: string;
  name: string;
  description: string;
}

export default function CommunityPage() {
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [scamTypes, setScamTypes] = useState<ScamType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("reported_at");
  const [stats, setStats] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    reporter_name: "",
    reporter_email: "",
    job_title: "",
    company_name: "",
    recruiter_name: "",
    recruiter_email: "",
    job_description: "",
    scam_type: "",
    scam_details: "",
    evidence_urls: [""]
  });

  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    try {
      setLoading(true);
      
      // Load reports and scam types in parallel
      const [reportsResponse, typesResponse, statsResponse] = await Promise.all([
        fetch(`${backendBaseUrl}/api/community/reports?limit=50&sort_by=${sortBy}&sort_order=desc`),
        fetch(`${backendBaseUrl}/api/community/scam-types`),
        fetch(`${backendBaseUrl}/api/community/reports/stats`)
      ]);

      const reportsData = await reportsResponse.json();
      const typesData = await typesResponse.json();
      const statsData = await statsResponse.json();

      if (reportsData.success) {
        setReports(reportsData.reports || []);
      }
      
      if (typesData.success) {
        setScamTypes(typesData.scam_types || []);
      }
      
      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error("Failed to load community data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${backendBaseUrl}/api/community/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          evidence_urls: formData.evidence_urls.filter(url => url.trim() !== "")
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert("Report submitted successfully! Thank you for helping keep the community safe.");
        setShowReportForm(false);
        setFormData({
          reporter_name: "",
          reporter_email: "",
          job_title: "",
          company_name: "",
          recruiter_name: "",
          recruiter_email: "",
          job_description: "",
          scam_type: "",
          scam_details: "",
          evidence_urls: [""]
        });
        loadCommunityData(); // Reload reports
      } else {
        alert("Failed to submit report: " + result.error);
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report. Please try again.");
    }
  };

  const handleVote = async (reportId: string, voteType: 'upvote' | 'downvote') => {
    try {
      const response = await fetch(`${backendBaseUrl}/api/community/reports/${reportId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vote_type: voteType })
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setReports(reports.map(report => 
          report._id === reportId 
            ? { ...report, [voteType]: report[voteType] + 1 }
            : report
        ));
      }
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const filteredReports = reports
    .filter(report => 
      (filterType === "all" || report.scam_type === filterType) &&
      (searchTerm === "" || 
        report.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.scam_details.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .sort((a, b) => {
      if (sortBy === "reported_at") {
        return new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime();
      } else if (sortBy === "upvotes") {
        return b.upvotes - a.upvotes;
      }
      return 0;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reviewed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScamTypeColor = (type: string) => {
    const colors = {
      'advance_fee': 'bg-red-100 text-red-800',
      'fake_check': 'bg-orange-100 text-orange-800',
      'reshipping': 'bg-purple-100 text-purple-800',
      'phishing': 'bg-pink-100 text-pink-800',
      'identity_theft': 'bg-indigo-100 text-indigo-800',
      'pyramid_scheme': 'bg-yellow-100 text-yellow-800',
      'work_from_home': 'bg-blue-100 text-blue-800',
      'unrealistic_salary': 'bg-green-100 text-green-800',
      'fake_company': 'bg-gray-100 text-gray-800',
      'other': 'bg-slate-100 text-slate-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AuthGuard>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  Community Reports
                </h1>
                <p className="text-muted-foreground">
                  Crowd-sourced scam intelligence from the community
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setShowReportForm(true)}
            className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-[0_0_30px_rgba(96,125,255,0.4)]"
          >
            <Flag className="h-4 w-4 mr-2" />
            Report Scam
          </Button>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
                    <p className="text-2xl font-bold">{stats.total_reports}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary/30" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                    <p className="text-2xl font-bold text-yellow-400">{stats.pending_reports}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-400/30" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                    <p className="text-2xl font-bold text-green-400">{stats.resolved_reports}</p>
                  </div>
                  <Shield className="h-8 w-8 text-green-400/30" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">This Week</p>
                    <p className="text-2xl font-bold text-blue-400">{stats.recent_reports}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-400/30" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Report Form Modal */}
        {showReportForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Report a Scam</CardTitle>
                  <Button variant="ghost" onClick={() => setShowReportForm(false)}>
                    ×
                  </Button>
                </div>
                <CardDescription>
                  Help protect others by reporting suspicious job postings or recruiters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitReport} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Your Name (Optional)</label>
                      <Input
                        value={formData.reporter_name}
                        onChange={(e) => setFormData({...formData, reporter_name: e.target.value})}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Your Email *</label>
                      <Input
                        type="email"
                        value={formData.reporter_email}
                        onChange={(e) => setFormData({...formData, reporter_email: e.target.value})}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Job Title</label>
                      <Input
                        value={formData.job_title}
                        onChange={(e) => setFormData({...formData, job_title: e.target.value})}
                        placeholder="Software Engineer"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Company Name</label>
                      <Input
                        value={formData.company_name}
                        onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                        placeholder="TechCorp Inc."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Recruiter Name</label>
                      <Input
                        value={formData.recruiter_name}
                        onChange={(e) => setFormData({...formData, recruiter_name: e.target.value})}
                        placeholder="Jane Smith"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Recruiter Email</label>
                      <Input
                        type="email"
                        value={formData.recruiter_email}
                        onChange={(e) => setFormData({...formData, recruiter_email: e.target.value})}
                        placeholder="recruiter@company.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Scam Type *</label>
                    <Select value={formData.scam_type} onValueChange={(value) => setFormData({...formData, scam_type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select scam type" />
                      </SelectTrigger>
                      <SelectContent>
                        {scamTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Job Description *</label>
                    <Textarea
                      value={formData.job_description}
                      onChange={(e) => setFormData({...formData, job_description: e.target.value})}
                      placeholder="Paste the job description or recruiter message here..."
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Additional Details</label>
                    <Textarea
                      value={formData.scam_details}
                      onChange={(e) => setFormData({...formData, scam_details: e.target.value})}
                      placeholder="Provide any additional details about the scam..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Evidence URLs</label>
                    {formData.evidence_urls.map((url, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Input
                          value={url}
                          onChange={(e) => {
                            const newUrls = [...formData.evidence_urls];
                            newUrls[index] = e.target.value;
                            setFormData({...formData, evidence_urls: newUrls});
                          }}
                          placeholder="https://example.com/evidence"
                        />
                        {index === formData.evidence_urls.length - 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setFormData({...formData, evidence_urls: [...formData.evidence_urls, ""]})}
                          >
                            +
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowReportForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Submit Report
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {scamTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reported_at">Recent First</SelectItem>
                  <SelectItem value="upvotes">Most Upvoted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-muted-foreground">Loading community reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="pt-12 pb-12 text-center">
                <Flag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No reports found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Be the first to report a scam and help protect the community!
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredReports.map((report) => (
              <Card key={report._id} className="glass-card hover:glass-card-accent transition-all">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getScamTypeColor(report.scam_type)}>
                            {scamTypes.find(t => t.id === report.scam_type)?.name || report.scam_type}
                          </Badge>
                          <Badge className={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-foreground">{report.job_title}</h3>
                        <p className="text-sm text-muted-foreground">{report.company_name}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {new Date(report.reported_at).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Details */}
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {report.job_description}
                    </p>

                    {report.scam_details && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium text-foreground mb-1">Additional Details:</p>
                        <p className="text-sm text-muted-foreground">{report.scam_details}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="text-sm text-muted-foreground">
                        Reported by {report.reporter_name || 'Anonymous'}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVote(report._id, 'upvote')}
                          className="flex items-center gap-1"
                        >
                          <ThumbsUp className="h-4 w-4" />
                          {report.upvotes}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVote(report._id, 'downvote')}
                          className="flex items-center gap-1"
                        >
                          <ThumbsDown className="h-4 w-4" />
                          {report.downvotes}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
