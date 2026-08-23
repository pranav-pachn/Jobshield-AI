import { SSEEvent } from "./streamTypes";

export function parseSSEBlock(block: string): SSEEvent | null {
  // Only process blocks that have data
  if (!block.startsWith('data: ')) {
    return null;
  }
  
  const dataString = block.slice(6);
  try {
    return JSON.parse(dataString) as SSEEvent;
  } catch (e) {
    console.error('Failed to parse SSE JSON block:', e, 'Raw string:', dataString);
    return null;
  }
}
