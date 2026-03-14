import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Clock } from "lucide-react";

interface AnalysisResult {
  scam_probability: number;
  risk_level: "High" | "Medium" | "Low";
  reasons: string[];
  suspicious_phrases: string[];
  ai_latency_ms: number;
}

interface RiskResultCardProps {
  result: AnalysisResult;
}

export function RiskResultCard({ result }: RiskResultCardProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "High":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "Medium":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "Low":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "High":
        return <AlertTriangle className="h-4 w-4" />;
      case "Medium":
        return <AlertTriangle className="h-4 w-4" />;
      case "Low":
        return <Shield className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getProgressBarColor = (level: string) => {
    switch (level) {
      case "High":
        return "bg-gradient-to-r from-red-500 to-red-600";
      case "Medium":
        return "bg-gradient-to-r from-yellow-500 to-yellow-600";
      case "Low":
        return "bg-gradient-to-r from-green-500 to-green-600";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600";
    }
  };

  const scamPercentage = Math.round(result.scam_probability * 100);

  return (
    <Card className="border-gray-700 bg-gray-800 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-gray-100">
          <span>Analysis Results</span>
          <Badge 
            className={`flex items-center gap-2 ${getRiskColor(result.risk_level)}`}
            variant="outline"
          >
            {getRiskIcon(result.risk_level)}
            {result.risk_level} Risk
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Risk Score Display */}
        <div className="rounded-lg border border-gray-600 bg-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Scam Probability</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-100">{scamPercentage}%</span>
                <span className="text-sm text-gray-400">confidence</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="h-4 w-4" />
                <span>{result.ai_latency_ms}ms</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">AI latency</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-600">
              <div 
                className={`h-full rounded-full transition-all duration-500 ease-out ${getProgressBarColor(result.risk_level)}`}
                style={{ width: `${scamPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Detection Reasons */}
        <div>
          <h3 className="text-lg font-semibold text-gray-100 mb-3">Detection Reasons</h3>
          <div className="space-y-2">
            {result.reasons.map((reason, index) => (
              <div 
                key={index}
                className="rounded-lg border border-gray-600 bg-gray-700/30 px-4 py-3"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                  </div>
                  <p className="text-sm text-gray-300">{reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suspicious Phrases */}
        {result.suspicious_phrases.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-100 mb-3">Suspicious Phrases Detected</h3>
            <div className="flex flex-wrap gap-2">
              {result.suspicious_phrases.map((phrase, index) => (
                <Badge 
                  key={index}
                  variant="secondary"
                  className="bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30"
                >
                  {phrase}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
