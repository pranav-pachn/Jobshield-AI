import fs from 'fs';
import path from 'path';

interface TestCase {
  id: string;
  text: string;
  label: 'SCAM' | 'SAFE';
  category: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  expected_signals: string[];
  source_type: 'synthetic' | 'public_dataset' | 'manually_curated' | 'real_user_report';
  dataset_version: string;
}

const datasetVersion = '1.0';
const cases: TestCase[] = [];
let idCounter = 1;

function addCase(c: Omit<TestCase, 'id' | 'dataset_version' | 'source_type'>) {
  cases.push({
    id: `JOB-${idCounter.toString().padStart(3, '0')}`,
    ...c,
    source_type: 'synthetic',
    dataset_version: datasetVersion,
  });
  idCounter++;
}

// 1. Easy Scams
for (let i = 0; i < 5; i++) {
  addCase({
    text: `URGENT HIRING! Work from home data entry. Pay is $500 per day. No experience needed. You must pay a $50 registration fee via CashApp or Bitcoin before we send you the equipment. Contact hr@gmail.com immediately.`,
    label: 'SCAM',
    category: 'advance_payment',
    difficulty: 'EASY',
    expected_signals: ['payment_request', 'urgency', 'unrealistic_salary', 'generic_email'],
  });
}

// 2. Medium Scams (More subtle)
for (let i = 0; i < 10; i++) {
  addCase({
    text: `We are looking for a remote Customer Support Specialist. The role involves managing client inquiries. Salary is competitive at $35/hr. Please reach out to our hiring manager on Telegram (@HR_Support_Bot) to schedule your interview. Do not reply to this email.`,
    label: 'SCAM',
    category: 'telegram_whatsapp',
    difficulty: 'MEDIUM',
    expected_signals: ['off_platform_contact'],
  });
}

// 3. Hard Scams (Looks very professional but asks for SSN/ID upfront)
for (let i = 0; i < 10; i++) {
  addCase({
    text: `Acme Corp is hiring a Senior Software Engineer. We offer comprehensive benefits, 401k matching, and unlimited PTO. The base salary is $150,000 USD. To proceed with the background check for this final round, please upload a copy of your driver's license and your social security number to this portal: http://bit.ly/acme-onboarding.`,
    label: 'SCAM',
    category: 'identity_impersonation',
    difficulty: 'HARD',
    expected_signals: ['phishing_url', 'identity_request_upfront'],
  });
}

// 4. Easy Safe Jobs
for (let i = 0; i < 5; i++) {
  addCase({
    text: `Google is hiring a Software Engineer for our Mountain View office. You will work on scalable backend systems. Requirements: BS in Computer Science, 2+ years of experience with C++ or Java. Apply through careers.google.com.`,
    label: 'SAFE',
    category: 'legitimate_recruiter',
    difficulty: 'EASY',
    expected_signals: [],
  });
}

// 5. Medium Safe Jobs (Remote, but legitimate)
for (let i = 0; i < 10; i++) {
  addCase({
    text: `Fully remote position for a Marketing Manager at TechStart Inc. We are a fast-growing startup looking for someone to lead our digital campaigns. Base salary is $85,000/year plus equity. We will provide a company laptop. Please submit your resume via our Greenhouse portal.`,
    label: 'SAFE',
    category: 'legitimate_remote_job',
    difficulty: 'MEDIUM',
    expected_signals: [],
  });
}

// 6. Hard Safe Jobs (Looks slightly suspicious but is safe - e.g. legitimate contract work or startup)
for (let i = 0; i < 10; i++) {
  addCase({
    text: `We need a freelance Graphic Designer urgently to finish a project by next Friday. Budget is $5,000 total. You will be working directly with the founder. No formal interview needed, just send your portfolio. We will pay 50% upfront via Upwork.`,
    label: 'SAFE',
    category: 'legitimate_high_salary',
    difficulty: 'HARD',
    expected_signals: [],
  });
}

const outputPath = path.join(__dirname, '../datasets/v1_benchmark.json');
fs.writeFileSync(outputPath, JSON.stringify(cases, null, 2));
console.log(`Generated ${cases.length} cases to ${outputPath}`);
