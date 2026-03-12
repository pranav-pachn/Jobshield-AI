type ThreatDashboardProps = {
  highRiskCount?: number;
  mediumRiskCount?: number;
  lowRiskCount?: number;
};

export function ThreatDashboard({
  highRiskCount = 0,
  mediumRiskCount = 0,
  lowRiskCount = 0,
}: ThreatDashboardProps) {
  return (
    <section>
      <h2>Threat Dashboard</h2>
      <ul>
        <li>High Risk: {highRiskCount}</li>
        <li>Medium Risk: {mediumRiskCount}</li>
        <li>Low Risk: {lowRiskCount}</li>
      </ul>
    </section>
  );
}