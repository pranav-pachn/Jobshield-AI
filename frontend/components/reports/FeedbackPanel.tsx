import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, MessageSquare, AlertTriangle } from "lucide-react";
import { getApiUrl } from "@/lib/apiConfig";
import { getStoredToken } from "@/lib/auth";

interface FeedbackPanelProps {
  investigationId: string;
}

export function FeedbackPanel({ investigationId }: FeedbackPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<string>("FALSE_POSITIVE");
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!comments.trim()) {
      setError("Comments are required");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    try {
      const token = getStoredToken();
      const res = await fetch(`${getApiUrl()}/api/learning/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          investigationId,
          feedbackType,
          comments
        })
      });

      if (!res.ok) {
        throw new Error("Failed to submit feedback");
      }

      setSubmitted(true);
      setIsOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-xl p-4 text-[#00ff88] flex items-center justify-center mt-8">
        <ThumbsUp className="h-5 w-5 mr-2" />
        <p className="font-semibold">Thank you for your feedback! This will improve future investigations.</p>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <div className="flex justify-center mt-12 mb-8">
        <Button onClick={() => setIsOpen(true)} variant="outline" className="gap-2 text-slate-300 border-slate-700 hover:bg-slate-800">
          <MessageSquare className="h-4 w-4" />
          Report Inaccuracy or Provide Feedback
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 mt-8 space-y-4">
      <h3 className="text-xl font-bold text-white flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-yellow-500" />
        Investigation Feedback
      </h3>
      <p className="text-slate-400 text-sm">Your feedback is submitted to analysts to improve the JobShield AI engine.</p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Issue Type</label>
          <select 
            value={feedbackType} 
            onChange={e => setFeedbackType(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-blue-500"
          >
            <option value="FALSE_POSITIVE">False Positive (Marked Scam but is Safe)</option>
            <option value="FALSE_NEGATIVE">False Negative (Marked Safe but is Scam)</option>
            <option value="INACCURATE_EVIDENCE">Inaccurate Evidence / Hallucination</option>
            <option value="MISSING_THREAT">Missed Threat Indicators</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Details & Context</label>
          <textarea 
            value={comments} 
            onChange={e => setComments(e.target.value)}
            placeholder="Please explain why you believe this analysis is incorrect..."
            className="w-full h-32 bg-slate-950 border border-slate-800 rounded-lg p-3 text-white outline-none focus:border-blue-500"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-500">
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </div>
      </div>
    </div>
  );
}
