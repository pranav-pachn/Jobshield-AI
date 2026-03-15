"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

export interface ProgressStepsProps {
  steps: string[];
  currentStep?: number;
}

export function ProgressSteps({ steps, currentStep = 0 }: ProgressStepsProps) {
  const [animatedStep, setAnimatedStep] = useState(0);

  useEffect(() => {
    if (currentStep >= steps.length) return;

    const timer = setTimeout(() => {
      setAnimatedStep(Math.min(currentStep + 1, steps.length));
    }, 600);

    return () => clearTimeout(timer);
  }, [currentStep, steps.length]);

  return (
    <div className="space-y-3 w-full max-w-sm">
      {steps.map((step, index) => {
        const isComplete = index < animatedStep;
        const isActive = index === animatedStep - 1;

        return (
          <div
            key={index}
            className={`flex items-center gap-3 transition-all duration-500 ${
              isActive || isComplete ? "opacity-100 scale-100" : "opacity-60 scale-95"
            }`}
          >
            {/* Step indicator */}
            <div
              className={`relative flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-mono text-sm font-bold transition-all duration-500 ${
                isComplete
                  ? "bg-green-500/20 border-green-500 text-green-400"
                  : isActive
                  ? "bg-primary/20 border-primary text-primary animate-pulse"
                  : "bg-white/5 border-white/20 text-muted-foreground"
              }`}
            >
              {isComplete ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>

            {/* Step label */}
            <div className="flex-1">
              <p
                className={`text-sm font-medium transition-colors duration-500 ${
                  isActive
                    ? "text-primary font-semibold"
                    : isComplete
                    ? "text-green-400"
                    : "text-muted-foreground"
                }`}
              >
                {step}
              </p>

              {/* Animated loading bar for active step */}
              {isActive && (
                <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-primary/40 rounded-full animate-[width_1s_ease-in-out_infinite] origin-left" />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
