import { fetchWithAuth } from './apiClient';
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
  const response = await fetchWithAuth(`${getBackendBaseUrl()}/api/investigations`, {
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
  const response = await fetchWithAuth(`${getBackendBaseUrl()}/api/investigations/${id}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Investigation not found');
    }
    throw new Error('Failed to fetch investigation');
  }

  return response.json();
}
