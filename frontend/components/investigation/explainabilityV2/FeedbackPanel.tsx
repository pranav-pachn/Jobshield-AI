"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, CheckCircle2, AlertCircle, Loader2, ChevronDown, ChevronUp, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBackendUrl } from "@/lib/apiConfig";
import { getStoredToken } from "@/lib/auth";

interface FeedbackPanelProps {
  analysisId: string;
}

export function FeedbackPanel({ analysisId }: FeedbackPanelProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [feedbackType, setFeedbackType] = useState<string>("FALSE_POSITIVE");
  const [comment, setComment] = useState("");

  const submitFeedback = async (isAccurate: boolean) => {
    setLoading(true);
    setError(null);

    const verdict = isAccurate ? "CORRECT" : "INCORRECT";
    const resolvedType = isAccurate ? "OTHER" : feedbackType;
    const resolvedComment = isAccurate 
      ? (comment.trim() || "User confirmed this verdict was accurate.") 
      : (comment.trim() || "User reported this verdict was inaccurate.");

    try {
      const token = getStoredToken();
      const res = await fetch(`${getBackendUrl()}/api/investigations/${analysisId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          verdict,
          feedbackType: resolvedType,
          comment: resolvedComment
        })
      });

      if (res.status === 409) {
        setAlreadySubmitted(true);
        setSuccess(true);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to submit feedback");
      }

      setSuccess(true);
      setShowDetails(false);
    } catch (err: any) {
      setError(err.message || "Unable to submit feedback at this time.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-5 my-6 text-center animate-in fade-in duration-300">
        <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wider font-mono">
          {alreadySubmitted ? "Feedback Already Recorded" : "Feedback Received"}
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          {alreadySubmitted 
            ? "Your feedback for this investigation has already been stored for our analyst review queue."
            : "Thank you for helping tune the JobShield detection and intelligence engine."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#090d16] border border-slate-800 rounded-xl p-6 my-6 shadow-xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
            Was this verdict accurate?
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Your confirmation tunes our multi-agent risk assessment and community intelligence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => submitFeedback(true)}
            disabled={loading}
            size="sm"
            variant="outline"
            className="border-slate-700 hover:border-emerald-500/60 hover:bg-emerald-500/10 hover:text-emerald-400 text-slate-300 text-xs font-mono transition-all"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <ThumbsUp className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />}
            Accurate
          </Button>

          <Button
            onClick={() => setShowDetails((prev) => !prev)}
            disabled={loading}
            size="sm"
            variant="outline"
            className={`border-slate-700 hover:border-rose-500/60 hover:bg-rose-500/10 hover:text-rose-400 text-slate-300 text-xs font-mono transition-all ${
              showDetails ? "border-rose-500/60 bg-rose-500/10 text-rose-400" : ""
            }`}
          >
            <ThumbsDown className="w-3.5 h-3.5 mr-1.5 text-rose-400" />
            Not accurate
            {showDetails ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-rose-950/30 border border-rose-900/50 text-rose-400 text-xs p-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Expanded Inaccuracy Reporting Form */}
      {showDetails && (
        <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Issue Category
              </label>
              <select
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500/60 font-sans"
              >
                <option value="FALSE_POSITIVE">False Positive (Job is legitimate, incorrectly flagged)</option>
                <option value="FALSE_NEGATIVE">False Negative (Job is fraudulent, missed red flags)</option>
                <option value="INACCURATE_EVIDENCE">Inaccurate Evidence (Evidence cited is incorrect)</option>
                <option value="MISSING_THREAT">Missing Threat (Missed payment request, domain spoofing)</option>
                <option value="OTHER">Other Issue</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Details or Notes (Optional)
              </label>
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="e.g. Recruiter verified via official company email..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:border-blue-500/60 font-sans"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(false)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={loading}
              onClick={() => submitFeedback(false)}
              className="bg-rose-600 hover:bg-rose-700 text-white font-mono text-xs px-4"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Send className="w-3.5 h-3.5 mr-1.5" />}
              Submit Inaccuracy Report
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

