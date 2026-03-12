type ScamEntityNode = {
  id: string;
  label: string;
  type: "email" | "phone" | "domain" | "job";
};

type ScamConnection = {
  source: string;
  target: string;
};

type ScamNetworkGraphProps = {
  nodes?: ScamEntityNode[];
  edges?: ScamConnection[];
};

export function ScamNetworkGraph({ nodes = [], edges = [] }: ScamNetworkGraphProps) {
  return (
    <section>
      <h2>Scam Network Graph</h2>
      <p>Visualize linked scam entities and suspicious recruiter relationships.</p>
      <p>Nodes: {nodes.length}</p>
      <p>Connections: {edges.length}</p>
    </section>
  );
}