import { useCallback, useRef } from 'react';
import { useInvestigationStore } from '@/store/investigationStore';
import { createInvestigationStream } from '@/lib/sse/investigationStream';

export function useInvestigationStream() {
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastPayloadRef = useRef<any>(null);

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

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setStatus('CANCELLED');
  }, [setIsStreaming, setStatus]);

  const startStream = useCallback(async (payload: any) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    lastPayloadRef.current = payload;

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
          if (controller.signal.aborted) {
            setIsStreaming(false);
            return;
          }
          setError(err.message || 'Connection interrupted. Please try again.');
          setIsStreaming(false);
          setStatus('ERROR');
        },
        () => {
          setIsStreaming(false);
        },
        controller.signal
      );
    } catch (err: any) {
      if (!controller.signal.aborted) {
        setError(err.message || 'Failed to start investigation stream');
        setIsStreaming(false);
        setStatus('ERROR');
      }
    }
  }, [reset, setIsStreaming, setStatus, updateAgentState, setTrace, setError]);

  const retryStream = useCallback(async () => {
    if (lastPayloadRef.current) {
      await startStream(lastPayloadRef.current);
    }
  }, [startStream]);

  return {
    isStreaming,
    status,
    trace,
    agentStates,
    error,
    startStream,
    cancelStream,
    retryStream,
    reset
  };
}
