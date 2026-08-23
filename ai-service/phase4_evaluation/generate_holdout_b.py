import json
import os

cases = [
    # B1 - Hard Legitimate (8 cases)
    {
        "id": "adv_legit_001_personal_email",
        "text": "Hi, I'm the founder of NovaTech, a small startup building supply chain analytics tools. We're looking for a Data Analyst to join our 5-person team. The role pays $75k/year. We don't have a corporate email setup yet, so I'm using my personal account (novatech.founder123@gmail.com). You'll go through a technical interview and meet the team. No payments required.",
        "expectedLabel": "legitimate",
        "expectedRisk": "LOW",
        "adversarial_tags": ["personal_email", "legitimate_recruiter", "small_company"],
        "provenance": {"type": "synthetic_adversarial", "source": "manually_constructed", "verified_by": "independent_review", "verification_status": "pending"}
    },
    {
        "id": "adv_legit_002_poor_grammar",
        "text": "We is hiring a warehouse manager for our local plumbing supply bussines. Must have 5 years experiance with forklift and inventory. Salary is $25/hour plus overtime. We need someone who can works hard and manage 3 other guys. Apply in person at Bob's Plumbing Supply or send resume. We do a standard interview and background check. Need to fill fast.",
        "expectedLabel": "legitimate",
        "expectedRisk": "LOW",
        "adversarial_tags": ["poor_grammar", "legitimate"],
        "provenance": {"type": "synthetic_adversarial", "source": "manually_constructed", "verified_by": "independent_review", "verification_status": "pending"}
    },
    {
        "id": "adv_legit_003_high_salary",
        "text": "Principal Quantum Computing Researcher required for our stealth AI laboratory. Compensation: $450,000 to $600,000 base salary plus significant equity. Requirements: PhD in Quantum Physics, 10+ years experience building superconducting qubits. You must pass a 5-stage technical interview panel and provide 3 academic references. Relocation to Boston required.",
        "expectedLabel": "legitimate",
        "expectedRisk": "LOW",
        "adversarial_tags": ["unusual_salary", "high_compensation", "legitimate"],
        "provenance": {"type": "synthetic_adversarial", "source": "manually_constructed", "verified_by": "independent_review", "verification_status": "pending"}
    },
    {
        "id": "adv_legit_004_remote_software",
        "text": "Fully remote Senior Frontend Developer role. Because we are a remote-first team, you will be required to install and use Zoom, Slack, and our company VPN on your provided workstation. You must also have a GitHub account and configure our proprietary development environment locally using our setup script. The company will ship you a laptop after you pass the 3-round interview.",
        "expectedLabel": "legitimate",
        "expectedRisk": "LOW",
        "adversarial_tags": ["software_install", "remote_job", "legitimate"],
        "provenance": {"type": "synthetic_adversarial", "source": "manually_constructed", "verified_by": "independent_review", "verification_status": "pending"}
    },
    {
        "id": "adv_legit_005_urgent",
        "text": "URGENT: Immediate joining preferred. We are a fast-growing marketing agency looking for a Social Media Manager. Due to a sudden client expansion, we need to fill this role within 48 hours. Salary is $60k. Standard interview process but expedited. If you can start this Monday, please apply immediately.",
        "expectedLabel": "legitimate",
        "expectedRisk": "LOW",
        "adversarial_tags": ["urgency", "legitimate"],
        "provenance": {"type": "synthetic_adversarial", "source": "manually_constructed", "verified_by": "independent_review", "verification_status": "pending"}
    },
    {
        "id": "adv_legit_006_sparse",
        "text": "Hiring a part-time bookkeeper. $25/hr. Quickbooks experience required. Contact Apex Retail Solutions HR department with your resume. Standard interview applies.",
        "expectedLabel": "legitimate",
        "expectedRisk": "LOW",
        "adversarial_tags": ["sparse_description", "legitimate"],
        "provenance": {"type": "synthetic_adversarial", "source": "manually_constructed", "verified_by": "independent_review", "verification_status": "pending"}
    },
    {
        "id": "adv_legit_007_international",
        "text": "TechCorp Inc (US-based) is hiring a US-based technical writer. Note: I am the recruiting manager and I am based in our offshore office in India. However, the role is strictly for US residents. Compensation is $85k/year. The interview process involves meeting with our US engineering team.",
        "expectedLabel": "legitimate",
        "expectedRisk": "LOW",
        "adversarial_tags": ["international_recruiter", "legitimate"],
        "provenance": {"type": "synthetic_adversarial", "source": "manually_constructed", "verified_by": "independent_review", "verification_status": "pending"}
    },
    {
        "id": "adv_legit_008_unusual_onboarding",
        "text": "Customer Support Representative. After passing the interview, you must undergo a strict onboarding process. This includes a mandatory third-party background check, identity verification through our HR portal (requires uploading a government ID), and completing tax documentation (W-4). You will also need to complete our software setup training. No payments are required from you at any time.",
        "expectedLabel": "legitimate",
        "expectedRisk": "LOW",
        "adversarial_tags": ["identity_verification", "legitimate"],
        "provenance": {"type": "synthetic_adversarial", "source": "manually_constructed", "verified_by": "independent_review", "verification_status": "pending"}
    },
    
    # B2 - Professional Scams (6 cases)
    {
        "id": "adv_scam_001_refundable_fee",
        "text": "We are a leading financial services firm looking for an entry-level analyst. We offer competitive salaries ($70k), full health benefits, and a clear career progression. Your daily responsibilities will involve creating financial models and presenting findings. We conduct a rigorous 3-stage interview. Once hired, employees must pay a $75 refundable equipment verification fee to our IT vendor before we ship your secured corporate laptop.",
        "expectedLabel": "scam",
        "expectedRisk": "HIGH",
        "adversarial_tags": ["professional_writing", "subtle_payment_request", "refundable_fee"],
        "provenance": {"type": "synthetic_adversarial", "source": "manually_constructed", "verified_by": "independent_review", "verification_status": "pending"}
    },
    {
        "id": "adv_scam_002_bg_check_fee",
        "text": "Seeking a dedicated Healthcare Administrator for a reputable hospital network. Must have 3+ years of experience in patient records management. Excellent benefits and a salary of $85,000/year. All candidates must pass our standard clinical interview panel. Due to recent compliance regulations, candidates are required to pay for their own mandatory background verification through our approved screening portal prior to receiving the final offer letter.",
        "expectedLabel": "scam",
        "expectedRisk": "HIGH",
        "adversarial_tags": ["professional_writing", "background_check_fee"],
        "provenance": {"type": "synthetic_adversarial", "source": "manually_constructed", "verified_by": "independent_review", "verification_status": "pending"}
    },
    {
        "id": "adv_scam_003_payroll_routing",
        "text": "Logistics Coordinator needed for a national freight company. Full-time, $65k/year. You will manage scheduling and dispatch. The role requires strong organizational skills. After completing the interview and signing the employment contract, you will be set up in our system. Note: To activate your direct deposit, you must first route a test paycheck through our third-party escrow account to verify your banking details.",
        "expectedLabel": "scam",
        "expectedRisk": "HIGH",
        "adversarial_tags": ["professional_writing", "payroll_routing_scam"],
        "provenance": {"type": "synthetic_adversarial", "source": "manually_constructed", "verified_by": "independent_review", "verification_status": "pending"}
    },
    {
        "id": "adv_scam_004_credential_harvesting",
        "text": "Senior Marketing Manager role at a Global Advertising Agency. We require 7+ years of experience leading cross-functional campaigns. Competitive compensation up to $140k. Please apply through our standard process. Before the final interview, you must register on our secure employee portal, which requires verifying your identity by providing your online banking username and password for financial clearing.",
        "expectedLabel": "scam",
        "expectedRisk": "HIGH",
        "adversarial_tags": ["professional_writing", "credential_harvesting"],
        "provenance": {"type": "synthetic_adversarial", "source": "manually_constructed", "verified_by": "independent_review", "verification_status": "pending"}
    },
    {
        "id": "adv_scam_005_fake_interview_platform",
        "text": "Software Engineering role at a growing SaaS startup. We offer $120k/year and unlimited PTO. You'll be working on React and Node.js applications. Our engineering team conducts all technical assessments through a specialized coding environment. To proceed with the interview, you must download and install the 'TechAssess-Pro.exe' application on your personal machine to connect to our secure testing servers.",
        "expectedLabel": "scam",
        "expectedRisk": "HIGH",
        "adversarial_tags": ["professional_writing", "fake_interview_platform", "malicious_software"],
        "provenance": {"type": "synthetic_adversarial", "source": "manually_constructed", "verified_by": "independent_review", "verification_status": "pending"}
    },
    {
        "id": "adv_scam_006_gift_card",
        "text": "Administrative Assistant position for an executive consulting group. $55,000/year. Responsibilities include calendar management and expense reporting. This is a fully remote role with excellent benefits. Upon hiring, we require you to purchase specific brand gift cards to use as client appreciation gifts. The company will reimburse you fully on your first paycheck.",
        "expectedLabel": "scam",
        "expectedRisk": "HIGH",
        "adversarial_tags": ["professional_writing", "gift_card_reimbursement"],
        "provenance": {"type": "synthetic_adversarial", "source": "manually_constructed", "verified_by": "independent_review", "verification_status": "pending"}
    },
    
    # B3 - Conflicting Signals (6 cases)
    {
        "id": "adv_scam_007_real_co_payment",
        "text": "Job Title: Data Scientist at Microsoft. Salary: $160,000. We are looking for experts in machine learning. You will go through a comprehensive 4-round technical interview with our engineering team in Seattle. Please review our real career page at careers.microsoft.com. To secure your interview slot, a $50 administrative processing fee is required via Zelle.",
        "expectedLabel": "scam",
        "expectedRisk": "HIGH",
        "adversarial_tags": ["real_company", "payment_request", "conflicting_signals"],
        "provenance": {"type": "synthetic_adversarial", "source": "manually_constructed", "verified_by": "independent_review", "verification_status": "pending"}
    },
    {
        "id": "adv_scam_008_legit_recruiter_credentials",
        "text": "Hi, I'm a Senior Technical Recruiter at Amazon (you can check my verified LinkedIn profile). We are hiring a Cloud Architect. The role involves designing AWS infrastructure. The interview process is rigorous. Before we begin, our new HR policy requires you to log into our verification portal using your personal Google or Apple ID password.",
        "expectedLabel": "scam",
        "expectedRisk": "HIGH",
        "adversarial_tags": ["legitimate_recruiter", "credential_harvesting", "conflicting_signals"],
        "provenance": {"type": "synthetic_adversarial", "source": "manually_constructed", "verified_by": "independent_review", "verification_status": "pending"}
    },
    {
        "id": "adv_scam_009_real_salary_crypto",
        "text": "Hiring a mid-level Graphic Designer. We offer a realistic salary of $65,000/year based on market rates, comprehensive medical insurance, and a 401k match. We need someone proficient in Adobe Creative Suite. As part of our decentralized payroll initiative, your first week's equipment deposit must be sent in Bitcoin, which will be refunded in your first paycheck.",
        "expectedLabel": "scam",
        "expectedRisk": "HIGH",
        "adversarial_tags": ["realistic_salary", "crypto_payment", "conflicting_signals"],
        "provenance": {"type": "synthetic_adversarial", "source": "manually_constructed", "verified_by": "independent_review", "verification_status": "pending"}
    },
    {
        "id": "adv_scam_010_normal_interview_malware",
        "text": "Project Manager role at a prominent construction firm. You will oversee multi-million dollar commercial projects. We conduct standard behavioral interviews and require PMP certification. As part of the technical screening, please download our proprietary project management viewer (PMViewer_Setup.zip) and open the enclosed executable to review the case study.",
        "expectedLabel": "scam",
        "expectedRisk": "HIGH",
        "adversarial_tags": ["normal_interview", "malicious_software", "conflicting_signals"],
        "provenance": {"type": "synthetic_adversarial", "source": "manually_constructed", "verified_by": "independent_review", "verification_status": "pending"}
    },
    {
        "id": "adv_scam_011_polished_reshipping",
        "text": "Quality Assurance Logistics Inspector. $60k/year. We are a globally recognized e-commerce fulfillment partner. Your role requires meticulous attention to detail and professional communication skills. The day-to-day work involves receiving high-value electronic packages at your home address, inspecting them for defects, repackaging them with our provided labels, and shipping them to international clients.",
        "expectedLabel": "scam",
        "expectedRisk": "HIGH",
        "adversarial_tags": ["polished_job", "reshipping", "conflicting_signals"],
        "provenance": {"type": "synthetic_adversarial", "source": "manually_constructed", "verified_by": "independent_review", "verification_status": "pending"}
    },
    {
        "id": "adv_scam_012_real_onboarding_id_theft",
        "text": "Human Resources Generalist. $75,000/year. You will manage employee relations and benefits administration. We have a highly structured onboarding process that includes compliance training and an employee handbook review. To complete your I-9 verification, you must email a clear photo of your Social Security Card, Driver's License, and your mother's maiden name to our external auditor's personal email.",
        "expectedLabel": "scam",
        "expectedRisk": "HIGH",
        "adversarial_tags": ["real_onboarding", "identity_theft", "conflicting_signals"],
        "provenance": {"type": "synthetic_adversarial", "source": "manually_constructed", "verified_by": "independent_review", "verification_status": "pending"}
    },
    
    # B4 - Novel/Subtle (4 cases)
    {
        "id": "adv_scam_013_payroll_redirection",
        "text": "Accounts Payable Clerk. Full-time remote position. You will be responsible for processing invoices and managing vendor payments. No upfront fees are required for this job. However, once hired, you will be instructed by the 'CEO' via email to urgently update the company's payroll routing numbers to a new vendor account before the monthly closing.",
        "expectedLabel": "scam",
        "expectedRisk": "HIGH",
        "adversarial_tags": ["novel_subtle", "payroll_redirection"],
        "provenance": {"type": "synthetic_adversarial", "source": "manually_constructed", "verified_by": "independent_review", "verification_status": "pending"}
    },
    {
        "id": "adv_scam_014_malicious_interview_tooling",
        "text": "Junior Systems Administrator. We are looking for someone with basic Linux and networking knowledge. The interview consists of a practical troubleshooting exercise. To begin the exercise, you need to execute a PowerShell script provided by our hiring manager that will 'configure the assessment environment' and alter your system's registry settings.",
        "expectedLabel": "scam",
        "expectedRisk": "HIGH",
        "adversarial_tags": ["novel_subtle", "malicious_interview_tooling"],
        "provenance": {"type": "synthetic_adversarial", "source": "manually_constructed", "verified_by": "independent_review", "verification_status": "pending"}
    },
    {
        "id": "adv_scam_015_money_mule_finance",
        "text": "Remote Finance Assistant for a boutique investment firm. $80k/year. Your role involves optimizing capital flow for our high-net-worth clients. You will not be asked for any upfront payments. Your primary duty will be receiving client funds into your personal bank account and subsequently transferring those funds to various international cryptocurrency exchanges as directed by your manager.",
        "expectedLabel": "scam",
        "expectedRisk": "HIGH",
        "adversarial_tags": ["novel_subtle", "money_mule", "finance_disguise"],
        "provenance": {"type": "synthetic_adversarial", "source": "manually_constructed", "verified_by": "independent_review", "verification_status": "pending"}
    },
    {
        "id": "adv_scam_016_credential_harvesting_onboarding",
        "text": "Sales Development Representative. Base salary plus commission. You will be pitching our software to enterprise clients. The hiring process is standard and there is no urgency. During your first week of onboarding, you will need to sync your personal iCloud and Google accounts with our 'Mobile Device Management' tool, which requires providing your master passwords to our HR representative.",
        "expectedLabel": "scam",
        "expectedRisk": "HIGH",
        "adversarial_tags": ["novel_subtle", "credential_harvesting_onboarding"],
        "provenance": {"type": "synthetic_adversarial", "source": "manually_constructed", "verified_by": "independent_review", "verification_status": "pending"}
    }
]

out_path = os.path.join(os.path.dirname(__file__), '..', '..', 'datasets', 'evaluation', 'rag_benchmark_holdout_b_adversarial.json')
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(cases, f, indent=2)

print(f"Generated {len(cases)} cases in {out_path}")
