import React, { useState } from "react";
import {
  Download,
  Mail,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader,
  RefreshCw,
  Share2,
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
  const [format, setFormat] = useState<"pdf" | "html" | "json">("pdf");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [reportId, setReportId] = useState("");
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleGenerateReport = async () => {
    if (!analysis_id) {
      toast.error("No analysis data available");
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch(`${backendBaseUrl}/api/reports/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis_id,
          format,
          email_recipients: email ? [email] : [],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate report");
      }

      const data = await response.json();

      if (data.success) {
        setReportId(data.report_id);
        setShareLink(data.share_link);
        setGeneratedAt(new Date());
        setEmailSent(data.email_sent);

        toast.success("Report generated successfully!");

        // Auto-download the report
        downloadReport(data.report_id);

        if (email && data.email_sent) {
          toast.success(`Report sent to ${email}`);
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate report"
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (rId: string = reportId) => {
    if (!rId) return;

    try {
      const response = await apiFetch(`${backendBaseUrl}/api/reports/${rId}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to download report");
      }

      const blob = await response.blob();
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
      toast.error("Failed to download report");
    }
  };

  const copyShareLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      toast.success("Share link copied to clipboard!");
    }
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidEmail = !email || emailRegex.test(email);

  const riskColor: Record<string, string> = {
    High: "text-red-600 bg-red-50",
    Medium: "text-orange-600 bg-orange-50",
    Low: "text-green-600 bg-green-50",
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg border border-indigo-200 p-6 shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Download className="w-5 h-5 text-indigo-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Generate Investigation Report
        </h3>
      </div>

      {/* Format Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Report Format
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              { id: "pdf", label: "📄 PDF", desc: "For sharing & printing" },
              { id: "html", label: "🌐 HTML", desc: "For viewing in browser" },
              { id: "json", label: "⚙️ JSON", desc: "For integrations" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFormat(opt.id)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                format === opt.id
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 bg-white hover:border-indigo-300"
              }`}
            >
              <div className="font-medium text-sm text-gray-900">{opt.label}</div>
              <div className="text-xs text-gray-500 mt-1">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Email Option */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-4 h-4 text-gray-600" />
          <label className="block text-sm font-medium text-gray-700">
            Send Report via Email (Optional)
          </label>
        </div>
        <input
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            isValidEmail
              ? "border-gray-300 focus:ring-indigo-500"
              : "border-red-300 focus:ring-red-500"
          }`}
        />
        {email && !isValidEmail && (
          <p className="text-sm text-red-600 mt-1">Please enter a valid email</p>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Report will be {format === "pdf" ? "attached" : "included"} in email
        </p>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerateReport}
        disabled={loading || !isValidEmail}
        className="w-full mb-4 px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Generating Report...
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            Generate & Download Report
          </>
        )}
      </button>

      {/* Share Link Display */}
      {shareLink && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="flex items-start gap-3">
            <Share2 className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 mb-2">
                Share This Report
              </p>
              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 bg-transparent text-xs text-gray-600 outline-none truncate"
                />
                <button
                  onClick={copyShareLink}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Link expires in 30 days
              </p>
            </div>
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
