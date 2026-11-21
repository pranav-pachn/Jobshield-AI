/**
 * JobShield AI - Deterministic Demo Scenarios
 * 
 * Strict isolation: These scenarios are pre-computed in memory.
 * They never touch MongoDB, Python AI service, HuggingFace inference, or Atlas Vector Search.
 */

export interface DemoScenarioSummary {
  id: string;
  title: string;
  category: "SCAM" | "SAFE" | "HUMAN_REVIEW";
  description: string;
  input: {
    jobText: string;
    company?: string;
    companyDomain?: string;
    recruiterName?: string;
    email?: string;
    emailDomain?: string;
    jobTitle?: string;
    salary?: string;
    sourcePlatform?: string;
    inputType?: "description" | "message" | "url" | "company" | "recruiter";
  };
}

export interface DemoScenarioRecord extends DemoScenarioSummary {
  trace: any;
}

export const DEMO_SCENARIOS: Record<string, DemoScenarioRecord> = {
  "demo-scam-equipment-check": {
    id: "demo-scam-equipment-check",
    title: "Remote Data Entry — Equipment Check Scam",
    category: "SCAM",
    description: "Classic advance-fee scam requesting the candidate to cash an upfront equipment check and wire funds to a third-party vendor.",
    input: {
      jobTitle: "Remote Data Entry Specialist",
      company: "Apex Global Logistics",
      companyDomain: "apex-global-logistics-careers.com",
      recruiterName: "Sarah Jenkins",
      email: "sarah.jenkins.hr@gmail.com",
      emailDomain: "gmail.com",
      salary: "$45.00/hour",
      sourcePlatform: "Telegram / Direct Email",
      inputType: "message",
      jobText: "Congratulations! You have been selected for the Remote Data Entry Specialist role at Apex Global Logistics. Salary is $45/hr with flexible hours. An initial check of $3,500 will be mailed to you immediately to purchase home office equipment (MacBook Pro & specialized scanner) from our certified vendor via Zelle or wire transfer. Please confirm your mailing address and bank name to proceed.",
    },
    trace: {
      investigationId: "demo-scam-equipment-check",
      executionMode: "DEMO",
      isSimulated: true,
      state: "COMPLETED",
      input: {
        jobTitle: "Remote Data Entry Specialist",
        company: "Apex Global Logistics",
        companyDomain: "apex-global-logistics-careers.com",
        recruiterName: "Sarah Jenkins",
        email: "sarah.jenkins.hr@gmail.com",
        emailDomain: "gmail.com",
        salary: "$45.00/hour",
        sourcePlatform: "Telegram / Direct Email",
        inputType: "message",
        jobText: "Congratulations! You have been selected for the Remote Data Entry Specialist role at Apex Global Logistics. Salary is $45/hr with flexible hours. An initial check of $3,500 will be mailed to you immediately to purchase home office equipment (MacBook Pro & specialized scanner) from our certified vendor via Zelle or wire transfer. Please confirm your mailing address and bank name to proceed.",
      },
      agentTraces: [
        {
          agentName: "content_investigator",
          startedAt: new Date(Date.now() - 1400),
          completedAt: new Date(Date.now() - 1100),
          latencyMs: 300,
          provider: "demo",
          model: "synthetic-v1",
          status: "success",
          output: {
            riskSignals: [
              { signal: "Fake check / advance fee equipment scam pattern", severity: "critical", confidence: 0.98, evidence: "Mailed check with request to pay vendor via Zelle/wire" },
              { signal: "Unrealistically high hourly wage for unskilled entry level", severity: "high", confidence: 0.92, evidence: "$45/hr for data entry" },
              { signal: "Immediate job offer without interview or technical evaluation", severity: "high", confidence: 0.94, evidence: "Selected immediately upon first message" }
            ],
            riskScore: 92,
            confidence: 0.95
          }
        },
        {
          agentName: "recruiter_investigator",
          startedAt: new Date(Date.now() - 1100),
          completedAt: new Date(Date.now() - 850),
          latencyMs: 250,
          provider: "demo",
          model: "synthetic-v1",
          status: "success",
          output: {
            identitySignals: [
              { signal: "Free public email provider used for purported corporate HR", severity: "high", confidence: 0.95, evidence: "sarah.jenkins.hr@gmail.com used instead of corporate domain" },
              { signal: "Lookalike / newly registered domain", severity: "high", confidence: 0.90, evidence: "apex-global-logistics-careers.com registered 4 days ago" }
            ],
            consistencyScore: 12,
            status: "success"
          }
        },
        {
          agentName: "threat_intelligence",
          startedAt: new Date(Date.now() - 850),
          completedAt: new Date(Date.now() - 600),
          latencyMs: 250,
          provider: "demo",
          model: "synthetic-v1",
          status: "success",
          output: {
            matches: [
              { sourceId: "IOC-CHECK-SCAM-091", similarity: 0.94, evidenceQuality: "High", relevance: "high", agentConfidence: 0.96, evidence: "Known overpayment/check routing syndicate targeting remote workers" }
            ],
            confidence: 0.94,
            status: "success"
          }
        },
        {
          agentName: "evidence_aggregator",
          startedAt: new Date(Date.now() - 600),
          completedAt: new Date(Date.now() - 350),
          latencyMs: 250,
          provider: "demo",
          model: "synthetic-v1",
          status: "success",
          output: {
            supportingSignals: 5,
            contradictions: 0,
            contradictionDetails: [],
            missingEvidence: []
          }
        },
        {
          agentName: "final_decision",
          startedAt: new Date(Date.now() - 350),
          completedAt: new Date(Date.now() - 50),
          latencyMs: 300,
          provider: "demo",
          model: "synthetic-v1",
          status: "success",
          output: {
            verdict: "CRITICAL",
            riskScore: 92,
            confidence: 0.95
          }
        }
      ],
      contentFindings: {
        agent: "content_investigator",
        riskSignals: [
          { signal: "Fake check / advance fee equipment scam pattern", severity: "critical", confidence: 0.98, evidence: "Mailed check with request to pay vendor via Zelle/wire" },
          { signal: "Unrealistically high hourly wage for unskilled entry level", severity: "high", confidence: 0.92, evidence: "$45/hr for data entry" },
          { signal: "Immediate job offer without interview or technical evaluation", severity: "high", confidence: 0.94, evidence: "Selected immediately upon first message" }
        ],
        riskScore: 92,
        confidence: 0.95
      },
      recruiterFindings: {
        agent: "recruiter_investigator",
        identitySignals: [
          { signal: "Free public email provider used for purported corporate HR", severity: "high", confidence: 0.95, evidence: "sarah.jenkins.hr@gmail.com used instead of corporate domain" },
          { signal: "Lookalike / newly registered domain", severity: "high", confidence: 0.90, evidence: "apex-global-logistics-careers.com registered 4 days ago" }
        ],
        consistencyScore: 12,
        status: "success"
      },
      threatFindings: {
        agent: "threat_intelligence",
        matches: [
          { sourceId: "IOC-CHECK-SCAM-091", similarity: 0.94, evidenceQuality: "High", relevance: "high", agentConfidence: 0.96, evidence: "Known overpayment/check routing syndicate targeting remote workers" }
        ],
        confidence: 0.94,
        status: "success"
      },
      evidenceAggregation: {
        contentEvidence: [
          { signal: "Fake check / advance fee equipment scam pattern", severity: "critical", confidence: 0.98, evidence: "Mailed check with request to pay vendor via Zelle/wire" },
          { signal: "Unrealistically high hourly wage for entry level", severity: "high", confidence: 0.92, evidence: "$45/hr for data entry" }
        ],
        recruiterEvidence: [
          { signal: "Free public email provider used for corporate HR", severity: "high", confidence: 0.95, evidence: "sarah.jenkins.hr@gmail.com used instead of corporate domain" }
        ],
        threatEvidence: [
          { sourceId: "IOC-CHECK-SCAM-091", similarity: 0.94, evidenceQuality: "High", relevance: "high", agentConfidence: 0.96, evidence: "Known overpayment syndicate" }
        ],
        supportingSignals: 4,
        contradictions: 0,
        contradictionDetails: [],
        missingEvidence: [],
        overallEvidenceConfidence: 0.95,
        investigationMetadata: { executionMode: "DEMO" }
      },
      finalDecision: {
        verdict: "CRITICAL",
        riskScore: 92,
        confidence: 0.95,
        why: [
          "Definitive fraudulent pattern: sending a check to purchase equipment from an unverified vendor is the signature marker of an advance fee check fraud campaign.",
          "Recruiter communication originates from a generic Gmail address rather than the claimed company domain.",
          "The domain apex-global-logistics-careers.com was registered fewer than 7 days ago and matches known spoofing infrastructure."
        ],
        evidence: [
          { key: "Check & Wire Request", detail: "Request to deposit $3,500 check and send money via Zelle" },
          { key: "Domain Age", detail: "Domain active for under 7 days" },
          { key: "Email Verification", detail: "Public Gmail address used for corporate recruiting" }
        ],
        contradictions: [],
        recommendations: [
          "Do not deposit or cash any checks received from this sender.",
          "Cease all contact immediately and block the sender on all messaging channels.",
          "Do not transmit banking information, government IDs, or SSN."
        ]
      },
      evaluation: {
        content_risk: { score: 92, label: "Very High" },
        recruiter_trust: { score: 10, label: "Very Low" },
        threat_match: { score: 94, label: "Very High" },
        historical_similarity: { score: 90, label: "Very High" },
        overall_risk: { score: 92, label: "Very High" },
        evidence_quality: { level: "High", score: 95 },
        confidence: 0.95,
        sources_used: 4,
        contradictions: 0,
        missing_evidence: 0
      },
      decisionPolicy: {
        decision: "SCAM",
        policy_version: "v1",
        reason: "HIGH_RISK_AND_CONFIDENCE",
        risk: 92,
        confidence: 95
      },
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      totalLatencyMs: 1350
    }
  },

  "demo-scam-telegram-crypto": {
    id: "demo-scam-telegram-crypto",
    title: "App Optimization Associate — Telegram Crypto Task Scam",
    category: "SCAM",
    description: "High-yield task scam requiring users to review mobile apps and deposit cryptocurrency to unlock accumulated commission balances.",
    input: {
      jobTitle: "App Rating & Optimization Associate",
      company: "CloudScale Media Global",
      companyDomain: "cloudscale-app-ranking.xyz",
      recruiterName: "Elena Rostova",
      email: "elena@cloudscale-app-ranking.xyz",
      emailDomain: "cloudscale-app-ranking.xyz",
      salary: "300 - 800 USDT/day",
      sourcePlatform: "WhatsApp invitation",
      inputType: "message",
      jobText: "Hi! I am Elena from CloudScale Media. We offer part-time remote work helping app developers boost ratings. Earn 300 to 800 USDT daily working 1-2 hours on your phone. You will complete 38 rating tasks per workbench set. A minimum wallet deposit of 100 USDT is required to activate higher commission tiers and withdraw your daily earnings. Join our Telegram operations desk @CloudScaleDesk to begin.",
    },
    trace: {
      investigationId: "demo-scam-telegram-crypto",
      executionMode: "DEMO",
      isSimulated: true,
      state: "COMPLETED",
      input: {
        jobTitle: "App Rating & Optimization Associate",
        company: "CloudScale Media Global",
        companyDomain: "cloudscale-app-ranking.xyz",
        recruiterName: "Elena Rostova",
        email: "elena@cloudscale-app-ranking.xyz",
        emailDomain: "cloudscale-app-ranking.xyz",
        salary: "300 - 800 USDT/day",
        sourcePlatform: "WhatsApp invitation",
        inputType: "message",
        jobText: "Hi! I am Elena from CloudScale Media. We offer part-time remote work helping app developers boost ratings. Earn 300 to 800 USDT daily working 1-2 hours on your phone. You will complete 38 rating tasks per workbench set. A minimum wallet deposit of 100 USDT is required to activate higher commission tiers and withdraw your daily earnings. Join our Telegram operations desk @CloudScaleDesk to begin.",
      },
      agentTraces: [
        {
          agentName: "content_investigator",
          startedAt: new Date(Date.now() - 1500),
          completedAt: new Date(Date.now() - 1200),
          latencyMs: 300,
          provider: "demo",
          model: "synthetic-v1",
          status: "success",
          output: {
            riskSignals: [
              { signal: "Pay-to-work / task scam deposit model", severity: "critical", confidence: 0.99, evidence: "100 USDT deposit required to withdraw commission" },
              { signal: "Cryptocurrency settlement for employment tasks", severity: "high", confidence: 0.95, evidence: "USDT daily payout" },
              { signal: "Encrypted messaging diversion", severity: "high", confidence: 0.91, evidence: "Diverts conversation to Telegram @CloudScaleDesk" }
            ],
            riskScore: 96,
            confidence: 0.96
          }
        },
        {
          agentName: "recruiter_investigator",
          startedAt: new Date(Date.now() - 1200),
          completedAt: new Date(Date.now() - 900),
          latencyMs: 300,
          provider: "demo",
          model: "synthetic-v1",
          status: "success",
          output: {
            identitySignals: [
              { signal: "Disposable domain with suspicious TLD (.xyz)", severity: "high", confidence: 0.92, evidence: "cloudscale-app-ranking.xyz has hidden WHOIS" },
              { signal: "Unsolicited cold outreach via consumer messenger", severity: "medium", confidence: 0.88, evidence: "WhatsApp initial contact" }
            ],
            consistencyScore: 8,
            status: "success"
          }
        },
        {
          agentName: "threat_intelligence",
          startedAt: new Date(Date.now() - 900),
          completedAt: new Date(Date.now() - 650),
          latencyMs: 250,
          provider: "demo",
          model: "synthetic-v1",
          status: "success",
          output: {
            matches: [
              { sourceId: "IOC-TASK-SCAM-772", similarity: 0.97, evidenceQuality: "High", relevance: "high", agentConfidence: 0.98, evidence: "Known international task scam playbook using 38-task sets and USDT deposits" }
            ],
            confidence: 0.98,
            status: "success"
          }
        },
        {
          agentName: "evidence_aggregator",
          startedAt: new Date(Date.now() - 650),
          completedAt: new Date(Date.now() - 400),
          latencyMs: 250,
          provider: "demo",
          model: "synthetic-v1",
          status: "success",
          output: {
            supportingSignals: 6,
            contradictions: 0,
            contradictionDetails: [],
            missingEvidence: []
          }
        },
        {
          agentName: "final_decision",
          startedAt: new Date(Date.now() - 400),
          completedAt: new Date(Date.now() - 50),
          latencyMs: 350,
          provider: "demo",
          model: "synthetic-v1",
          status: "success",
          output: {
            verdict: "CRITICAL",
            riskScore: 96,
            confidence: 0.97
          }
        }
      ],
      contentFindings: {
        agent: "content_investigator",
        riskSignals: [
          { signal: "Pay-to-work / task scam deposit model", severity: "critical", confidence: 0.99, evidence: "100 USDT deposit required to withdraw commission" },
          { signal: "Cryptocurrency settlement for employment tasks", severity: "high", confidence: 0.95, evidence: "USDT daily payout" },
          { signal: "Encrypted messaging diversion", severity: "high", confidence: 0.91, evidence: "Diverts conversation to Telegram @CloudScaleDesk" }
        ],
        riskScore: 96,
        confidence: 0.96
      },
      recruiterFindings: {
        agent: "recruiter_investigator",
        identitySignals: [
          { signal: "Disposable domain with suspicious TLD (.xyz)", severity: "high", confidence: 0.92, evidence: "cloudscale-app-ranking.xyz has hidden WHOIS" },
          { signal: "Unsolicited cold outreach via consumer messenger", severity: "medium", confidence: 0.88, evidence: "WhatsApp initial contact" }
        ],
        consistencyScore: 8,
        status: "success"
      },
      threatFindings: {
        agent: "threat_intelligence",
        matches: [
          { sourceId: "IOC-TASK-SCAM-772", similarity: 0.97, evidenceQuality: "High", relevance: "high", agentConfidence: 0.98, evidence: "Known international task scam playbook using 38-task sets and USDT deposits" }
        ],
        confidence: 0.98,
        status: "success"
      },
      evidenceAggregation: {
        contentEvidence: [
          { signal: "Pay-to-work / task scam deposit model", severity: "critical", confidence: 0.99, evidence: "100 USDT deposit required to withdraw commission" },
          { signal: "Cryptocurrency settlement for employment tasks", severity: "high", confidence: 0.95, evidence: "USDT daily payout" }
        ],
        recruiterEvidence: [
          { signal: "Disposable domain with suspicious TLD (.xyz)", severity: "high", confidence: 0.92, evidence: "cloudscale-app-ranking.xyz" }
        ],
        threatEvidence: [
          { sourceId: "IOC-TASK-SCAM-772", similarity: 0.97, evidenceQuality: "High", relevance: "high", agentConfidence: 0.98, evidence: "International task scam cluster" }
        ],
        supportingSignals: 5,
        contradictions: 0,
        contradictionDetails: [],
        missingEvidence: [],
        overallEvidenceConfidence: 0.97,
        investigationMetadata: { executionMode: "DEMO" }
      },
      finalDecision: {
        verdict: "CRITICAL",
        riskScore: 96,
        confidence: 0.97,
        why: [
          "The requirement to transfer cryptocurrency to access earned wages is fraudulent task scam mechanics.",
          "High-volume rating tasks of 38-item increments match documented global scam syndicates.",
          "Recruiter operates from an unverified .xyz domain with private WHOIS registration."
        ],
        evidence: [
          { key: "Upfront Crypto Deposit", detail: "Demands 100 USDT deposit before earnings unlock" },
          { key: "Task Scam Mechanics", detail: "38-task daily workbench model" },
          { key: "Unsolicited Contact", detail: "Spam invitation via mobile messaging app" }
        ],
        contradictions: [],
        recommendations: [
          "Do not send cryptocurrency or connect Web3 wallets to the specified platform.",
          "Report the Telegram handle and WhatsApp number to respective platforms.",
          "Never pay money in order to receive earned wages."
        ]
      },
      evaluation: {
        content_risk: { score: 96, label: "Very High" },
        recruiter_trust: { score: 5, label: "Very Low" },
        threat_match: { score: 97, label: "Very High" },
        historical_similarity: { score: 95, label: "Very High" },
        overall_risk: { score: 96, label: "Very High" },
        evidence_quality: { level: "High", score: 98 },
        confidence: 0.97,
        sources_used: 4,
        contradictions: 0,
        missing_evidence: 0
      },
      decisionPolicy: {
        decision: "SCAM",
        policy_version: "v1",
        reason: "HIGH_RISK_AND_CONFIDENCE",
        risk: 96,
        confidence: 97
      },
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      totalLatencyMs: 1450
    }
  },

  "demo-safe-tech-lead": {
    id: "demo-safe-tech-lead",
    title: "Senior Full-Stack Engineer — Stripe",
    category: "SAFE",
    description: "Legitimate enterprise software engineering opportunity with verified corporate email, matching ATS listing, and standard compensation.",
    input: {
      jobTitle: "Senior Full-Stack Software Engineer",
      company: "Stripe",
      companyDomain: "stripe.com",
      recruiterName: "Marcus Vance",
      email: "mvance@stripe.com",
      emailDomain: "stripe.com",
      salary: "$175,000 - $210,000 / year + equity",
      sourcePlatform: "LinkedIn Jobs / Greenhouse",
      inputType: "description",
      jobText: "Stripe is seeking a Senior Full-Stack Software Engineer to join our Developer Platform team in San Francisco, CA or Remote (US). You will design high-throughput APIs, build developer dashboards with React and TypeScript, and collaborate with infrastructure teams. Qualifications: 5+ years building scalable distributed systems, proficiency in TypeScript/Ruby/Java. Standard background check required post-offer. Official application portal: stripe.com/jobs.",
    },
    trace: {
      investigationId: "demo-safe-tech-lead",
      executionMode: "DEMO",
      isSimulated: true,
      state: "COMPLETED",
      input: {
        jobTitle: "Senior Full-Stack Software Engineer",
        company: "Stripe",
        companyDomain: "stripe.com",
        recruiterName: "Marcus Vance",
        email: "mvance@stripe.com",
        emailDomain: "stripe.com",
        salary: "$175,000 - $210,000 / year + equity",
        sourcePlatform: "LinkedIn Jobs / Greenhouse",
        inputType: "description",
        jobText: "Stripe is seeking a Senior Full-Stack Software Engineer to join our Developer Platform team in San Francisco, CA or Remote (US). You will design high-throughput APIs, build developer dashboards with React and TypeScript, and collaborate with infrastructure teams. Qualifications: 5+ years building scalable distributed systems, proficiency in TypeScript/Ruby/Java. Standard background check required post-offer. Official application portal: stripe.com/jobs.",
      },
      agentTraces: [
        {
          agentName: "content_investigator",
          startedAt: new Date(Date.now() - 1300),
          completedAt: new Date(Date.now() - 1050),
          latencyMs: 250,
          provider: "demo",
          model: "synthetic-v1",
          status: "success",
          output: {
            riskSignals: [],
            riskScore: 8,
            confidence: 0.90
          }
        },
        {
          agentName: "recruiter_investigator",
          startedAt: new Date(Date.now() - 1050),
          completedAt: new Date(Date.now() - 800),
          latencyMs: 250,
          provider: "demo",
          model: "synthetic-v1",
          status: "success",
          output: {
            identitySignals: [
              { signal: "Verified corporate email domain matching company profile", severity: "low", confidence: 0.95, evidence: "mvance@stripe.com matches stripe.com SPF/DKIM" },
              { signal: "Official ATS / careers subdomain destination", severity: "low", confidence: 0.92, evidence: "stripe.com/jobs authoritative host" }
            ],
            consistencyScore: 94,
            status: "success"
          }
        },
        {
          agentName: "threat_intelligence",
          startedAt: new Date(Date.now() - 800),
          completedAt: new Date(Date.now() - 550),
          latencyMs: 250,
          provider: "demo",
          model: "synthetic-v1",
          status: "success",
          output: {
            matches: [],
            confidence: 0.92,
            status: "success"
          }
        },
        {
          agentName: "evidence_aggregator",
          startedAt: new Date(Date.now() - 550),
          completedAt: new Date(Date.now() - 300),
          latencyMs: 250,
          provider: "demo",
          model: "synthetic-v1",
          status: "success",
          output: {
            supportingSignals: 0,
            contradictions: 0,
            contradictionDetails: [],
            missingEvidence: []
          }
        },
        {
          agentName: "final_decision",
          startedAt: new Date(Date.now() - 300),
          completedAt: new Date(Date.now() - 50),
          latencyMs: 250,
          provider: "demo",
          model: "synthetic-v1",
          status: "success",
          output: {
            verdict: "SAFE",
            riskScore: 10,
            confidence: 0.92
          }
        }
      ],
      contentFindings: {
        agent: "content_investigator",
        riskSignals: [],
        riskScore: 8,
        confidence: 0.90
      },
      recruiterFindings: {
        agent: "recruiter_investigator",
        identitySignals: [
          { signal: "Verified corporate email domain matching company profile", severity: "low", confidence: 0.95, evidence: "mvance@stripe.com matches stripe.com SPF/DKIM" },
          { signal: "Official ATS / careers subdomain destination", severity: "low", confidence: 0.92, evidence: "stripe.com/jobs authoritative host" }
        ],
        consistencyScore: 94,
        status: "success"
      },
      threatFindings: {
        agent: "threat_intelligence",
        matches: [],
        confidence: 0.92,
        status: "success"
      },
      evidenceAggregation: {
        contentEvidence: [],
        recruiterEvidence: [
          { signal: "Verified domain security configuration", severity: "low", confidence: 0.95, evidence: "Valid DMARC/SPF for stripe.com" }
        ],
        threatEvidence: [],
        supportingSignals: 0,
        contradictions: 0,
        contradictionDetails: [],
        missingEvidence: [],
        overallEvidenceConfidence: 0.92,
        investigationMetadata: { executionMode: "DEMO" }
      },
      finalDecision: {
        verdict: "SAFE",
        riskScore: 10,
        confidence: 0.92,
        why: [
          "Recruiter email domain directly matches Stripe's official domain with valid security records.",
          "Salary range and technical requirements are completely consistent with market benchmarks for Senior Staff roles in the Bay Area.",
          "Application directs to Stripe's verified official career site."
        ],
        evidence: [
          { key: "Domain Authentication", detail: "stripe.com verified with high trust reputation" },
          { key: "Compensation Realism", detail: "Standard market salary band with equity" },
          { key: "Hiring Process", detail: "Standard multi-stage engineering loop" }
        ],
        contradictions: [],
        recommendations: [
          "Proceed with normal application via stripe.com/jobs.",
          "Ensure interview scheduling remains through official @stripe.com email addresses."
        ]
      },
      evaluation: {
        content_risk: { score: 8, label: "Low" },
        recruiter_trust: { score: 94, label: "Very High" },
        threat_match: { score: 0, label: "Low" },
        historical_similarity: { score: 5, label: "Low" },
        overall_risk: { score: 10, label: "Low" },
        evidence_quality: { level: "High", score: 92 },
        confidence: 0.92,
        sources_used: 4,
        contradictions: 0,
        missing_evidence: 0
      },
      decisionPolicy: {
        decision: "SAFE",
        policy_version: "v1",
        reason: "LOW_RISK_HIGH_CONFIDENCE",
        risk: 10,
        confidence: 92
      },
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      totalLatencyMs: 1250
    }
  },

  "demo-safe-healthcare-analyst": {
    id: "demo-safe-healthcare-analyst",
    title: "Healthcare Data Analyst — Memorial Health System",
    category: "SAFE",
    description: "Verified institutional healthcare role featuring formal credential checks, legitimate hospital domain, and standard HR workflows.",
    input: {
      jobTitle: "Clinical Data Analyst",
      company: "Memorial Health System",
      companyDomain: "memorialhealth.org",
      recruiterName: "Karen Phillips, Senior Talent Partner",
      email: "kphillips@memorialhealth.org",
      emailDomain: "memorialhealth.org",
      salary: "$82,000 - $96,000 / year",
      sourcePlatform: "Indeed / Hospital Careers",
      inputType: "description",
      jobText: "Memorial Health System is hiring a Clinical Data Analyst to support our Patient Quality Outcomes team in Columbus, OH. You will extract EHR data using SQL, generate Tableau compliance reports, and present quality metrics to clinical directors. Requirements: BS in Health Informatics or related field, 2+ years healthcare data analytics, experience with Epic EHR preferred. Complete benefits package including medical, dental, and pension.",
    },
    trace: {
      investigationId: "demo-safe-healthcare-analyst",
      executionMode: "DEMO",
      isSimulated: true,
      state: "COMPLETED",
      input: {
        jobTitle: "Clinical Data Analyst",
        company: "Memorial Health System",
        companyDomain: "memorialhealth.org",
        recruiterName: "Karen Phillips, Senior Talent Partner",
        email: "kphillips@memorialhealth.org",
        emailDomain: "memorialhealth.org",
        salary: "$82,000 - $96,000 / year",
        sourcePlatform: "Indeed / Hospital Careers",
        inputType: "description",
        jobText: "Memorial Health System is hiring a Clinical Data Analyst to support our Patient Quality Outcomes team in Columbus, OH. You will extract EHR data using SQL, generate Tableau compliance reports, and present quality metrics to clinical directors. Requirements: BS in Health Informatics or related field, 2+ years healthcare data analytics, experience with Epic EHR preferred. Complete benefits package including medical, dental, and pension.",
      },
      agentTraces: [
        {
          agentName: "content_investigator",
          startedAt: new Date(Date.now() - 1200),
          completedAt: new Date(Date.now() - 950),
          latencyMs: 250,
          provider: "demo",
          model: "synthetic-v1",
          status: "success",
          output: {
            riskSignals: [],
            riskScore: 12,
            confidence: 0.88
          }
        },
        {
          agentName: "recruiter_investigator",
          startedAt: new Date(Date.now() - 950),
          completedAt: new Date(Date.now() - 700),
          latencyMs: 250,
          provider: "demo",
          model: "synthetic-v1",
          status: "success",
          output: {
            identitySignals: [
              { signal: "Registered healthcare non-profit organizational domain", severity: "low", confidence: 0.94, evidence: "memorialhealth.org registered over 15 years" }
            ],
            consistencyScore: 92,
            status: "success"
          }
        },
        {
          agentName: "threat_intelligence",
          startedAt: new Date(Date.now() - 700),
          completedAt: new Date(Date.now() - 480),
          latencyMs: 220,
          provider: "demo",
          model: "synthetic-v1",
          status: "success",
          output: {
            matches: [],
            confidence: 0.90,
            status: "success"
          }
        },
        {
          agentName: "evidence_aggregator",
          startedAt: new Date(Date.now() - 480),
          completedAt: new Date(Date.now() - 260),
          latencyMs: 220,
          provider: "demo",
          model: "synthetic-v1",
          status: "success",
          output: {
            supportingSignals: 0,
            contradictions: 0,
            contradictionDetails: [],
            missingEvidence: []
          }
        },
        {
          agentName: "final_decision",
          startedAt: new Date(Date.now() - 260),
          completedAt: new Date(Date.now() - 40),
          latencyMs: 220,
          provider: "demo",
          model: "synthetic-v1",
          status: "success",
          output: {
            verdict: "SAFE",
            riskScore: 14,
            confidence: 0.89
          }
        }
      ],
      contentFindings: {
        agent: "content_investigator",
        riskSignals: [],
        riskScore: 12,
        confidence: 0.88
      },
      recruiterFindings: {
        agent: "recruiter_investigator",
        identitySignals: [
          { signal: "Registered healthcare non-profit organizational domain", severity: "low", confidence: 0.94, evidence: "memorialhealth.org registered over 15 years" }
        ],
        consistencyScore: 92,
        status: "success"
      },
      threatFindings: {
        agent: "threat_intelligence",
        matches: [],
        confidence: 0.90,
        status: "success"
      },
      evidenceAggregation: {
        contentEvidence: [],
        recruiterEvidence: [],
        threatEvidence: [],
        supportingSignals: 0,
        contradictions: 0,
        contradictionDetails: [],
        missingEvidence: [],
        overallEvidenceConfidence: 0.89,
        investigationMetadata: { executionMode: "DEMO" }
      },
      finalDecision: {
        verdict: "SAFE",
        riskScore: 14,
        confidence: 0.89,
        why: [
          "Organizational domain memorialhealth.org is established, accredited, and verified.",
          "Role expectations, EHR compliance criteria, and compensation align with healthcare industry norms.",
          "Zero telemetry hits across threat databases and fraud blacklists."
        ],
        evidence: [
          { key: "Accredited Health Org", detail: "Verified regional health system entity" },
          { key: "Standard Hiring Criteria", detail: "Clinical data experience and background check requirements" }
        ],
        contradictions: [],
        recommendations: [
          "Standard job application practices apply.",
          "Submit through the hospital's verified career portal."
        ]
      },
      evaluation: {
        content_risk: { score: 12, label: "Low" },
        recruiter_trust: { score: 92, label: "Very High" },
        threat_match: { score: 0, label: "Low" },
        historical_similarity: { score: 4, label: "Low" },
        overall_risk: { score: 14, label: "Low" },
        evidence_quality: { level: "High", score: 89 },
        confidence: 0.89,
        sources_used: 4,
        contradictions: 0,
        missing_evidence: 0
      },
      decisionPolicy: {
        decision: "SAFE",
        policy_version: "v1",
        reason: "LOW_RISK_HIGH_CONFIDENCE",
        risk: 14,
        confidence: 89
      },
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      totalLatencyMs: 1160
    }
  },

  "demo-review-stealth-startup": {
    id: "demo-review-stealth-startup",
    title: "Founding AI Engineer — Stealth Seed Venture",
    category: "HUMAN_REVIEW",
    description: "Early-stage startup with unlaunched product site and informal domain, requiring manual verification of founders and investors.",
    input: {
      jobTitle: "Founding Engineer (Generative AI)",
      company: "CognitiveFlow Labs (Stealth)",
      companyDomain: "cogflow-ai.co",
      recruiterName: "Devin K., Co-founder",
      email: "devin@cogflow-ai.co",
      emailDomain: "cogflow-ai.co",
      salary: "$140,000 + 2.5% Equity",
      sourcePlatform: "AngelList / Wellfound Direct Message",
      inputType: "message",
      jobText: "Hey! We saw your open-source agent work and loved it. We are building an enterprise context engine in stealth, backed by prominent angel investors. Looking for our first Founding Engineer to lead model evaluation and retrieval pipeline architecture. We can do a video chat this Thursday at 2 PM PST. Note: Our main product site isn't public yet, but you can review our technical whitepaper on Notion.",
    },
    trace: {
      investigationId: "demo-review-stealth-startup",
      executionMode: "DEMO",
      isSimulated: true,
      state: "COMPLETED",
      input: {
        jobTitle: "Founding Engineer (Generative AI)",
        company: "CognitiveFlow Labs (Stealth)",
        companyDomain: "cogflow-ai.co",
        recruiterName: "Devin K., Co-founder",
        email: "devin@cogflow-ai.co",
        emailDomain: "cogflow-ai.co",
        salary: "$140,000 + 2.5% Equity",
        sourcePlatform: "AngelList / Wellfound Direct Message",
        inputType: "message",
        jobText: "Hey! We saw your open-source agent work and loved it. We are building an enterprise context engine in stealth, backed by prominent angel investors. Looking for our first Founding Engineer to lead model evaluation and retrieval pipeline architecture. We can do a video chat this Thursday at 2 PM PST. Note: Our main product site isn't public yet, but you can review our technical whitepaper on Notion.",
      },
      agentTraces: [
        {
          agentName: "content_investigator",
          startedAt: new Date(Date.now() - 1400),
          completedAt: new Date(Date.now() - 1100),
          latencyMs: 300,
          provider: "demo",
          model: "synthetic-v1",
          status: "success",
          output: {
            riskSignals: [
              { signal: "Unregistered public web presence / placeholder site", severity: "medium", confidence: 0.70, evidence: "Website is not publicly reachable or points to Notion" }
            ],
            riskScore: 42,
            confidence: 0.65
          }
        },
        {
          agentName: "recruiter_investigator",
          startedAt: new Date(Date.now() - 1100),
          completedAt: new Date(Date.now() - 800),
          latencyMs: 300,
          provider: "demo",
          model: "synthetic-v1",
          status: "success",
          output: {
            identitySignals: [
              { signal: "Recently registered alternative domain extension (.co)", severity: "medium", confidence: 0.68, evidence: "Domain registered 45 days ago" },
              { signal: "Founder profile matches active open-source activity", severity: "low", confidence: 0.75, evidence: "Corroborated GitHub presence" }
            ],
            consistencyScore: 58,
            status: "success"
          }
        },
        {
          agentName: "threat_intelligence",
          startedAt: new Date(Date.now() - 800),
          completedAt: new Date(Date.now() - 550),
          latencyMs: 250,
          provider: "demo",
          model: "synthetic-v1",
          status: "success",
          output: {
            matches: [],
            confidence: 0.60,
            status: "success"
          }
        },
        {
          agentName: "evidence_aggregator",
          startedAt: new Date(Date.now() - 550),
          completedAt: new Date(Date.now() - 300),
          latencyMs: 250,
          provider: "demo",
          model: "synthetic-v1",
          status: "success",
          output: {
            supportingSignals: 1,
            contradictions: 1,
            contradictionDetails: [
              { description: "Domain is very new (45 days) but founder has reputable GitHub history", agents: ["recruiter_investigator", "content_investigator"] }
            ],
            missingEvidence: ["Official business incorporation certificate", "Commercial office or verified registered agent address"]
          }
        },
        {
          agentName: "final_decision",
          startedAt: new Date(Date.now() - 300),
          completedAt: new Date(Date.now() - 40),
          latencyMs: 260,
          provider: "demo",
          model: "synthetic-v1",
          status: "success",
          output: {
            verdict: "MEDIUM_RISK",
            riskScore: 55,
            confidence: 0.62
          }
        }
      ],
      contentFindings: {
        agent: "content_investigator",
        riskSignals: [
          { signal: "Unregistered public web presence / placeholder site", severity: "medium", confidence: 0.70, evidence: "Website is not publicly reachable or points to Notion" }
        ],
        riskScore: 42,
        confidence: 0.65
      },
      recruiterFindings: {
        agent: "recruiter_investigator",
        identitySignals: [
          { signal: "Recently registered alternative domain extension (.co)", severity: "medium", confidence: 0.68, evidence: "Domain registered 45 days ago" },
          { signal: "Founder profile matches active open-source activity", severity: "low", confidence: 0.75, evidence: "Corroborated GitHub presence" }
        ],
        consistencyScore: 58,
        status: "success"
      },
      threatFindings: {
        agent: "threat_intelligence",
        matches: [],
        confidence: 0.60,
        status: "success"
      },
      evidenceAggregation: {
        contentEvidence: [
          { signal: "Unregistered public web presence / placeholder site", severity: "medium", confidence: 0.70, evidence: "Stealth mode landing page" }
        ],
        recruiterEvidence: [
          { signal: "New domain age (45 days)", severity: "medium", confidence: 0.68, evidence: "Registered recently" }
        ],
        threatEvidence: [],
        supportingSignals: 2,
        contradictions: 1,
        contradictionDetails: [
          { description: "Domain is very new (45 days) but founder has reputable GitHub history", agents: ["recruiter_investigator", "content_investigator"] }
        ],
        missingEvidence: ["Corporate registration filings", "Verified company page on LinkedIn"],
        overallEvidenceConfidence: 0.62,
        investigationMetadata: { executionMode: "DEMO" }
      },
      finalDecision: {
        verdict: "MEDIUM_RISK",
        riskScore: 55,
        confidence: 0.62,
        why: [
          "The company operates in stealth with no public corporate registration or web infrastructure.",
          "The domain cogflow-ai.co was created only 45 days ago.",
          "However, technical discussions and video call proposals suggest genuine engineering founder outreach rather than automated credential harvesting."
        ],
        evidence: [
          { key: "Domain Age", detail: "Domain registered 45 days ago" },
          { key: "Presence", detail: "No official company website (points to Notion doc)" },
          { key: "Interaction Style", detail: "Proposes interactive Google Meet video call" }
        ],
        contradictions: [
          "Domain is very new but founder profile shows legitimate software history."
        ],
        recommendations: [
          "Participate in the scheduled video call to verify the founder's identity visually.",
          "Request details regarding incorporation state (e.g. Delaware C-Corp) and investor backing before signing agreements.",
          "Do not supply SSN or banking credentials until formal written contracts and company identity are confirmed."
        ]
      },
      evaluation: {
        content_risk: { score: 42, label: "Medium" },
        recruiter_trust: { score: 58, label: "Medium" },
        threat_match: { score: 0, label: "Low" },
        historical_similarity: { score: 25, label: "Low" },
        overall_risk: { score: 55, label: "Medium" },
        evidence_quality: { level: "Medium", score: 62 },
        confidence: 0.62,
        sources_used: 3,
        contradictions: 1,
        missing_evidence: 2
      },
      decisionPolicy: {
        decision: "HUMAN_REVIEW",
        policy_version: "v1",
        reason: "AMBIGUOUS_EVIDENCE_OR_CONFIDENCE",
        risk: 55,
        confidence: 62
      },
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      totalLatencyMs: 1360
    }
  },

  "demo-review-commission-sales": {
    id: "demo-review-commission-sales",
    title: "Regional Sales Specialist — 100% Commission Model",
    category: "HUMAN_REVIEW",
    description: "B2B commercial sales position with aggressive recruiter pitch and 100% commission compensation, warranting candidate scrutiny of contract terms.",
    input: {
      jobTitle: "Regional Account Executive (Direct B2B)",
      company: "EverGreen Commercial Energy",
      companyDomain: "evergreen-commercial-energy.com",
      recruiterName: "Travis Miller",
      email: "travis.m@evergreen-commercial-energy.com",
      emailDomain: "evergreen-commercial-energy.com",
      salary: "$120,000 - $180,000 Projected OTE (100% Commission)",
      sourcePlatform: "Monster / ZipRecruiter",
      inputType: "description",
      jobText: "Urgent hiring! EverGreen Commercial Energy is expanding territory sales in the Midwest. High-energy closer needed immediately. Make up to $15,000/month selling commercial energy efficiency contracts to local business owners. Uncapped commission, weekly draw against commission, 1099 contractor status. Must have reliable personal vehicle and smartphone. Immediate onboarding this Monday.",
    },
    trace: {
      investigationId: "demo-review-commission-sales",
      executionMode: "DEMO",
      isSimulated: true,
      state: "COMPLETED",
      input: {
        jobTitle: "Regional Account Executive (Direct B2B)",
        company: "EverGreen Commercial Energy",
        companyDomain: "evergreen-commercial-energy.com",
        recruiterName: "Travis Miller",
        email: "travis.m@evergreen-commercial-energy.com",
        emailDomain: "evergreen-commercial-energy.com",
        salary: "$120,000 - $180,000 Projected OTE (100% Commission)",
        sourcePlatform: "Monster / ZipRecruiter",
        inputType: "description",
        jobText: "Urgent hiring! EverGreen Commercial Energy is expanding territory sales in the Midwest. High-energy closer needed immediately. Make up to $15,000/month selling commercial energy efficiency contracts to local business owners. Uncapped commission, weekly draw against commission, 1099 contractor status. Must have reliable personal vehicle and smartphone. Immediate onboarding this Monday.",
      },
      agentTraces: [
        {
          agentName: "content_investigator",
          startedAt: new Date(Date.now() - 1350),
          completedAt: new Date(Date.now() - 1050),
          latencyMs: 300,
          provider: "demo",
          model: "synthetic-v1",
          status: "success",
          output: {
            riskSignals: [
              { signal: "100% commission compensation disguised as guaranteed high salary", severity: "medium", confidence: 0.85, evidence: "$120k-$180k projected OTE is entirely commission dependent" },
              { signal: "High pressure recruitment language / urgent onboarding", severity: "medium", confidence: 0.80, evidence: "Immediate onboarding this Monday without standard background review" }
            ],
            riskScore: 60,
            confidence: 0.72
          }
        },
        {
          agentName: "recruiter_investigator",
          startedAt: new Date(Date.now() - 1050),
          completedAt: new Date(Date.now() - 800),
          latencyMs: 250,
          provider: "demo",
          model: "synthetic-v1",
          status: "success",
          output: {
            identitySignals: [
              { signal: "Valid domain with matching corporate registration in Ohio", severity: "low", confidence: 0.88, evidence: "Secretary of State active corporate record found" }
            ],
            consistencyScore: 70,
            status: "success"
          }
        },
        {
          agentName: "threat_intelligence",
          startedAt: new Date(Date.now() - 800),
          completedAt: new Date(Date.now() - 550),
          latencyMs: 250,
          provider: "demo",
          model: "synthetic-v1",
          status: "success",
          output: {
            matches: [],
            confidence: 0.75,
            status: "success"
          }
        },
        {
          agentName: "evidence_aggregator",
          startedAt: new Date(Date.now() - 550),
          completedAt: new Date(Date.now() - 300),
          latencyMs: 250,
          provider: "demo",
          model: "synthetic-v1",
          status: "success",
          output: {
            supportingSignals: 2,
            contradictions: 0,
            contradictionDetails: [],
            missingEvidence: ["W-2 employment agreement", "Client lead generation reimbursement policy"]
          }
        },
        {
          agentName: "final_decision",
          startedAt: new Date(Date.now() - 300),
          completedAt: new Date(Date.now() - 40),
          latencyMs: 260,
          provider: "demo",
          model: "synthetic-v1",
          status: "success",
          output: {
            verdict: "MEDIUM_RISK",
            riskScore: 62,
            confidence: 0.65
          }
        }
      ],
      contentFindings: {
        agent: "content_investigator",
        riskSignals: [
          { signal: "100% commission compensation disguised as guaranteed high salary", severity: "medium", confidence: 0.85, evidence: "$120k-$180k projected OTE is entirely commission dependent" },
          { signal: "High pressure recruitment language / urgent onboarding", severity: "medium", confidence: 0.80, evidence: "Immediate onboarding this Monday without standard background review" }
        ],
        riskScore: 60,
        confidence: 0.72
      },
      recruiterFindings: {
        agent: "recruiter_investigator",
        identitySignals: [
          { signal: "Valid domain with matching corporate registration in Ohio", severity: "low", confidence: 0.88, evidence: "Secretary of State active corporate record found" }
        ],
        consistencyScore: 70,
        status: "success"
      },
      threatFindings: {
        agent: "threat_intelligence",
        matches: [],
        confidence: 0.75,
        status: "success"
      },
      evidenceAggregation: {
        contentEvidence: [
          { signal: "Aggressive commission-only compensation model", severity: "medium", confidence: 0.85, evidence: "1099 contractor status with no base pay" }
        ],
        recruiterEvidence: [
          { signal: "Active business entity registration", severity: "low", confidence: 0.88, evidence: "Registered corporate filing" }
        ],
        threatEvidence: [],
        supportingSignals: 2,
        contradictions: 0,
        contradictionDetails: [],
        missingEvidence: ["Written compensation schedule", "Lead coverage terms"],
        overallEvidenceConfidence: 0.65,
        investigationMetadata: { executionMode: "DEMO" }
      },
      finalDecision: {
        verdict: "MEDIUM_RISK",
        riskScore: 62,
        confidence: 0.65,
        why: [
          "The business is legally registered, but the compensation is 100% commission based without a guaranteed floor.",
          "Urgent onboarding language is a known technique to limit candidate due diligence regarding draw repayment terms.",
          "No technical threat or malware indicators detected."
        ],
        evidence: [
          { key: "Compensation Structure", detail: "100% Commission (1099 independent contractor)" },
          { key: "Entity Status", detail: "Legitimate corporate registration found" },
          { key: "Urgency", detail: "Immediate onboarding push" }
        ],
        contradictions: [],
        recommendations: [
          "Request the written 1099 agreement to inspect commission clawback terms and draw mechanics.",
          "Inquire whether lead lists are provided or if candidates must self-source door-to-door prospects.",
          "Verify vehicle and insurance reimbursement policies before committing."
        ]
      },
      evaluation: {
        content_risk: { score: 60, label: "Medium" },
        recruiter_trust: { score: 70, label: "High" },
        threat_match: { score: 0, label: "Low" },
        historical_similarity: { score: 30, label: "Low" },
        overall_risk: { score: 62, label: "Medium" },
        evidence_quality: { level: "Medium", score: 70 },
        confidence: 0.65,
        sources_used: 3,
        contradictions: 0,
        missing_evidence: 1
      },
      decisionPolicy: {
        decision: "HUMAN_REVIEW",
        policy_version: "v1",
        reason: "AMBIGUOUS_EVIDENCE_OR_CONFIDENCE",
        risk: 62,
        confidence: 65
      },
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      totalLatencyMs: 1310
    }
  }
};

