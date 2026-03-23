"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, Brain, Search, Globe, FileText, Network, Shield, CheckCircle, AlertCircle, Clock } from "lucide-react";

interface StepProgress {
  step: number;
  name: string;
  status: 'running' | 'completed' | 'error';
  progress: number;
  details: Record<string, unknown>;
  estimated_time_remaining: number;
}

interface AIThinkingStepsProps {
  isActive: boolean;
  onComplete?: (analysis: Record<string, unknown>) => void;
  onError?: (error: string) => void;
}

const STEP_ICONS = [
  Search,      // Extracting entities
  Brain,       // Detecting scam indicators
  FileText,    // Analyzing language patterns
  Globe,       // Checking domain intelligence
  Shield,      // Matching scam templates
  Network,     // Building network relationships
  CheckCircle  // Generating investigation report
];

const STEP_COLORS = {
  running: "text-blue-500",
  completed: "text-green-500",
  error: "text-red-500"
};

export function AIThinkingSteps({ isActive, onComplete, onError }: AIThinkingStepsProps) {
  const [steps, setSteps] = useState<StepProgress[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    let cancelled = false;

    const runAnalysisAndSimulate = async () => {
      try {
        // Get job text from the page - this is a temporary solution
        const jobTextElement = document.querySelector('textarea') as HTMLTextAreaElement;
        const text = jobTextElement?.value || '';
        
        if (!text.trim()) {
          onError?.('Please enter job text to analyze');
          return;
        }

        const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

        const DEMO_STEPS = [
          "Extracting entities (job, email, domain)",
          "Detecting scam indicators",
          "Analyzing language patterns",
          "Checking domain intelligence",
          "Matching scam templates",
          "Building network relationships",
          "Generating investigation report"
        ];

        let analysisResult: Record<string, unknown> | null = null;
        let apiErrorMessage: string | null = null;
        
        // 1. Kick off real API call
        const apiPromise = fetch(`${backendBaseUrl}/api/jobs/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        }).then(async (res) => {
          if (!res.ok) throw new Error(`Backend request failed: ${res.status}`);
          const payload = await res.json();
          analysisResult = payload.analysis ?? payload;
        }).catch((err) => {
          console.error("Analysis API Error:", err);
          apiErrorMessage = err instanceof Error ? err.message : String(err);
        });

        // 2. Run through simulated steps sequentially
        setSteps([]);
        setCurrentStep(1);

        for (let i = 0; i < DEMO_STEPS.length; i++) {
          if (cancelled) return;

          const stepNum = i + 1;
          setCurrentStep(stepNum);
          
          // Mark previous step as completed if exists
          setSteps(prev => {
            const newSteps = [...prev];
            if (i > 0 && newSteps[i - 1]) {
              newSteps[i - 1].status = "completed";
              newSteps[i - 1].progress = 100;
            }
            // Add new step
            newSteps.push({
              step: stepNum,
              name: DEMO_STEPS[i],
              status: "running",
              progress: 0,
              details: {},
              estimated_time_remaining: (DEMO_STEPS.length - i) * 800,
            });
            return newSteps;
          });

          // Simulate progress bar jumping
          for (let p = 15; p <= 90; p += Math.floor(Math.random() * 20) + 15) {
            if (cancelled) return;
            await new Promise(r => setTimeout(r, 150 + Math.random() * 150));
            setSteps(prev => {
              const newSteps = [...prev];
              if (newSteps[i]) {
                newSteps[i].progress = Math.min(p, 99);
              }
              return newSteps;
            });
          }

          // Small pause at the end of the step
          if (cancelled) return;
          await new Promise(r => setTimeout(r, 150 + Math.random() * 200));
        }

        // 3. Wait for API to finish if it hasn't already
        await apiPromise;
        if (cancelled) return;

        if (apiErrorMessage) {
          setSteps(prev => {
            const newSteps = [...prev];
            if (newSteps.length > 0) {
              newSteps[newSteps.length - 1].status = "error";
            }
            return newSteps;
          });
          onError?.(apiErrorMessage || 'Connection to AI analysis service failed');
          return;
        }

        // Complete final step
        setSteps(prev => {
          const newSteps = [...prev];
          if (newSteps.length > 0) {
            newSteps[newSteps.length - 1].status = "completed";
            newSteps[newSteps.length - 1].progress = 100;
          }
          return newSteps;
        });

        // Small success pause before transitioning
        await new Promise(r => setTimeout(r, 400));
        
        if (!cancelled && analysisResult) {
          onComplete?.(analysisResult);
        }

      } catch (err) {
        console.error("Simulation error:", err);
        if (!cancelled) {
          onError?.('An unexpected error occurred during analysis');
        }
      }
    };

    void runAnalysisAndSimulate();

    return () => {
      cancelled = true;
    };
  }, [isActive, onComplete, onError]);

  // Update total time
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setTotalTime(prev => prev + 1);
      }, 1000);
      
      const intervalRef = { current: interval };
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isActive]);

  if (!isActive) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatEstimatedTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return `~${seconds}s remaining`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      running: "default",
      completed: "default", 
      error: "destructive"
    } as const;

    const labels = {
      running: "Processing",
      completed: "Complete",
      error: "Error"
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]} className="text-xs">
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-card/60 to-card/40 shadow-2xl">
      <CardHeader className="border-b border-white/10 pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <Brain className="h-5 w-5 text-primary animate-pulse" />
          AI Analysis in Progress
          <Badge variant="outline" className="ml-auto">
            {formatTime(totalTime)}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-6">
        {/* Current Step Highlight */}
        {steps.length > 0 && (
          <div className="rounded-xl border border-white/10 bg-black/30 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {(() => {
                  const CurrentIcon = STEP_ICONS[currentStep - 1] || Brain;
                  return <CurrentIcon className={`h-5 w-5 ${STEP_COLORS.running}`} />;
                })()}
                <div>
                  <h3 className="font-semibold text-white">
                    {steps[currentStep - 1]?.name || "Initializing..."}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {steps[currentStep - 1]?.estimated_time_remaining > 0 && 
                      formatEstimatedTime(steps[currentStep - 1].estimated_time_remaining)
                    }
                  </p>
                </div>
              </div>
              {getStatusBadge(steps[currentStep - 1]?.status || 'running')}
            </div>
            
            <Progress 
              value={steps[currentStep - 1]?.progress || 0} 
              className="h-2 bg-white/10"
            />
          </div>
        )}

        {/* All Steps List */}
        <div className="space-y-3">
          {steps.map((step) => {
            const StepIcon = STEP_ICONS[step.step - 1] || Brain;
            const isCurrentStep = step.step === currentStep;
            
            return (
              <div 
                key={step.step}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  isCurrentStep 
                    ? 'bg-primary/10 border border-primary/30' 
                    : 'bg-black/20 border border-white/5'
                }`}
              >
                <div className={`${STEP_COLORS[step.status]}`}>
                  {getStatusIcon(step.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <StepIcon className="h-4 w-4 text-muted-foreground" />
                      <span className={`text-sm font-medium ${
                        isCurrentStep ? 'text-white' : 'text-muted-foreground'
                      }`}>
                        {step.name}
                      </span>
                    </div>
                    {getStatusBadge(step.status)}
                  </div>
                  
                  {isCurrentStep && step.progress > 0 && (
                    <Progress value={step.progress} className="h-1 bg-white/10" />
                  )}
                  
                  {/* Step Details */}
                  {step.details && (
                    <div className="mt-2 text-xs text-muted-foreground space-y-1">
                      {Object.entries(step.details).map(([key, value]) => {
                        // Skip nested objects for cleaner display
                        if (typeof value === 'object' && value !== null) {
                          return null;
                        }
                        
                        return (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">
                              {key.replace(/_/g, ' ')}:
                            </span>
                            <span className="text-white/70">
                              {typeof value === 'number' ? value : String(value)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Processing Summary */}
        {steps.length > 0 && (
          <div className="rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 p-3 border border-primary/20">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Processing {steps.filter(s => s.status === 'running').length} active step{steps.filter(s => s.status === 'running').length !== 1 ? 's' : ''}
              </span>
              <span className="text-primary">
                {steps.filter(s => s.status === 'completed').length} of {steps.length} complete
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
