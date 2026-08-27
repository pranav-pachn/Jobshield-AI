"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { apiFetch } from "@/lib/apiClient";
import { getBackendUrl } from "@/lib/apiConfig";

export default function EvaluationDashboard() {
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRuns() {
      try {
        const res = await apiFetch(`${getBackendUrl()}/api/evaluation/runs`);
        if (!res.ok) throw new Error("Failed to load evaluation runs");
        const data = await res.json();
        setRuns(data);
      } catch (err: any) {
        setError(err.message || "Failed to load evaluation runs");
      } finally {
        setLoading(false);
      }
    }

    fetchRuns();
  }, []);

  const latestRun = runs[0];

  return (
    <RoleGuard allowedRoles={["ANALYST", "ADMIN"]}>
      <div className="flex h-screen bg-neutral-900 text-neutral-100 font-sans selection:bg-brand-500/30">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar />
          <div className="flex-1 overflow-y-auto p-8 lg:p-10">
            <div className="max-w-5xl mx-auto space-y-10">
              
              <header>
                <h1 className="text-3xl font-light text-white tracking-tight">Evaluation Center</h1>
                <p className="text-neutral-400 mt-2">Quantitative performance metrics for JobShield AI architectures.</p>
              </header>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="animate-pulse space-y-8">
                  <div className="h-32 bg-neutral-800 rounded-2xl w-full"></div>
                  <div className="h-64 bg-neutral-800 rounded-2xl w-full"></div>
                </div>
              ) : (
                <>
                  {latestRun && (
                    <section className="bg-neutral-800/50 rounded-2xl border border-neutral-800 p-8">
                      <div className="flex justify-between items-end border-b border-neutral-800 pb-6 mb-8">
                        <div>
                          <h2 className="text-sm font-medium text-brand-400 uppercase tracking-widest mb-1">Latest Run</h2>
                          <div className="text-2xl font-light text-white">{latestRun.systemVersion}</div>
                        </div>
                        <div className="text-right text-sm text-neutral-400">
                          <div>Dataset: {latestRun.datasetVersion}</div>
                          <div>{new Date(latestRun.startedAt).toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        <MetricCard 
                          label="F1 Score" 
                          value={(latestRun.metrics.f1 * 100).toFixed(1) + "%"} 
                        />
                        <MetricCard 
                          label="Precision" 
                          value={(latestRun.metrics.precision * 100).toFixed(1) + "%"} 
                        />
                        <MetricCard 
                          label="Recall" 
                          value={(latestRun.metrics.recall * 100).toFixed(1) + "%"} 
                        />
                        <MetricCard 
                          label="False Positive Rate" 
                          value={(latestRun.metrics.falsePositiveRate * 100).toFixed(1) + "%"} 
                        />
                        <MetricCard 
                          label="Coverage" 
                          value={(latestRun.metrics.coverage * 100).toFixed(1) + "%"} 
                        />
                        <MetricCard 
                          label="P95 Latency" 
                          value={Math.round(latestRun.metrics.p95LatencyMs) + "ms"} 
                        />
                      </div>
                    </section>
                  )}

                  <section className="space-y-4">
                    <h3 className="text-xl font-light text-white">Historical Runs</h3>
                    <div className="bg-neutral-800/30 rounded-2xl border border-neutral-800 overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-800/50 text-neutral-400">
                          <tr>
                            <th className="px-6 py-4 font-medium">System</th>
                            <th className="px-6 py-4 font-medium">Dataset</th>
                            <th className="px-6 py-4 font-medium text-right">F1</th>
                            <th className="px-6 py-4 font-medium text-right">Precision</th>
                            <th className="px-6 py-4 font-medium text-right">Recall</th>
                            <th className="px-6 py-4 font-medium text-right">Coverage</th>
                            <th className="px-6 py-4 font-medium text-right">Latency</th>
                            <th className="px-6 py-4 font-medium text-right">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/50">
                          {runs.map((run) => (
                            <tr key={run.runId} className="hover:bg-neutral-800/50 transition-colors">
                              <td className="px-6 py-4 text-white">{run.systemVersion}</td>
                              <td className="px-6 py-4 text-neutral-400">{run.datasetVersion}</td>
                              <td className="px-6 py-4 text-right text-brand-400 font-medium">{(run.metrics.f1 * 100).toFixed(1)}%</td>
                              <td className="px-6 py-4 text-right text-white">{(run.metrics.precision * 100).toFixed(1)}%</td>
                              <td className="px-6 py-4 text-right text-white">{(run.metrics.recall * 100).toFixed(1)}%</td>
                              <td className="px-6 py-4 text-right text-white">{(run.metrics.coverage * 100).toFixed(1)}%</td>
                              <td className="px-6 py-4 text-right text-neutral-400">{Math.round(run.metrics.p95LatencyMs)}ms</td>
                              <td className="px-6 py-4 text-right text-neutral-500">{new Date(run.startedAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                          {runs.length === 0 && (
                            <tr>
                              <td colSpan={8} className="px-6 py-8 text-center text-neutral-500">
                                No evaluation runs found. Run `npm run evaluate` in the backend.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm font-medium text-neutral-400 mb-1">{label}</div>
      <div className="text-3xl font-light text-white tracking-tight">{value}</div>
    </div>
  );
}
