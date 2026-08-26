import { useCallback } from 'react';
import { useInvestigationStore } from '@/store/investigationStore';
import { createInvestigationStream } from '@/lib/sse/investigationStream';

export function useInvestigationStream() {
  const { 
    isStreaming, 
    status, 
    trace, 
    agentStates, 
    error,
    setIsStreaming,
    setStatus,
    setTrace,
    updateAgentState,
    setError,
    reset 
  } = useInvestigationStore();

  const startStream = useCallback(async (payload: any) => {
    reset();
    setIsStreaming(true);
    setStatus('STARTING');

    try {
      await createInvestigationStream(
        payload,
        (event: any) => {
          if (event.event === 'STATE_UPDATE') {
            setStatus(event.state);
          } else if (event.event === 'AGENT_COMPLETED') {
            updateAgentState(event.agent, { status: 'complete', trace: event.trace });
          } else if (event.event === 'COMPLETE') {
            setTrace(event.trace);
            setIsStreaming(false);
            setStatus('COMPLETE');
          } else if (event.event === 'ERROR') {
            setError(event.error || 'Stream error');
            setIsStreaming(false);
            setStatus('ERROR');
          }
        },
        (err: any) => {
          setError(err.message || 'Stream error');
          setIsStreaming(false);
          setStatus('ERROR');
        },
        () => {
          setIsStreaming(false);
        }
      );
    } catch (err: any) {
      setError(err.message || 'Failed to start stream');
      setIsStreaming(false);
      setStatus('ERROR');
    }
  }, [reset, setIsStreaming, setStatus, updateAgentState, setTrace, setError]);

  return {
    isStreaming,
    status,
    trace,
    agentStates,
    error,
    startStream,
    reset
  };
}
