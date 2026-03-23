import React, { useState, useEffect } from "react";
import {
  Download,
  Mail,
  CheckCircle,
  Loader,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch } from "@/lib/apiClient";

interface ReportDownloadPanelProps {
  analysis_id?: string;
  risk_level: "High" | "Medium" | "Low";
  scam_probability: number;
}

export const ReportDownloadPanel: React.FC<ReportDownloadPanelProps> = ({
  analysis_id,
  risk_level,
  scam_probability,
}) => {
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";
  const [format, setFormat] = useState<"pdf" | "json" | "csv">("pdf");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportId, setReportId] = useState("");
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  // Debug logging when component receives props
  useEffect(() => {
    console.log("[ReportDownloadPanel] Component props:", {
      analysis_id,
      risk_level,
      scam_probability,
      backendBaseUrl
    });
  }, [analysis_id, risk_level, scam_probability, backendBaseUrl]);

  const handleGenerateReport = async () => {
    if (!analysis_id) {
      toast.error("No analysis data available for report generation");
      console.error("[ReportDownloadPanel] No analysis_id provided");
      return;
    }

    console.log("[ReportDownloadPanel] Generating report with:", {
      analysis_id,
      format,
      email: email || "none",
      backendUrl: backendBaseUrl
    });

    setLoading(true);
    try {
      const apiUrl = `${backendBaseUrl}/api/reports/submit`;
      console.log("[ReportDownloadPanel] Making API call to:", apiUrl);
      
      const response = await apiFetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis_id,
          format,
          email_recipients: email ? [email] : [],
        }),
      });

      console.log("[ReportDownloadPanel] API Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[ReportDownloadPanel] API Error Response:", errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        throw new Error(errorData.error || "Failed to generate report");
      }

      const data = await response.json();
      console.log("[ReportDownloadPanel] API Success Response:", data);

      if (data.success) {
        setReportId(data.report_id);
        setGeneratedAt(new Date());
        setEmailSent(data.email_sent);

        toast.success("Report generated successfully!");

        // Auto-download the report
        if (data.report_id) {
          downloadReport(data.report_id);
        }

        if (email && data.email_sent) {
          toast.success(`Report sent to ${email}`);
        }
      } else {
        throw new Error(data.error || "Report generation failed");
      }
    } catch (error) {
      console.error("[ReportDownloadPanel] Report generation error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate report"
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (rId: string = reportId) => {
    if (!rId) {
      console.error("[ReportDownloadPanel] No report ID provided for download");
      return;
    }

    console.log("[ReportDownloadPanel] Downloading report:", rId);

    try {
      const downloadUrl = `${backendBaseUrl}/api/reports/${rId}`;
      console.log("[ReportDownloadPanel] Download URL:", downloadUrl);
      
      const response = await apiFetch(downloadUrl, {
        method: "GET",
      });

      console.log("[ReportDownloadPanel] Download response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[ReportDownloadPanel] Download error:", errorText);
        throw new Error("Failed to download report");
      }

      const blob = await response.blob();
      console.log("[ReportDownloadPanel] Download blob size:", blob.size);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `jobshield_report_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Report downloaded!");
    } catch (error) {
      console.error("[ReportDownloadPanel] Download error:", error);
      toast.error("Failed to download report");
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg border border-indigo-200 p-6 shadow-md">
      { !analysis_id ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground mb-4">
            Report generation requires a saved analysis
          </p>
          <p className="text-xs text-muted-foreground">
            Please save your analysis to enable report downloads
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Report Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full px-3 py-2 border border-border/30 rounded-lg bg-background text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="pdf">📄 PDF Document</option>
              <option value="json">📊 JSON Data</option>
              <option value="csv">📈 CSV Spreadsheet</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Email (Optional)
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email to receive report"
                className="w-full pl-10 pr-3 py-2 border border-border/30 rounded-lg bg-background text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Generating Report...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Generate & Download</span>
              </>
            )}
          </button>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• PDF report includes detailed analysis and evidence</p>
            <p>• JSON format for developers and API integration</p>
            <p>• CSV format for data analysis and reporting</p>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {emailSent && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-700">
            Report successfully sent to {email}
          </p>
        </div>
      )}

      {generatedAt && (
        <div className="text-xs text-gray-500 text-center">
          Report generated: {generatedAt.toLocaleString()}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-700">
          💡 <strong>Tip:</strong> Your report includes all 7 evidence panels,
          analysis summary, and resources. You can regenerate or download again
          anytime within 30 days.
        </p>
      </div>
    </div>
  );
};
