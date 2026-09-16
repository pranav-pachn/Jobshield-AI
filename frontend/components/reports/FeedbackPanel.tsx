"use client";

import { FeedbackPanel as V2FeedbackPanel } from "@/components/investigation/explainabilityV2/FeedbackPanel";

interface FeedbackPanelProps {
  investigationId: string;
}

export function FeedbackPanel({ investigationId }: FeedbackPanelProps) {
  return <V2FeedbackPanel analysisId={investigationId} />;
}
