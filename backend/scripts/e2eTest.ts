import { orchestrateAnalysis } from "../src/services/analysisOrchestrator";
import mongoose from "mongoose";
import { connectDatabase } from "../src/config/database";

const testCases = [
  {
    name: "Test A — Obvious Scam",
    text: `Remote Data Entry Job

No experience required.
Earn ₹70,000 per month.

To activate your employee account,
you must pay a ₹2,999 registration fee.`,
    recruiterEmail: "scammer@protonmail.com"
  },
  {
    name: "Test B — Legitimate Job",
    text: `Software Engineer

We are hiring a backend engineer to build
REST APIs using Node.js and PostgreSQL.

12 LPA salary.
No registration fee.
No payment required.`,
    recruiterEmail: "recruiter@google.com",
    jobUrl: "https://careers.google.com/jobs/results/12345"
  }
];

async function runVerification() {
  console.log("Connecting to database...");
  await connectDatabase();
  console.log("Connected.");

  for (const c of testCases) {
    console.log(`\n========================================`);
    console.log(`Running Case: ${c.name}`);
    console.log(`========================================`);
    
    try {
      const result = await orchestrateAnalysis(c.text, c.recruiterEmail, c.jobUrl, "e2e-verification-user");
      
      console.log(`\n--- Risk Assessment ---`);
      console.log(`Verdict: ${result.analysis.riskLevel}`);
      console.log(`Score:   ${result.analysis.riskScore}`);
      console.log(`Signals: ${result.explainability?.riskBreakdown?.map(r => r.factor).join(", ")}`);
      
      console.log(`\n--- RAG & Investigation Trace ---`);
      if (result.explainability?.timeline) {
        const searchSteps = result.explainability.timeline.filter(t => t.tool.includes("search_threat_knowledge") || t.tool.includes("find_similar_cases"));
        
        console.log(`Tool Calls to Knowledge Base: ${searchSteps.length}`);
        searchSteps.forEach(step => {
          console.log(`  - Tool: ${step.tool}`);
          console.log(`  - Status: ${step.status}`);
          console.log(`  - Details: ${step.details}`);
        });
      }

      console.log(`\n--- RAG Invariant Check (Retrieved Evidence) ---`);
      const evidence = result.explainability?.evidence || [];
      console.log(`Found ${evidence.length} evidence items.`);
      evidence.forEach((e, idx) => {
        console.log(`  [${idx + 1}] Source: ${e.sourceType}`);
        console.log(`      ID: ${e.id}`);
        console.log(`      Summary: ${e.summary}`);
      });

      console.log(`\n--- Campaign / Recruiter Linkage ---`);
      if (result.network && result.network.length > 0) {
        console.log(`Found ${result.network.length} related network nodes.`);
      } else {
        console.log(`No active network correlations returned for this trace.`);
      }
      
    } catch (error) {
      console.error(`Error executing ${c.name}:`, error);
    }
  }

  await mongoose.disconnect();
  console.log("\nVerification complete.");
}

runVerification().catch(console.error);
