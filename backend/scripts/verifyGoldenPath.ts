import axios from 'axios';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const BASE_URL = 'http://localhost:5000';
let token = '';
let investigationId = '';

async function runGoldenPath() {
  console.log("=========================================");
  console.log("   JOBSHIELD GOLDEN PATH AUDIT START     ");
  console.log("=========================================\n");

  try {
    // 1. LOGIN
    console.log("[1] Testing LOGIN (/api/auth/login)...");
    const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: "test_analyst_3@jobshield.ai",
      password: "password123"
    });
    token = loginRes.data.token;
    console.log("✅ Login successful. Token received.\n");

    const headers = { Authorization: `Bearer ${token}` };

    // 2. DASHBOARD
    console.log("[2] Testing DASHBOARD ENDPOINTS...");
    await axios.get(`${BASE_URL}/api/jobs/stats`, { headers });
    await axios.get(`${BASE_URL}/api/analytics/risk-distribution`, { headers });
    await axios.get(`${BASE_URL}/api/analytics/trends`, { headers });
    await axios.get(`${BASE_URL}/api/analytics/top-indicators`, { headers });
    await axios.get(`${BASE_URL}/api/jobs/recent`, { headers });
    console.log("✅ All dashboard analytics endpoints returned 200 OK.\n");

    // 3. NEW INVESTIGATION (SCAM Test)
    console.log("[3] Testing NEW INVESTIGATION (SCAM) (/api/investigations)...");
    const scamRes = await axios.post(`${BASE_URL}/api/investigations`, {
      jobText: "Work from home! Make $5000 a day. Just pay a small registration fee via crypto.",
      recruiterName: "Scammer John",
      email: "john@freemoney.com",
    }, { headers });
    
    investigationId = scamRes.data.investigationId || scamRes.data._id;
    console.log(`✅ Investigation complete. ID: ${investigationId}`);
    console.log(`   Verdict: ${scamRes.data.risk_level || 'Unknown'} (Probability: ${scamRes.data.scam_probability})\n`);

    // 4. VERDICT & EXPLAINABILITY
    console.log("[4] Testing VERDICT & EXPLAINABILITY (/api/investigations/:id)...");
    const getInvRes = await axios.get(`${BASE_URL}/api/investigations/${investigationId}`, { headers });
    console.log(`✅ Investigation detail retrieved.`);
    console.log(`   Schema version: ${getInvRes.data.schemaVersion}`);
    console.log(`   Label: ${getInvRes.data.verdict?.label}\n`);

    // 5. THREAT INTELLIGENCE
    console.log("[5] Testing THREAT INTELLIGENCE (/api/intelligence/overview)...");
    await axios.get(`${BASE_URL}/api/intelligence/overview`, { headers });
    console.log("✅ Threat intelligence overview returned 200 OK.\n");

    // 6. REPORT
    console.log("[6] Testing REPORT GENERATION (/api/reports/investigation/:id)...");
    const reportRes = await axios.get(`${BASE_URL}/api/reports/investigation/${investigationId}`, { headers });
    console.log("✅ Report generated successfully.\n");

    // 7. FEEDBACK
    console.log("[7] Testing FEEDBACK SUBMISSION (/api/investigations/:id/feedback)...");
    const feedbackRes = await axios.post(`${BASE_URL}/api/investigations/${investigationId}/feedback`, {
      verdict: "INCORRECT",
      feedbackType: "FALSE_POSITIVE",
      comment: "Automated test checking feedback loop."
    }, { headers });
    console.log(`✅ Feedback submitted. ID: ${feedbackRes.data._id}\n`);

    // 8. LEARNING
    console.log("[8] Testing LEARNING PENDING VIEW (/api/learning/feedback/pending)...");
    const pendingRes = await axios.get(`${BASE_URL}/api/learning/feedback/pending`, { headers });
    const hasPending = pendingRes.data.some((f: any) => f.investigationId === investigationId);
    console.log(`✅ Pending feedback loaded. Found our test feedback: ${hasPending}\n`);

    // 9. NEW INVESTIGATION (SAFE Test)
    console.log("[9] Testing NEW INVESTIGATION (SAFE)...");
    const safeRes = await axios.post(`${BASE_URL}/api/investigations`, {
      jobText: "We are looking for a Senior Software Engineer with 5+ years of experience in TypeScript and React. Competitive salary and benefits package.",
      company: "Legit Tech Inc",
    }, { headers });
    console.log(`✅ SAFE Investigation complete. Verdict: ${safeRes.data.risk_level}\n`);

    console.log("=========================================");
    console.log("✅ GOLDEN PATH AUDIT COMPLETED SUCCESSFULLY ");
    console.log("=========================================\n");

  } catch (error: any) {
    console.error("❌ GOLDEN PATH AUDIT FAILED!");
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error("Response data:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

runGoldenPath();
