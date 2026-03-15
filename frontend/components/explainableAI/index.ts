/**
 * Explainable AI Components
 * 
 * A collection of modular components for displaying transparent scam detection results.
 * Each component can be used independently or combined with ScamAnalysisDetailedView.
 */

export { WhyItWasFlaggedPanel } from "./WhyItWasFlaggedPanel";
export type { WhyItWasFlaggedPanelProps } from "./WhyItWasFlaggedPanel";

export { EvidenceSourcesPanel } from "./EvidenceSourcesPanel";
export type { EvidenceSourcesPanelProps, EvidenceSource } from "./EvidenceSourcesPanel";

export { DomainIntelligencePanel } from "./DomainIntelligencePanel";
export type { DomainIntelligencePanelProps, DomainIntelligence } from "./DomainIntelligencePanel";

export { SimilarPatternPanel } from "./SimilarPatternPanel";
export type { SimilarPatternPanelProps, SimilarPattern } from "./SimilarPatternPanel";

export { CommunityReportsPanel } from "./CommunityReportsPanel";
export type { CommunityReportsPanelProps } from "./CommunityReportsPanel";

export { ConfidenceLevelPanel } from "./ConfidenceLevelPanel";
export type { ConfidenceLevelPanelProps } from "./ConfidenceLevelPanel";

export { SourceLinksPanel } from "./SourceLinksPanel";
export type { SourceLinksPanelProps, SourceLink } from "./SourceLinksPanel";

export { ReportDownloadPanel } from "./ReportDownloadPanel";
export type { ReportDownloadPanelProps } from "./ReportDownloadPanel";

export { ScamAnalysisDetailedView } from "./ScamAnalysisDetailedView";
export type { ScamAnalysisDetailedViewProps, EnrichedAnalysisData } from "./ScamAnalysisDetailedView";
