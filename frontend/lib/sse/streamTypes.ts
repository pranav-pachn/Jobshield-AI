import { InvestigationTrace, AgentTrace } from "../investigationTypes";

export type SSEEvent = 
  | { event: 'STATE_UPDATE'; state: string; [key: string]: any }
  | { event: 'AGENT_COMPLETED'; agent: string; trace: AgentTrace; [key: string]: any }
  | { event: 'COMPLETE'; trace: InvestigationTrace; [key: string]: any }
  | { event: 'ERROR'; error: string; [key: string]: any };
