# JobShield AI - Demo Flow Guide

## User Journey: Analyzing a Suspicious Job Offer

### Step 1: Landing Page
- User visits JobShield AI website
- Sees three main options: Analyze Job, Check Recruiter, View Reports
- Dashboard displays recent threat statistics

### Step 2: Paste Job Posting
- User navigates to "Analyze Job" section
- Pastes the following suspicious job posting:

```
"Hi, I found a great work-from-home opportunity paying $5,000/week!

No experience needed. Simply register and start earning immediately.

To get started, we need a $99 registration fee to cover training materials.

Contact: recruitment@easy-cash-jobs.xyz
```

### Step 3: AI Analysis
- User clicks "Analyze" button
- System shows loading spinner (2-3 seconds)
- Backend forwards text to AI service
- AI service detects:
  - Unrealistic salary claim: +30 points
  - Payment request: +35 points
  - Suspicious domain: +27 points
  - Quick hiring process: +10 points

### Step 4: Results Display
System returns comprehensive analysis:

```
SCAM PROBABILITY: 92% (HIGH RISK) 🚨

Suspicious Phrases Detected:
  ✗ "5,000/week" - Unrealistic salary
  ✗ "$99 registration fee" - Payment request
  ✗ "no experience needed" - Too good to be true
  ✗ "start immediately" - Pressure tactics

Risk Breakdown:
  • Payment Request: HIGH RISK
  • Salary Claims: UNREALISTIC
  • Domain Reputation: SUSPICIOUS
  • Grammar Quality: POOR

Recommendation: ❌ DO NOT ENGAGE
This matches known scam patterns with 89% similarity to database entries.
```

### Step 5: Recruiter Verification
- User clicks "Check Recruiter" from results
- System automatically checks domain: `easy-cash-jobs.xyz`
- Verification results:

```
RECRUITER VERIFICATION RESULTS

Email: recruitment@easy-cash-jobs.xyz
Domain: easy-cash-jobs.xyz
Trust Score: 15/100 (LOW RISK)

Security Checks:
  ✗ SSL Certificate: INVALID (expired)
  ✗ Domain Age: 45 days (very new)
  ✗ Phishing Similarity: 0.87 (high similarity to known phishing domains)
  ✗ Previous Reports: 342 reports

Verdict: ⚠️ KNOWN SCAM DOMAIN
This domain is associated with 342 user reports and 23 verified scams.
```

### Step 6: Scam Network Visualization
- User sees interactive graph showing connected scam entities:

```
                    [easy-cash-jobs.xyz]
                           |
                ┌──────────┼──────────┐
                |          |          |
          [recruitment@   [+1-555-  [john@scam
           easy-cash-     0123]      network.ru]
           jobs.xyz]                 
                |          |          |
                └──────────┼──────────┘
                           |
              [8 other flagged domains]
```

Each node shows:
- Connection type (email, domain, phone)
- Risk level
- Number of reports
- Related incidents

### Step 7: Submit Report
- User clicks "Report This Scam"
- Form appears with pre-filled information
- User adds additional details:

```
Additional Details:
- I received this via LinkedIn message
- Recruiter asked for payment via gift card
- Multiple suspicious requests for personal info
```

- User clicks "Submit"
- System shows confirmation:

```
✓ Report Submitted Successfully!

Your report ID: 507f2e88bcf97cd799440022
Timestamp: 2026-03-12 14:32:15 UTC

Your report helps protect 5,000+ job seekers using JobShield AI.
This domain now has 343 reports in our database.
```

### Step 8: Dashboard Update
- Dashboard updates with new statistics:
  - High Risk Offers: 1,247 (+1)
  - Network Threats Found: 89
  - Reports This Month: 3,421 (+1)

---

## Additional Demo Scenarios

### Scenario 2: Legitimate Job Posting

**Input:**
```
Senior Software Engineer - Remote

Company: Google
Location: Remote (US-based)
Salary: $180,000 - $250,000/year

We're hiring experienced engineers for our Cloud division.

Qualifications:
- 5+ years in software development
- Experience with distributed systems
- Bachelor's in Computer Science or equivalent

Apply: careers.google.com/jobs/senior-engineer-123
```

**Output:**
```
SCAM PROBABILITY: 8% (LOW RISK) ✓

No suspicious indicators detected.

Domain Verification:
✓ careers.google.com - LEGITIMATE
✓ SSL Certificate: VALID
✓ Domain Age: 7,500+ days
✓ Security Reputation: EXCELLENT
✓ Previous Reports: 0

Recommendation: ✓ SAFE TO APPLY
This appears to be a legitimate job posting from an established company.
```

### Scenario 3: Medium-Risk Posting

**Input:**
```
Data Entry Work - $25/hour

Work from home with flexible schedule.
Email: hr@fastjobs-agency.com

Competitive pay. Send resume to apply.
```

**Output:**
```
SCAM PROBABILITY: 42% (MEDIUM RISK) ⚠️

Potential Concerns:
- Generic job description
- Slightly unusual domain (fastjobs-agency.com)
- Limited company information

Recommendation: PROCEED WITH CAUTION
Verify company details before submitting personal information.

Domain Check:
⚠️ fastjobs-agency.com - MODERATE RISK
- SSL Certificate: Valid
- Domain Age: 180 days
- Previous Reports: 12
- Recommendation: Contact company directly if possible
```

---

## Key Metrics Displayed

1. **Scam Probability Score** (0-100)
2. **Risk Level** (Low/Medium/High)
3. **Suspicious Phrases** Count
4. **Domain Trust Score** (0-100)
5. **Network Connections** Count
6. **User Reports** Count
7. **Security Flags** Count

## User Feedback Loop

- Users rate analysis helpfulness: "Was this analysis helpful?"
- System learns from feedback
- Continuously improves detection accuracy
- Reduces false positives/negatives over time
