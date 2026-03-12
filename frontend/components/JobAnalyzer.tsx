type JobAnalyzerProps = {
  onAnalyze?: () => void;
  isLoading?: boolean;
};

export function JobAnalyzer({ onAnalyze, isLoading = false }: JobAnalyzerProps) {
  return (
    <section>
      <h2>Job Scam Analyzer</h2>
      <p>Paste a job description or recruiter message to evaluate scam indicators.</p>
      <button type="button" onClick={onAnalyze} disabled={isLoading}>
        {isLoading ? "Analyzing..." : "Analyze Job Offer"}
      </button>
    </section>
  );
}