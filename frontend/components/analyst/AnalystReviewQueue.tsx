import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, AlertTriangle, ExternalLink, ShieldCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function AnalystReviewQueue() {
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; item: any | null }>({
    isOpen: false,
    item: null,
  });
  
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingFeedback();
  }, []);

  const fetchPendingFeedback = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/learning/feedback/pending", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch pending feedback");
      const data = await res.json();
      setFeedbackList(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog.item) return;
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/learning/feedback/${confirmDialog.item._id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          knowledgeContent: confirmDialog.item.feedbackReason,
          knowledgeCategory: confirmDialog.item.feedbackType
        })
      });

      if (!res.ok) throw new Error("Failed to approve feedback");
      
      setFeedbackList(prev => prev.filter(f => f._id !== confirmDialog.item._id));
      setConfirmDialog({ isOpen: false, item: null });
    } catch (err: any) {
      alert("Error approving: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject this feedback?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/learning/feedback/${id}/reject`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to reject feedback");
      
      setFeedbackList(prev => prev.filter(f => f._id !== id));
    } catch (err: any) {
      alert("Error rejecting: " + err.message);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading queue...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center">
            <ShieldCheck className="mr-3 w-8 h-8 text-blue-500" /> Analyst Review Queue
          </h2>
          <p className="text-slate-400">Validate user feedback to generate persistent Threat Knowledge.</p>
        </div>
        <Badge className="bg-slate-800 text-white border-slate-700">
          {feedbackList.length} Pending
        </Badge>
      </div>

      {feedbackList.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800 text-center py-12">
          <CardContent>
            <ShieldCheck className="mx-auto w-12 h-12 text-slate-700 mb-4" />
            <div className="text-slate-400 text-lg">No pending feedback to review.</div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feedbackList.map(item => (
            <Card key={item._id} className="bg-slate-900 border-slate-800 flex flex-col h-full shadow-lg">
              <CardHeader className="border-b border-slate-800 pb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-mono text-slate-500">FEEDBACK #{item._id.substring(0,8).toUpperCase()}</span>
                  <Badge variant="outline" className="border-amber-500/30 text-amber-500">PENDING</Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-4 flex-1 space-y-5 flex flex-col">
                
                {/* Original Prediction */}
                <div className="bg-slate-950 rounded p-3 border border-slate-800">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Original Prediction</div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className={item.originalVerdict === 'CRITICAL' || item.originalVerdict === 'High' ? 'text-red-400' : 'text-green-400'}>
                      {item.originalVerdict.toUpperCase()}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-300">Risk {item.originalRiskScore}</span>
                  </div>
                </div>

                {/* User Feedback */}
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">User Feedback</div>
                  <div className="flex items-start gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span className="font-bold text-slate-200">{item.feedbackType.replace(/_/g, ' ')}</span>
                  </div>
                  <p className="text-sm text-slate-300 italic border-l-2 border-slate-700 pl-3 py-1">
                    "{item.feedbackReason}"
                  </p>
                </div>

                <div className="flex-1"></div>

                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Investigation</span>
                    <a href={`/investigations/${item.investigationId}`} target="_blank" className="text-blue-400 hover:underline flex items-center">
                      {item.investigationId.substring(0, 8)} <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Submitted by</span>
                    <span className="text-slate-400">{item.submittedBy?.email || 'Unknown User'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Time</span>
                    <span className="text-slate-400">{new Date(item.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800 mt-auto">
                  <Button 
                    onClick={() => setConfirmDialog({ isOpen: true, item })}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    <Check className="w-4 h-4 mr-2" /> CONFIRM
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleReject(item._id)}
                    className="border-red-900/50 text-red-500 hover:bg-red-950/30 font-bold"
                  >
                    <X className="w-4 h-4 mr-2" /> REJECT
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => !open && setConfirmDialog({ isOpen: false, item: null })}>
        <DialogContent className="bg-slate-900 border border-slate-800 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center">
              <ShieldCheck className="w-6 h-6 mr-2 text-emerald-500" />
              Confirm Threat Intelligence?
            </DialogTitle>
            <DialogDescription className="text-slate-400 mt-4 text-left">
              This action will securely validate the user's feedback into the central Threat Knowledge Base.
              <br/><br/>
              <strong className="text-slate-300 block mb-2">This will:</strong>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center"><Check className="w-4 h-4 text-emerald-500 mr-2 shrink-0"/> Mark this feedback as analyst-confirmed</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-emerald-500 mr-2 shrink-0"/> Add validated evidence to the Threat Knowledge Base</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-emerald-500 mr-2 shrink-0"/> Update related campaign intelligence</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-emerald-500 mr-2 shrink-0"/> Make the evidence eligible for future RAG retrieval</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button variant="ghost" onClick={() => setConfirmDialog({ isOpen: false, item: null })} className="text-slate-400">
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmAction} 
              disabled={actionLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {actionLoading ? 'Confirming...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
