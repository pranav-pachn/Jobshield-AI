"use client";

import { useEffect, useState } from "react";
import { Clock, AlertTriangle, TrendingUp, CheckCircle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskBadge } from "@/components/RiskBadge";
import Link from "next/link";
import { ThreatActivity } from "@/lib/dashboardTypes";

interface ThreatActivityFeedProps {
  maxItems?: number;
  onViewAll?: () => void;
}

/**
 * Threat Activity Feed Component
 * Displays recent threat detections in real-time
 * Items: #5 (Threat Activity Feed) from dashboard enhancement plan
 */
export function ThreatActivityFeed({ maxItems = 5, onViewAll }: ThreatActivityFeedProps) {
  const [activities, setActivities] = useState<ThreatActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const response = await fetch(`${apiUrl}/api/jobs/recent?limit=${maxItems}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const data = await response.json();
          // Extract recent analyses and convert to threat activity format
          const analyses = Array.isArray(data.analyses) ? data.analyses : data.analyses?.analyses || [];
          
          // Filter for high/medium risk and map to ThreatActivity format
          const activities: ThreatActivity[] = analyses
            .filter(a => a.risk_level === "High" || a.risk_level === "Medium")
            .map((a, index) => ({
              id: a._id?.toString() || `threat-${index}`,
              risk_level: a.risk_level,
              title: `${a.risk_level} risk job detected`,
              description: (a.job_text || a.suspicious_phrases?.join(", ") || "Suspicious job posting").substring(0, 100),
              timestamp: a.created_at || new Date().toISOString(),
              indicators: a.suspicious_phrases || a.indicators || [],
            }))
            .slice(0, maxItems);
          
          setActivities(activities);
          setError(null);
        } else if (response.status === 404) {
          setActivities([]);
          setError(null);
        } else {
          throw new Error(`Failed to fetch threat activity: ${response.statusText}`);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        console.error("Failed to fetch threat activities:", errorMessage);
        setError("Failed to load threat activity feed");
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [maxItems]);

  if (loading) {
    return (
      <Card className="glow-border glow-border-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
            Recent Threat Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glow-border">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card className="glow-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
            Recent Threat Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No recent threat detections. System is clean.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glow-border glow-border-hover">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
            Recent Threat Activity
          </div>
          <span className="text-xs font-normal text-muted-foreground">
            Live monitoring
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/50 hover:border-primary/30 hover:bg-card/70 transition-all duration-200"
          >
            {/* Risk Badge */}
            <div className="flex-shrink-0 pt-0.5">
              <RiskBadge level={activity.risk_level} size="sm" />
            </div>

            {/* Activity Description */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground mb-1">
                {activity.title}
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                {activity.description}
              </p>
              
              {/* Indicator Tags */}
              {activity.indicators && activity.indicators.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {activity.indicators.slice(0, 2).map((indicator, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/20 text-primary/80 border border-primary/30"
                    >
                      {indicator}
                    </span>
                  ))}
                  {activity.indicators.length > 2 && (
                    <span className="text-[10px] text-muted-foreground pt-1">
                      +{activity.indicators.length - 2} more
                    </span>
                  )}
                </div>
              )}

              {/* Timestamp */}
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {new Date(activity.timestamp).toLocaleString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* View All Link */}
        <Link
          href="/threat-intelligence"
          className="inline-flex items-center gap-1 mt-4 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          View all threats <ArrowRight className="h-3 w-3" />
        </Link>
      </CardContent>
    </Card>
  );
}
