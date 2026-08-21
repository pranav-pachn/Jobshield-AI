import { apiFetch } from './apiClient';
import { InvestigationInput, InvestigationTrace } from './investigationTypes';

const getBackendBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
};

/**
 * Initiates a new investigation by sending input data to the backend.
 * 
 * @param input The job text and optional context
 * @returns The resulting InvestigationTrace
 **/

export async function startInvestigation(input: InvestigationInput): Promise<InvestigationTrace> {
  const response = await apiFetch(`${getBackendBaseUrl()}/api/investigations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error('Failed to start investigation');
  }

  return response.json();
}

/**
 * Retrieves a previously run investigation by its ID.
 * 
 * @param id The ID of the investigation trace
 * @returns The InvestigationTrace
 */
export async function getInvestigation(id: string): Promise<InvestigationTrace> {
  const response = await apiFetch(`${getBackendBaseUrl()}/api/investigations/${id}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Investigation not found');
    }
    throw new Error('Failed to fetch investigation');
  }

  return response.json();
}

/**
 * Initiates an investigation stream using Server-Sent Events.
 */
export async function streamInvestigation(
  input: InvestigationInput,
  onMessage: (event: any) => void,
  onError: (error: any) => void,
  onComplete: () => void
) {
  try {
    const response = await apiFetch(`${getBackendBaseUrl()}/api/investigations/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error('Failed to start investigation stream');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No readable stream');
    
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || ''; // Keep the incomplete part

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataString = line.slice(6);
          try {
            const event = JSON.parse(dataString);
            onMessage(event);
            if (event.event === 'COMPLETE') {
              onComplete();
              return;
            }
          } catch (e) {
            console.error('Failed to parse SSE JSON', e);
          }
        }
      }
    }
    onComplete();
  } catch (error) {
    onError(error);
  }
}
