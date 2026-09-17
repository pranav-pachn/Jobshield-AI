"use client";

import { useState } from "react";
import { Check, X, CheckCircle2, AlertCircle, Loader2, ChevronDown, ChevronUp, Send } from "lucide-react";
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
      <section aria-label="Investigation Feedback" className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-5 text-center animate-in fade-in duration-300">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
        <h4 className="text-sm font-sans font-medium text-emerald-300">
          {alreadySubmitted ? "Feedback Already Recorded" : "Thank you for your feedback"}
        </h4>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto font-sans">
          {alreadySubmitted 
            ? "Your feedback for this investigation is already logged in the analyst review queue."
            : "Your feedback helps calibrate detection accuracy across future investigations."}
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Feedback" className="rounded-lg border border-slate-800/80 bg-surface-elevated p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-serif text-slate-100 tracking-tight">
            Help improve this investigation
          </h4>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Was this verdict accurate based on your knowledge of the role?
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => submitFeedback(true)}
            disabled={loading}
            size="sm"
            variant="outline"
            className="border-slate-700 hover:border-emerald-500/60 hover:bg-emerald-500/10 hover:text-emerald-400 text-slate-300 text-xs font-sans transition-all"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />}
            Correct
          </Button>

          <Button
            onClick={() => setShowDetails((prev) => !prev)}
            disabled={loading}
            size="sm"
            variant="outline"
            className={`border-slate-700 hover:border-rose-500/60 hover:bg-rose-500/10 hover:text-rose-400 text-slate-300 text-xs font-sans transition-all ${
              showDetails ? "border-rose-500/60 bg-rose-500/10 text-rose-400" : ""
            }`}
          >
            <X className="w-3.5 h-3.5 mr-1.5 text-rose-400" />
            Incorrect
            {showDetails ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-3 bg-rose-950/30 border border-rose-900/50 text-rose-400 text-xs p-3 rounded flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Expanded Inaccuracy Reporting Form */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-slate-400 font-sans font-medium block">
                Correction Type
              </label>
              <select
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500/60 font-sans"
              >
                <option value="FALSE_POSITIVE">False positive (legitimate opportunity incorrectly flagged)</option>
                <option value="FALSE_NEGATIVE">False negative (fraudulent opportunity classified as safe)</option>
                <option value="INACCURATE_EVIDENCE">Incorrect evidence (signals cited do not apply)</option>
                <option value="OTHER">Other feedback</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-slate-400 font-sans font-medium block">
                Analyst Notes (Optional)
              </label>
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="e.g. Recruiter verified via official company email..."
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:border-blue-500/60 font-sans"
              >
              </input>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-1">
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
              className="bg-rose-600 hover:bg-rose-500 text-white font-sans text-xs px-4"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Send className="w-3.5 h-3.5 mr-1.5" />}
              Submit Correction
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
