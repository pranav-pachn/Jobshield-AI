import { ExecutiveSummary } from "./ExecutiveSummary";
import { ReportEvidence } from "./ReportEvidence";
import { ReportRecommendations } from "./ReportRecommendations";
import { ThreatGraph } from "./ThreatGraph";
import { FeedbackPanel } from "./FeedbackPanel";

interface IInvestigationReport {
  investigationId: string;
  jobTitle: string;
  company: string;
  verdict: string;
  riskScore: number;
  confidence: number;
  status: string;
  evidence: any[];
  threatGraphData: any;
  recommendations: string[];
  createdAt: string;
}

interface InvestigationReportProps {
  report: IInvestigationReport;
}

export function InvestigationReport({ report }: InvestigationReportProps) {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="border-b border-slate-800 pb-6 mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{report.jobTitle}</h1>
        <div className="flex flex-wrap items-center gap-4 text-slate-400">
          <span>{report.company}</span>
          <span>•</span>
          <span className="font-mono text-sm">ID: {report.investigationId}</span>
          <span>•</span>
          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <ExecutiveSummary 
        verdict={report.verdict}
        riskScore={report.riskScore}
        confidence={report.confidence}
        reasons={report.evidence.filter(e => e.quality === 'primary').map(e => e.description)}
      />

      <ReportEvidence evidence={report.evidence} />

      <ThreatGraph graphData={report.threatGraphData} />

      <ReportRecommendations recommendations={report.recommendations} />

      <FeedbackPanel investigationId={report.investigationId} />
    </div>
  );
}
