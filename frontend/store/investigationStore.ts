import { create } from 'zustand';
import { InvestigationTrace, AgentTrace } from '@/lib/investigationTypes';

interface InvestigationState {
  isStreaming: boolean;
  status: string;
  trace: InvestigationTrace | null;
  agentStates: Record<string, { status: string; trace?: AgentTrace }>;
  error: string | null;
  executionMode: "LIVE" | "DEMO";
  
  setIsStreaming: (isStreaming: boolean) => void;
  setStatus: (status: string) => void;
  setTrace: (trace: InvestigationTrace) => void;
  updateAgentState: (agentName: string, state: { status: string; trace?: AgentTrace }) => void;
  setError: (error: string | null) => void;
  setExecutionMode: (mode: "LIVE" | "DEMO") => void;
  reset: () => void;
}

export const useInvestigationStore = create<InvestigationState>((set) => ({
  isStreaming: false,
  status: 'IDLE',
  trace: null,
  agentStates: {},
  error: null,
  executionMode: 'LIVE',

  setIsStreaming: (isStreaming) => set({ isStreaming }),
  setStatus: (status) => set({ status }),
  setTrace: (trace) => set({ trace }),
  updateAgentState: (agentName, state) =>
    set((prev) => ({
      agentStates: {
        ...prev.agentStates,
        [agentName]: { ...prev.agentStates[agentName], ...state },
      },
    })),
  setError: (error) => set({ error }),
  setExecutionMode: (executionMode) => set({ executionMode }),
  reset: () => set({ isStreaming: false, status: 'IDLE', trace: null, agentStates: {}, error: null }),
}));
