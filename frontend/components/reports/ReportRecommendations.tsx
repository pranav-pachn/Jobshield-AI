import { CheckSquare } from "lucide-react";

interface ReportRecommendationsProps {
  recommendations: string[];
}

export function ReportRecommendations({ recommendations }: ReportRecommendationsProps) {
  return (
    <section id="recommendations" className="scroll-mt-24 space-y-4">
      <h3 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">Recommended Actions</h3>
      
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5">
        <ul className="space-y-3">
          {recommendations.map((rec, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <CheckSquare className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
              <span className="text-slate-300 leading-relaxed font-medium">{rec}</span>
            </li>
          ))}
          {recommendations.length === 0 && (
            <li className="text-slate-500 italic">No specific recommendations.</li>
          )}
        </ul>
      </div>
    </section>
  );
}
