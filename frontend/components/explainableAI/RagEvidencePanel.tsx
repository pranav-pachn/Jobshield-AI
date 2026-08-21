import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, ExternalLink, ShieldCheck, Database, Zap } from "lucide-react";

export interface RagChunk {
  id: string;
  score: number;
  text: string;
  metadata: {
    type: string;
    title: string;
    source: string;
    evidenceQuality: string;
    dateAdded?: string;
  };
}

export interface RagEvidencePanelProps {
  rag_evidence?: RagChunk[];
}

export const RagEvidencePanel: React.FC<RagEvidencePanelProps> = ({ rag_evidence }) => {
  if (!rag_evidence || rag_evidence.length === 0) {
    return (
      <Card className="glass-card border-border flex items-center justify-center p-6 text-center text-muted-foreground min-h-[120px]">
        <div>
          <Database className="h-6 w-6 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No threat intelligence evidence was retrieved for this analysis.</p>
        </div>
      </Card>
    );
  }

  // Sort by score descending
  const sortedEvidence = [...rag_evidence].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-4">
      {sortedEvidence.map((chunk, idx) => (
        <Card key={chunk.id || idx} className="glass-card border-border overflow-hidden hover:border-primary/40 transition-colors">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              {/* Left Side: Score & Metadata */}
              <div className="bg-muted/30 p-4 border-b md:border-b-0 md:border-r border-border md:w-[220px] flex-shrink-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-foreground tracking-wider uppercase">
                      {chunk.metadata.type || "Intel"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-muted-foreground">Similarity</span>
                    <span className="text-sm font-semibold text-emerald-400">
                      {Math.round(chunk.score * 100)}%
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Source</span>
                      <span className="text-xs text-foreground font-medium flex items-center gap-1 truncate" title={chunk.metadata.source}>
                        {chunk.metadata.source.substring(0, 24)}
                        {chunk.metadata.source.length > 24 && "..."}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Quality</span>
                      <span className="text-xs text-foreground font-medium capitalize">
                        {chunk.metadata.evidenceQuality.toLowerCase()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-border/50 flex items-center gap-1.5 text-xs text-primary/80 font-medium">
                  <Zap className="h-3.5 w-3.5" /> RAG Context
                </div>
              </div>
              
              {/* Right Side: Content */}
              <div className="p-4 md:p-5 flex-1 flex flex-col">
                <h4 className="font-semibold text-foreground mb-2 flex items-start gap-2">
                  {chunk.metadata.title}
                </h4>
                <div className="text-sm text-muted-foreground bg-background/40 p-3 rounded-md border border-border/40 italic flex-1 flex items-start gap-3">
                  <FileText className="h-4 w-4 text-primary/60 mt-0.5 flex-shrink-0" />
                  <p className="leading-relaxed">"{chunk.text}"</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