/**
 * Returns all available demo scenario summaries for client listing.
 */
export function getDemoScenarioSummaries(): DemoScenarioSummary[] {
  return Object.values(DEMO_SCENARIOS).map((scenario) => ({
    id: scenario.id,
    title: scenario.title,
    category: scenario.category,
    description: scenario.description,
    input: scenario.input,
  }));
}

/**
 * Retrieves a demo scenario by ID.
 */
export function getDemoScenario(id: string): DemoScenarioRecord | null {
  return DEMO_SCENARIOS[id] || null;
}

/**
 * Helper to check whether an ID represents a demo scenario.
 */
export function isDemoId(id?: string): boolean {
  if (!id) return false;
  return id.startsWith("demo-") || Boolean(DEMO_SCENARIOS[id]);
}

/**
 * Generates explainability replay timeline events for demo mode in memory.
 */
export function getDemoTimeline(id: string) {
  const scenario = getDemoScenario(id);
  if (!scenario) return null;

  return {
    investigationId: scenario.id,
    events: (scenario.trace.agentTraces || []).map((t: any, idx: number) => ({
      stepNumber: idx + 1,
      phase: t.agentName.toUpperCase(),
      agentName: t.agentName,
      status: t.status,
      timestamp: t.completedAt || new Date().toISOString(),
      latencyMs: t.latencyMs,
      summary: `Completed ${t.agentName.replace(/_/g, " ")} evaluation in demo mode.`,
      details: t.output ? `Extracted demo evidence with status: ${t.status}` : undefined
    }))
  };
}

/**
 * Generates explainability signals/evidence for demo mode in memory.
 */
export function getDemoExplanation(id: string) {
  const scenario = getDemoScenario(id);
  if (!scenario) return null;

  const trace = scenario.trace;
  return {
    investigationId: scenario.id,
    signals: [
      ...(trace.contentFindings?.riskSignals || []),
      ...(trace.recruiterFindings?.identitySignals || [])
    ],
    evidence: trace.finalDecision?.evidence || [],
    agentFindings: {
      content: trace.contentFindings || null,
      recruiter: trace.recruiterFindings || null,
      threat: trace.threatFindings || null,
    },
    decisionPolicy: trace.decisionPolicy || null
  };
}
