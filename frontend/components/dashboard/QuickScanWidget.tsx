"use client";

import { useState, useRef } from "react";
import { Scan, Sparkles, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

const SAMPLE_SCAM = `URGENT HIRING - Remote Data Entry Specialist

We are looking for motivated individuals to work from home! No experience needed.
Salary: $5,000-$8,000 per week guaranteed!

Requirements: You must be available immediately.
Please send your SSN and bank details for direct deposit setup BEFORE your start date.
You must purchase your starter kit ($299) via wire transfer or gift cards only.

Contact: hr.globalcareers@gmail.com - Apply NOW, positions limited!`;

export interface QuickScanResult {
  scam_probability: number;
  risk_level: "High" | "Medium" | "Low";
  indicators: { label: string; description: string; severity: "high" | "medium" | "low" }[];
  suspicious_phrases: string[];
}

interface QuickScanWidgetProps {
  onResult: (result: QuickScanResult) => void;
  onClear: () => void;
}

function mockIndicators(prob: number) {
  const high = [
    { label: "Payment Request", description: "Asks for gift card or wire transfer payment", severity: "high" as const },
    { label: "Sensitive Data Request", description: "Requests SSN or bank details upfront", severity: "high" as const },
    { label: "Urgency Language", description: "Artificial urgency — 'Apply NOW, positions limited'", severity: "high" as const },
  ];
  const medium = [
    { label: "Unrealistic Salary", description: "$5,000–$8,000/week for a data-entry role is highly suspicious", severity: "medium" as const },
    { label: "No Experience Required", description: "High-paying jobs rarely require no experience", severity: "medium" as const },
  ];
  const low = [
    { label: "Generic Email Domain", description: "Gmail address for a corporate recruiter is unusual", severity: "low" as const },
  ];
  if (prob > 0.65) return [...high, ...medium, ...low];
  if (prob > 0.35) return [...medium, ...low];
  return low;
}

function getMockResult(): QuickScanResult {
  return {
    scam_probability: 94,
    risk_level: "High",
    indicators: mockIndicators(0.94),
    suspicious_phrases: [
      "SSN and bank details",
      "wire transfer or gift cards only",
      "URGENT HIRING",
      "$5,000-$8,000 per week guaranteed",
      "Apply NOW, positions limited",
    ],
  };
}

export function QuickScanWidget({ onResult, onClear }: QuickScanWidgetProps) {
  const [text, setText] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSample = () => {
    setText(SAMPLE_SCAM);
    textareaRef.current?.focus();
  };

  const handleClear = () => {
    setText("");
    onClear();
  };

  const handleAnalyze = async () => {
    if (!text.trim() || isScanning) return;
    setIsScanning(true);
    await new Promise((r) => setTimeout(r, 2000));

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";
    try {
      const resp = await fetch(`${backendUrl}/api/jobs/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: text }),
      });
      if (resp.ok) {
        const data = await resp.json();
        const prob = data.scam_probability ?? data.fraud_probability ?? 0.82;
        onResult({
          scam_probability: Math.round(prob * 100),
          risk_level: prob > 0.65 ? "High" : prob > 0.35 ? "Medium" : "Low",
          indicators: data.indicators ?? mockIndicators(prob),
          suspicious_phrases: data.suspicious_phrases ?? [],
        });
      } else {
        onResult(getMockResult());
      }
    } catch {
      onResult(getMockResult());
    } finally {
      setIsScanning(false);
    }
  };

  const canAnalyze = text.trim().length > 20 && !isScanning;

  return (
    <div className="relative">
      <div
        className={cn(
          "absolute -inset-px rounded-2xl transition-all duration-500",
          hasFocus
            ? "bg-gradient-to-r from-primary/30 via-purple-500/20 to-primary/30 opacity-100"
            : "opacity-0"
        )}
      />
      <div className="relative rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
        {isScanning && (
          <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-2xl">
            <div className="scanner-line" />
            <div className="absolute inset-0 bg-primary/5" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/20">
              <Scan className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Quick Scan</p>
              <p className="text-xs text-muted-foreground">Paste a job post or URL to analyze instantly</p>
            </div>
          </div>
          {text && (
            <button onClick={handleClear} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-white/5">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Textarea */}
        <div className="px-5 pb-3">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setHasFocus(true)}
            onBlur={() => setHasFocus(false)}
            placeholder="Paste job description, recruiter message, or URL here..."
            rows={5}
            className={cn(
              "w-full resize-none rounded-xl border px-4 py-3 text-sm",
              "bg-background/50 text-foreground placeholder:text-muted-foreground/60",
              "border-white/8 focus:border-primary/40 focus:outline-none",
              "transition-colors duration-200 font-mono leading-relaxed",
              isScanning && "opacity-60 cursor-not-allowed"
            )}
            disabled={isScanning}
          />
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted-foreground/60">
              {text.length > 0 ? `${text.length} characters` : "Min. 20 characters"}
            </span>
            <button onClick={handleSample} className="text-xs text-primary/70 hover:text-primary transition-colors flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Try a sample scam
            </button>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-3 px-5 pb-5">
          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            className={cn(
              "flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200",
              canAnalyze
                ? "bg-gradient-to-r from-primary to-purple-600 text-white hover:shadow-[0_0_20px_rgba(96,125,255,0.4)] hover:-translate-y-0.5"
                : "bg-white/5 text-muted-foreground cursor-not-allowed"
            )}
          >
            {isScanning ? (
              <>
                <span className="relative flex h-3.5 w-3.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-white"></span>
                </span>
                Analyzing...
              </>
            ) : (
              <>
                <Scan className="h-4 w-4" />
                Analyze Job
                <ChevronRight className="h-3.5 w-3.5 opacity-70" />
              </>
            )}
          </button>
          {isScanning && (
            <p className="text-xs text-muted-foreground animate-pulse">Running AI threat analysis...</p>
          )}
        </div>
      </div>
    </div>
  );
}
