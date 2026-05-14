export interface GraphNode {
  id: string;
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface AnalysisGraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

interface BuildGraphInput {
  domain?: string;
  email?: string;
  phrases?: string[];
}

function normalizeValue(value?: string): string | undefined {
  if (!value || typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized : undefined;
}

export function extractPrimaryEmail(text?: string): string | undefined {
  if (!text) {
    return undefined;
  }

  const match = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  return match ? normalizeValue(match[0]) : undefined;
}

export function buildGraph({ domain, email, phrases = [] }: BuildGraphInput): AnalysisGraphData {
  const normalizedDomain = normalizeValue(domain);
  const normalizedEmail = normalizeValue(email);
  const normalizedPhrases = Array.from(
    new Set(
      phrases
        .map((phrase) => normalizeValue(phrase))
        .filter((phrase): phrase is string => Boolean(phrase))
    )
  );

  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  if (normalizedDomain) {
    nodes.push({ id: normalizedDomain });
  }

  if (normalizedEmail) {
    nodes.push({ id: normalizedEmail });
  }

  normalizedPhrases.forEach((phrase) => {
    nodes.push({ id: phrase });
  });

  if (normalizedDomain && normalizedEmail) {
    links.push({ source: normalizedDomain, target: normalizedEmail });
  }

  if (normalizedEmail) {
    normalizedPhrases.forEach((phrase) => {
      links.push({ source: normalizedEmail, target: phrase });
    });
  }

  return { nodes, links };
}
