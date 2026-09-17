"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { getInvestigation } from "@/lib/investigateApi";
import { InvestigationTrace } from "@/lib/investigationTypes";
import { InvestigationReport } from "@/components/investigation/InvestigationReport";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function InvestigationPage() {
  const { id } = useParams();
  const router = useRouter();
  const [trace, setTrace] = useState<InvestigationTrace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchTrace = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getInvestigation(id as string);
        setTrace(data);
      } catch (err: any) {
        setError(err.message || "Failed to load investigation details");
      } finally {
        setLoading(false);
      }
    };

    fetchTrace();
  }, [id]);

  return (
    <AuthGuard>
      <div className="flex-1 bg-background min-h-screen p-4 sm:p-8 pt-6">
        <div className="max-w-4xl mx-auto mb-6 border-b border-slate-800/80 pb-6">
          <Link href="/investigations" className="inline-flex items-center text-slate-400 hover:text-slate-200 font-sans text-xs transition-colors mb-4">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Investigations
          </Link>
          <h1 className="text-3xl font-serif text-slate-100 mb-2">Investigation Report</h1>
          {trace && (
            <div className="flex items-center gap-2 text-xs">
              <span className={`font-medium ${
                trace.state === 'COMPLETED' ? 'text-emerald-400' :
                trace.state === 'FAILED' ? 'text-rose-400' :
                'text-amber-400'
              }`}>
                {trace.state === 'COMPLETED' ? 'Completed' : trace.state}
              </span>
              <span className="text-slate-600">·</span>
              <span className="font-mono text-slate-400">
                {trace.completedAt 
                  ? new Date(trace.completedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                  : trace.createdAt 
                    ? new Date(trace.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                    : ''}
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 text-slate-400">
            <Loader2 className="h-7 w-7 animate-spin mb-3 text-blue-400" />
            <p className="font-sans text-xs">Loading investigation record...</p>
          </div>
        ) : error ? (
          <div className="max-w-xl mx-auto bg-surface-elevated border border-slate-800 p-8 rounded-xl text-center text-slate-300 mt-10 space-y-4">
            <AlertCircle className="h-8 w-8 text-amber-400 mx-auto opacity-80" />
            <h3 className="text-lg font-serif text-slate-100">Unable to load investigation</h3>
            <p className="text-xs text-slate-400 font-sans">{error}</p>
            <Link href="/investigate">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs">
                Analyze a Job →
              </Button>
            </Link>
          </div>
        ) : trace ? (
          <div className="w-full">
            <InvestigationReport trace={trace} onReset={() => router.push("/investigate")} />
          </div>
        ) : null}
      </div>
    </AuthGuard>
  );
}
