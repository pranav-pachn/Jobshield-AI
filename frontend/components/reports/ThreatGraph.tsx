import { ScamNetworkGraph } from "@/components/intelligence/ScamNetworkGraph";
import { AlertCircle } from "lucide-react";

interface ThreatGraphProps {
  graphData: {
    nodes: any[];
    links: any[];
  };
}

export function ThreatGraph({ graphData }: ThreatGraphProps) {
  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <section id="threat-graph" className="scroll-mt-24 space-y-4">
        <h3 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">Threat Network Graph</h3>
        <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-8 flex flex-col items-center justify-center text-slate-500">
          <AlertCircle className="h-8 w-8 mb-3 opacity-50" />
          <p>No threat network connections found for this investigation.</p>
        </div>
      </section>
    );
  }

  // Transform data for ScamNetworkGraph
  // Ensure the investigation node is marked as 'analysis' and others mapped correctly
  const transformedNodes = graphData.nodes.map(n => ({
    id: n.id,
    label: n.label,
    nodeType: n.type === 'investigation' ? 'analysis' : 
              n.type === 'domain' ? 'domain' : 
              n.type === 'email' ? 'recruiter' : 
              'job', // fallback
    threat: n.riskLevel === 'high' ? 'high' : 
            n.riskLevel === 'medium' ? 'medium' : 'low',
    details: n.type
  }));

  const transformedLinks = graphData.links.map(l => ({
    source: l.source,
    target: l.target,
    label: l.relationship
  }));

  const adaptedData = {
    nodes: transformedNodes,
    links: transformedLinks
  };

  return (
    <section id="threat-graph" className="scroll-mt-24 space-y-4">
      <h3 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">Threat Network Graph</h3>
      <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 h-[600px]">
        {/* ScamNetworkGraph expects a slightly different shape, but we can pass it adaptedData as analysisResult */}
        {/* Actually ScamNetworkGraph fetches its own data unless provided via props, let's assume we can pass it, or we need to ensure ScamNetworkGraph can accept static data */}
        <ScamNetworkGraph staticData={adaptedData} />
      </div>
    </section>
  );
}
