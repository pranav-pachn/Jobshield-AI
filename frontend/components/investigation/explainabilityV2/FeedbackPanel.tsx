import { useState } from "react";
import { ThumbsUp, ThumbsDown, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { getBackendUrl } from "@/lib/apiConfig";
import { getStoredToken } from "@/lib/auth";

export function FeedbackPanel({ analysisId }: { analysisId: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitFeedback = async (correct: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const token = getStoredToken();
      const res = await fetch(`${getBackendUrl()}/api/investigations/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          analysisId,
          wasCorrect: correct,
          comments: ""
        })
      });

      if (!res.ok) throw new Error("Failed to submit feedback");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-emerald-950/30 border border-emerald-900 rounded-xl p-5 mb-4 text-center">
        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-emerald-400">Feedback Submitted</h3>
        <p className="text-sm text-emerald-500/70">Thank you for helping improve JobShield AI.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-4 shadow-xl">
      <h3 className="text-lg font-semibold text-slate-200 mb-2">Was this analysis accurate?</h3>
      <p className="text-sm text-slate-400 mb-4">Your feedback helps tune the risk engine and investigation agent.</p>
      
      {error && (
        <div className="bg-rose-950/50 border border-rose-900 text-rose-400 text-sm p-3 rounded mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
      
      <div className="flex gap-4">
        <button 
          onClick={() => submitFeedback(true)}
          disabled={loading}
          className="flex-1 bg-slate-800 hover:bg-emerald-900/40 border border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-400 rounded-lg p-3 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
          Yes, Accurate
        </button>
        <button 
          onClick={() => submitFeedback(false)}
          disabled={loading}
          className="flex-1 bg-slate-800 hover:bg-rose-900/40 border border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-400 rounded-lg p-3 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsDown className="w-4 h-4" />}
          No, Inaccurate
        </button>
      </div>
    </div>
  );
}
