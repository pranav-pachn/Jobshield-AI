import { InvestigationInput } from "../investigationTypes";
import { SSEEvent } from "./streamTypes";
import { parseSSEBlock } from "./eventParser";
import { getBackendUrl } from "@/lib/apiConfig";

import { apiFetch } from "../apiClient";

export async function createInvestigationStream(
  input: InvestigationInput,
  onMessage: (event: SSEEvent) => void,
  onError: (error: Error) => void,
  onComplete: () => void
) {
  try {
    const response = await apiFetch(`${getBackendUrl()}/api/investigations/stream`, {
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
      const blocks = buffer.split('\n\n');
      buffer = blocks.pop() || ''; // Keep the incomplete part

      for (const block of blocks) {
        const event = parseSSEBlock(block);
        if (event) {
          onMessage(event);
          if (event.event === 'COMPLETE' || event.event === 'ERROR') {
            onComplete();
            return;
          }
        }
      }
    }
    
    onComplete();
  } catch (error: any) {
    onError(error instanceof Error ? error : new Error(String(error)));
  }
}
