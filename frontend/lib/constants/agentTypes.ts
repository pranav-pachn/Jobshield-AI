import { FileText, UserSearch, ShieldAlert, Scale, CheckCircle } from 'lucide-react';

export const AGENT_INFO = {
  content_investigator: {
    label: 'Content Investigator',
    icon: FileText,
    description: 'Analyzes the payload for urgency, suspicious links, and financial requests.',
  },
  recruiter_investigator: {
    label: 'Recruiter Investigator',
    icon: UserSearch,
    description: 'Cross-references recruiter identity and company domain.',
  },
  threat_intelligence_agent: {
    label: 'Threat Intelligence',
    icon: ShieldAlert,
    description: 'Searches known scam databases and recent threat reports.',
  },
  evidence_aggregator: {
    label: 'Evidence Aggregator',
    icon: Scale,
    description: 'Weighs all signals and identifies contradictions.',
  },
  final_decision_agent: {
    label: 'Final Decision',
    icon: CheckCircle,
    description: 'Applies policies to reach a final risk assessment.',
  }
};

export function getAgentInfo(agentName: string) {
  return AGENT_INFO[agentName as keyof typeof AGENT_INFO] || {
    label: agentName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    icon: FileText,
    description: 'Investigation agent.',
  };
}
