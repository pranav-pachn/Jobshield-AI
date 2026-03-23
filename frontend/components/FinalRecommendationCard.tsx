"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Shield, X, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FinalRecommendationCardProps {
  riskLevel: "Low" | "Medium" | "High";
  riskScore: number;
  suspiciousPhrases?: string[];
  reasons?: string[];
  confidence?: number;
  className?: string;
}

export function FinalRecommendationCard({
  riskLevel,
  riskScore,
  suspiciousPhrases = [],
  reasons = [],
  confidence,
  className
}: FinalRecommendationCardProps) {
  const isHighRisk = riskLevel === "High";
  const isMediumRisk = riskLevel === "Medium";
  const isLowRisk = riskLevel === "Low";

  const getRecommendation = () => {
    if (isHighRisk) {
      return {
        title: "⚠ Avoid this job",
        description: "Multiple scam indicators detected",
        icon: AlertTriangle,
        iconColor: "text-destructive",
        bgColor: "bg-destructive/10",
        borderColor: "border-destructive/30",
        recommendation: "We strongly recommend avoiding this job opportunity. Multiple red flags indicate this is likely a scam.",
        action: "Report this job"
      };
    } else if (isMediumRisk) {
      return {
        title: "⚠ Proceed with caution",
        description: "Some suspicious patterns detected",
        icon: AlertCircle,
        iconColor: "text-yellow-600",
        bgColor: "bg-yellow-500/10",
        borderColor: "border-yellow-500/30",
        recommendation: "Exercise extreme caution if you choose to proceed. Verify all details independently before sharing personal information.",
        action: "Verify this job"
      };
    } else {
      return {
        title: "✅ Appears legitimate",
        description: "Low risk indicators detected",
        icon: CheckCircle,
        iconColor: "text-green-600",
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/30",
        recommendation: "This job posting appears to be legitimate. As always, practice standard job search safety measures.",
        action: "Proceed safely"
      };
    }
  };

  const recommendation = getRecommendation();
  const Icon = recommendation.icon;

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
      recommendation.bgColor,
      recommendation.borderColor,
      "border-2",
      className
    )}>
      {/* Gradient overlay for high risk */}
      {isHighRisk && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 pointer-events-none" />
      )}

      <CardHeader className="pb-4">
        <CardTitle className={cn(
          "flex items-center gap-3 text-xl font-bold",
          isHighRisk ? "text-destructive" : 
          isMediumRisk ? "text-yellow-600" : "text-green-600"
        )}>
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            isHighRisk ? "bg-destructive/20" : 
            isMediumRisk ? "bg-yellow-500/20" : "bg-green-500/20"
          )}>
            <Icon className={cn("h-6 w-6", recommendation.iconColor)} />
          </div>
          <div>
            <div className="text-lg">{recommendation.title}</div>
            <div className="text-sm font-normal text-muted-foreground">
              {recommendation.description}
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Risk Score Display */}
        <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card/50 p-4">
          <div className="space-y-1">
            <div className="text-sm font-medium text-muted-foreground">Risk Score</div>
            <div className="text-2xl font-bold">{riskScore}/100</div>
          </div>
          <div className="space-y-1 text-right">
            <div className="text-sm font-medium text-muted-foreground">Risk Level</div>
            <div className={cn(
              "text-lg font-bold uppercase tracking-wider",
              isHighRisk ? "text-destructive" : 
              isMediumRisk ? "text-yellow-600" : "text-green-600"
            )}>
              {riskLevel}
            </div>
          </div>
        </div>

        {/* Confidence Level */}
        {confidence !== undefined && (
          <div className="flex items-center gap-2 rounded-lg border border-border/30 bg-card/30 p-3">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              Analysis Confidence: <span className="font-semibold text-foreground">{Math.round(confidence * 100)}%</span>
            </span>
          </div>
        )}

        {/* Recommendation Text */}
        <div className="rounded-lg border border-border/30 bg-card/40 p-4">
          <h4 className="font-semibold text-foreground mb-2">Our Recommendation:</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {recommendation.recommendation}
          </p>
        </div>

        {/* Detected Indicators */}
        {(suspiciousPhrases.length > 0 || reasons.length > 0) && (
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Detected Indicators:</h4>
            
            {suspiciousPhrases.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Suspicious Phrases:</div>
                <div className="flex flex-wrap gap-2">
                  {suspiciousPhrases.map((phrase, index) => (
                    <span
                      key={index}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium border",
                        isHighRisk ? "bg-destructive/10 border-destructive/30 text-destructive" :
                        isMediumRisk ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-700" :
                        "bg-green-500/10 border-green-500/30 text-green-700"
                      )}
                    >
                      {phrase}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {reasons.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Risk Factors:</div>
                <ul className="space-y-1">
                  {reasons.slice(0, 5).map((reason, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <div className={cn(
                        "h-1.5 w-1.5 rounded-full mt-1.5 flex-shrink-0",
                        isHighRisk ? "bg-destructive" :
                        isMediumRisk ? "bg-yellow-500" : "bg-green-500"
                      )} />
                      <span>{reason}</span>
                    </li>
                  ))}
                  {reasons.length > 5 && (
                    <li className="text-xs text-muted-foreground italic">
                      ... and {reasons.length - 5} more indicators
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <button
            className={cn(
              "w-full rounded-lg px-4 py-3 font-semibold transition-all hover:shadow-md",
              isHighRisk ? "bg-destructive hover:bg-destructive/90 text-white" :
              isMediumRisk ? "bg-yellow-600 hover:bg-yellow-700 text-white" :
              "bg-green-600 hover:bg-green-700 text-white"
            )}
          >
            {recommendation.action}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
