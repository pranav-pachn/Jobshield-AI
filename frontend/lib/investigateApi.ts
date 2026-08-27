import { api, apiFetch } from './apiClient';
import { InvestigationInput, InvestigationTrace } from './investigationTypes';
import { createInvestigationStream } from './sse/investigationStream';
import { getBackendUrl } from "@/lib/apiConfig";

/**
 * Initiates a new investigation by sending input data to the backend.
 * 
 * @param input The job text and optional context
 * @returns The resulting InvestigationTrace
 **/

export async function startInvestigation(input: InvestigationInput): Promise<InvestigationTrace> {
  return api.post<InvestigationTrace>(`${getBackendUrl()}/api/investigations`, input);
}

/**
 * Retrieves a previously run investigation by its ID.
 * 
 * @param id The ID of the investigation trace
 * @returns The InvestigationTrace
 */
export async function getInvestigation(id: string): Promise<InvestigationTrace> {
  try {
    return await api.get<InvestigationTrace>(`${getBackendUrl()}/api/investigations/${id}`);
  } catch (error: any) {
    if (error.message?.includes('404')) {
      throw new Error('Investigation not found');
    }
    throw new Error('Failed to fetch investigation');
  }
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
  return createInvestigationStream(input, onMessage, onError, onComplete);
}
