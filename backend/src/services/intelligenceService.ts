import { Investigation } from "../models/Investigation";
import { 
  AnalyticsOverview, 
  ScamTrend, 
  ThreatSummary, 
  PerformanceMetrics 
} from "../types/intelligenceTypes";

// Central normalization map for scam signal names
export const signalNormalizationMap: Record<string, string> = {
  "registration_fee": "Registration Fee",
  "telegram_interview": "Telegram Interview",
  "crypto_payment": "Crypto Payment",
  "credential_harvesting": "Credential Harvesting",
  "unrealistic_salary": "Unrealistic Salary",
  "generic_email": "Generic Email Domain",
  "urgent_action": "Urgent Action Required",
  "vague_job_description": "Vague Job Description",
  "poor_grammar": "Poor Grammar / Spelling",
  "whatsapp_interview": "WhatsApp Interview",
  "advance_fee": "Advance Fee Fraud",
  "equipment_purchase": "Equipment Purchase Scam",
  "fake_check": "Fake Check Scam"
};

export const normalizeSignalName = (rawName: string): string => {
  if (!rawName) return "Unknown Signal";
  // If it's already in the map, return it
  if (signalNormalizationMap[rawName]) {
    return signalNormalizationMap[rawName];
  }
  // If it's a known normalized name, return it
  if (Object.values(signalNormalizationMap).includes(rawName)) {
    return rawName;
  }
  // Otherwise, fallback to a title-case version of the raw name
  return rawName
    .split(/[_\\-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const getAnalyticsOverview = async (): Promise<AnalyticsOverview> => {
  const total = await Investigation.countDocuments();
  if (total === 0) {
    return {
      totalInvestigations: 0,
      scamCount: 0,
      legitimateCount: 0,
      humanReviewCount: 0,
      averageConfidence: 0,
      highRiskPercentage: 0
    };
  }

  const pipeline = [
    {
      $group: {
        _id: null,
        scamCount: {
          $sum: {
            $cond: [{ $eq: ["$decisionPolicy.decision", "SCAM"] }, 1, 0]
          }
        },
        legitimateCount: {
          $sum: {
            $cond: [{ $eq: ["$decisionPolicy.decision", "LEGITIMATE"] }, 1, 0]
          }
        },
        humanReviewCount: {
          $sum: {
            $cond: [{ $eq: ["$decisionPolicy.decision", "HUMAN_REVIEW"] }, 1, 0]
          }
        },
        totalConfidence: {
          $sum: { $ifNull: ["$evaluation.confidence", 0] }
        },
        highRiskCount: {
          $sum: {
            $cond: [{ $gte: [{ $ifNull: ["$evaluation.overall_risk.score", 0] }, 75] }, 1, 0]
          }
        }
      }
    }
  ];

  const results = await Investigation.aggregate(pipeline as any[]);
  const data = results[0] || {};

  return {
    totalInvestigations: total,
    scamCount: data.scamCount || 0,
    legitimateCount: data.legitimateCount || 0,
    humanReviewCount: data.humanReviewCount || 0,
    averageConfidence: Math.round((data.totalConfidence || 0) / total),
    highRiskPercentage: Math.round(((data.highRiskCount || 0) / total) * 100)
  };
};

export const getScamTrends = async (days: number = 30): Promise<ScamTrend[]> => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const pipeline = [
    { $match: { createdAt: { $gte: startDate } } },
    { $unwind: "$evaluation.content_risk.signals" }, // Need to grab signals from where they live. They are in contentFindings usually, but evaluation is better. Wait, we should extract from agentTraces.
    // Let's use the actual schema location: contentFindings.riskSignals
    { $unwind: "$contentFindings.riskSignals" },
    {
      $group: {
        _id: "$contentFindings.riskSignals.name",
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ];

  const results = await Investigation.aggregate(pipeline as any[]);
  const totalSignals = results.reduce((acc, curr) => acc + curr.count, 0);

  return results.map(r => ({
    signalName: normalizeSignalName(r._id),
    count: r.count,
    percentage: totalSignals > 0 ? Math.round((r.count / totalSignals) * 100) : 0
  }));
};

export const getThreatSummary = async (limit: number = 5): Promise<ThreatSummary[]> => {
  const pipeline = [
    { $unwind: "$threatFindings.matches" },
    {
      $group: {
        _id: "$threatFindings.matches.threatName",
        matchedInvestigations: { $sum: 1 },
        totalSimilarity: { $sum: "$threatFindings.matches.similarity" }
      }
    },
    { $sort: { matchedInvestigations: -1 } },
    { $limit: limit }
  ];

  const results = await Investigation.aggregate(pipeline as any[]);

  return results.map(r => ({
    threatName: r._id,
    matchedInvestigations: r.matchedInvestigations,
    averageSimilarity: r.matchedInvestigations > 0 
      ? Math.round((r.totalSimilarity / r.matchedInvestigations) * 100) / 100 
      : 0
  }));
};

export const getPerformanceMetrics = async (): Promise<PerformanceMetrics> => {
  const pipeline = [
    {
      $group: {
        _id: null,
        avgTotalLatency: { $avg: "$totalLatencyMs" },
        // To get agent latencies, we need to extract from agentTraces array
        // We'll calculate an average for each specific agent name
      }
    }
  ];
  
  const results = await Investigation.aggregate(pipeline as any[]);
  const data = results[0] || {};
  
  // For agent latencies, we can do a separate aggregation unwinding the array
  const agentPipeline = [
    { $unwind: "$agentTraces" },
    {
      $group: {
        _id: "$agentTraces.agentName",
        avgLatency: { $avg: "$agentTraces.latencyMs" }
      }
    }
  ];
  
  const agentResults = await Investigation.aggregate(agentPipeline);
  
  const agentLatencies = {
    contentInvestigator: 0,
    recruiterInvestigator: 0,
    threatIntelligence: 0,
    finalDecision: 0
  };
  
  agentResults.forEach(r => {
    if (r._id === 'content_investigator') agentLatencies.contentInvestigator = Math.round(r.avgLatency);
    if (r._id === 'recruiter_investigator') agentLatencies.recruiterInvestigator = Math.round(r.avgLatency);
    if (r._id === 'threat_intelligence_agent' || r._id === 'threat_intelligence') agentLatencies.threatIntelligence = Math.round(r.avgLatency);
    if (r._id === 'final_decision_agent' || r._id === 'final_decision') agentLatencies.finalDecision = Math.round(r.avgLatency);
  });

  return {
    averageLatencyMs: Math.round(data.avgTotalLatency || 0),
    agentLatencies,
    totalTokensUsed: 0 // Placeholder, as we aren't reliably tracking tokens yet
  };
};
