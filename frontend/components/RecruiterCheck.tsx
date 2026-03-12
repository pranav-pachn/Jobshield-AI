type RecruiterCheckProps = {
  onVerify?: () => void;
  isLoading?: boolean;
};

export function RecruiterCheck({ onVerify, isLoading = false }: RecruiterCheckProps) {
  return (
    <section>
      <h2>Recruiter Verification</h2>
      <p>Verify an email address, phone number, or domain against known risk signals.</p>
      <button type="button" onClick={onVerify} disabled={isLoading}>
        {isLoading ? "Checking..." : "Check Recruiter"}
      </button>
    </section>
  );
}