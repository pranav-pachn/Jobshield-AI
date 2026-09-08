"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { EntityHeader } from "@/components/intelligence/EntityHeader";
import { getBackendUrl } from "@/lib/apiConfig";
import { getStoredToken } from "@/lib/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ChevronLeft, Users } from "lucide-react";
import Link from "next/link";
import { EntityExplainPanel } from "@/components/intelligence/EntityExplainPanel";

export default function RecruiterDossierPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [dossier, setDossier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchDossier = async () => {
      try {
        const token = getStoredToken();
        const res = await fetch(`${getBackendUrl()}/api/recruiter-profiles/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch recruiter intelligence");
        const data = await res.json();
        setDossier(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDossier();
  }, [id]);

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-[#050912] flex items-center justify-center flex-col gap-4">
          <LoadingSpinner message="Decrypting identity dossier..." size="lg" />
        </div>
      </AuthGuard>
    );
  }

  if (error || !dossier) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-[#050912] p-8 md:p-12 pt-6">
          <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-xl text-center text-red-400 font-mono">
            <h2 className="text-xl font-bold mb-2">INTELLIGENCE SOURCE UNAVAILABLE</h2>
            <p className="mb-4">Unable to retrieve recruiter intelligence.</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded border border-red-500/50 transition-colors uppercase tracking-widest text-xs font-bold">
              [Retry]
            </button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const { profile, riskAnalysis } = dossier;
  const primaryIdentity = profile.names?.[0] || profile.emails?.[0] || "Unknown Identity";

  return (
    <AuthGuard>
      <div className="flex-1 space-y-6 p-8 md:p-12 pt-6 bg-[#050912] min-h-screen">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-widest">
          <Link href="/threat-intelligence" className="hover:text-blue-400 transition-colors">INTELLIGENCE</Link>
          <span>/</span>
          <Link href="/recruiters" className="hover:text-blue-400 transition-colors">RECRUITERS</Link>
          <span>/</span>
          <span className="text-slate-300 truncate max-w-[200px]">{primaryIdentity}</span>
        </div>

        <button onClick={() => router.push('/recruiters')} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Search
        </button>

        <EntityHeader
          type="RECRUITER"
          id={primaryIdentity}
          title={primaryIdentity}
          riskLevel={riskAnalysis.level}
          icon={Users}
        />

        <div className="mt-8">
          <EntityExplainPanel 
            entityType="recruiter" 
            entityValue={primaryIdentity} 
            prefetchedData={dossier} 
          />
        </div>

      </div>
    </AuthGuard>
  );
}
