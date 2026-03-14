import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, AlertTriangle, Shield, FileText } from "lucide-react";

interface RecentAnalysis {
  id: string;
  timestamp: string;
  risk_level: "High" | "Medium" | "Low";
  scam_probability: number;
  job_text?: string;
  suspicious_phrases?: string[];
}

interface RecentAnalysesTableProps {
  analyses: RecentAnalysis[];
}

export function RecentAnalysesTable({ analyses }: RecentAnalysesTableProps) {
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
        return <AlertTriangle className="h-3 w-3" />;
      case "Medium":
        return <AlertTriangle className="h-3 w-3" />;
      case "Low":
        return <Shield className="h-3 w-3" />;
      default:
        return <Shield className="h-3 w-3" />;
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (!analyses || analyses.length === 0) {
    return (
      <Card className="border-gray-700 bg-gray-800 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-100">
            <Clock className="h-5 w-5" />
            Recent Analyses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <p className="text-gray-400">No recent analyses available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-700 bg-gray-800 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-100">
          <Clock className="h-5 w-5" />
          Recent Analyses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-gray-600 bg-gray-700/30 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-600">
                <TableHead className="text-gray-300 font-medium">Timestamp</TableHead>
                <TableHead className="text-gray-300 font-medium">Risk Level</TableHead>
                <TableHead className="text-gray-300 font-medium">Probability</TableHead>
                <TableHead className="text-gray-300 font-medium">Job Text</TableHead>
                <TableHead className="text-gray-300 font-medium">Suspicious Phrases</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analyses.map((analysis) => (
                <TableRow key={analysis.id} className="border-gray-600 hover:bg-gray-700/50">
                  <TableCell className="text-gray-300 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-gray-400" />
                      {formatDate(analysis.timestamp)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={`flex items-center gap-1 w-fit ${getRiskColor(analysis.risk_level)}`}
                      variant="outline"
                    >
                      {getRiskIcon(analysis.risk_level)}
                      {analysis.risk_level}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {Math.round(analysis.scam_probability * 100)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300 text-sm max-w-xs">
                    <div className="flex items-start gap-2">
                      <FileText className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">
                        {analysis.job_text ? truncateText(analysis.job_text) : "Text not available"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300 text-sm">
                    {(analysis.suspicious_phrases?.length ?? 0) > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {(analysis.suspicious_phrases ?? []).slice(0, 2).map((phrase, index) => (
                          <Badge 
                            key={index}
                            variant="secondary"
                            className="text-xs bg-red-500/20 text-red-300 border-red-500/30"
                          >
                            {phrase}
                          </Badge>
                        ))}
                        {(analysis.suspicious_phrases?.length ?? 0) > 2 && (
                          <Badge 
                            variant="secondary"
                            className="text-xs bg-gray-500/20 text-gray-300 border-gray-500/30"
                          >
                            +{(analysis.suspicious_phrases?.length ?? 0) - 2}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-xs">None detected</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {analyses.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              Showing {analyses.length} most recent analyses
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
