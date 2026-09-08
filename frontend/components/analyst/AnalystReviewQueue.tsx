import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, AlertTriangle, ExternalLink, ShieldCheck, ClipboardCheck } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { getBackendUrl } from "@/lib/apiConfig";

export default function AnalystReviewQueue() {
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

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 bg-surface-elevated rounded-xl w-full"></div>
        ))}
      </div>
    );
  }
  
  if (error) return <div className="p-8 text-center text-red-500 bg-red-500/10 rounded-xl">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-sm font-medium text-slate-400 tracking-widest uppercase">
            3 FEEDBACK ITEMS REQUIRE REVIEW
          </h2>
        </div>
        <Badge className="bg-primary/20 text-primary border-primary/30">
          {feedbackList.length} Pending
        </Badge>
      </div>

      {feedbackList.length === 0 ? (
        <div className="bg-surface-elevated border border-slate-800 rounded-xl p-8">
          <EmptyState 
            icon={ClipboardCheck}
            title="QUEUE CLEAR"
            description="No analyst feedback requires review."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {feedbackList.map(item => (
            <Card key={item._id} className="bg-surface-elevated border-slate-800 flex flex-col h-full shadow-lg">
              <CardHeader className="border-b border-slate-800 pb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-mono font-bold text-slate-300">FEEDBACK-{item._id.substring(0,4).toUpperCase()}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">PENDING</span>
                </div>
              </CardHeader>
              
              <CardContent className="pt-4 flex-1 space-y-5 flex flex-col">
                
                {/* Original Prediction */}
                <div className="bg-surface rounded p-3 border border-slate-800">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Original Prediction</div>
                  <div className="flex items-center gap-2 font-mono text-sm font-medium">
                    <span className={item.originalVerdict === 'CRITICAL' || item.originalVerdict === 'High' ? 'text-red-400' : 'text-[#00ff88]'}>
                      {item.originalVerdict.toUpperCase()}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400">{item.originalRiskScore}/100</span>
                  </div>
                </div>

                {/* User Feedback */}
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">User Feedback</div>
                  <div className="flex items-start gap-2 mb-2">
                    <span className="font-bold text-white uppercase text-sm tracking-wide">{item.feedbackType.replace(/_/g, ' ')}</span>
                  </div>
                  <p className="text-sm text-slate-300 italic border-l-2 border-primary/50 pl-3 py-1">
                    "{item.feedbackReason}"
                  </p>
                </div>

                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Campaign</span>
                  </div>
                  <div className="font-mono text-sm text-slate-300 flex items-center gap-2">
                     <span className="text-red-400 font-bold text-[10px] bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">CRITICAL</span>
                     CAMPAIGN-{item.investigationId.substring(0, 4).toUpperCase()}
                  </div>
                </div>

                <div className="flex-1"></div>

                <div className="text-center mt-2 mb-4">
                  <a href={`/investigations/${item.investigationId}`} target="_blank" className="text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors">
                    [ VIEW INVESTIGATION ]
                  </a>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800 mt-auto">
                  <Button 
                    variant="outline"
                    onClick={() => handleReject(item._id)}
                    className="bg-transparent border-slate-700 text-slate-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 font-bold tracking-widest text-xs"
                  >
                    [ REJECT ]
                  </Button>
                  <Button 
                    onClick={() => setConfirmDialog({ isOpen: true, item })}
                    className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 font-bold tracking-widest text-xs"
                  >
                    [ CONFIRM ]
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => !open && setConfirmDialog({ isOpen: false, item: null })}>
        <DialogContent className="bg-surface-elevated border border-slate-800 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-light tracking-tight flex items-center">
              ANALYST CONFIRMATION
            </DialogTitle>
            <DialogDescription className="text-slate-400 mt-4 text-left">
              This intelligence will:
              <br/><br/>
              <ul className="space-y-3 text-sm font-medium text-slate-300">
                <li className="flex items-center"><Check className="w-4 h-4 text-primary mr-3 shrink-0"/> Create verified Threat Knowledge</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-primary mr-3 shrink-0"/> Become eligible for RAG retrieval</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-primary mr-3 shrink-0"/> Update campaign intelligence</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-primary mr-3 shrink-0"/> Preserve the original prediction</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-8">
            <Button 
              onClick={handleConfirmAction} 
              disabled={actionLoading}
              className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 font-bold tracking-widest text-xs"
            >
              {actionLoading ? 'CONFIRMING...' : '[ CONFIRM INTELLIGENCE ]'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
