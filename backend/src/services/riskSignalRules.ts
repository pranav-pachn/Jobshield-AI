export interface RiskSignalMetadata {
  points: number;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  description: string;
}

export const RISK_SIGNAL_RULES: Record<string, RiskSignalMetadata> = {
  advance_fee: {
    points: 40,
    severity: "CRITICAL",
    description: "Upfront payment requested from candidate"
  },
  registration_fee: {
    points: 40,
    severity: "CRITICAL",
    description: "Registration or training fee required"
  },
  suspicious_domain: {
    points: 20,
    severity: "HIGH",
    description: "Domain is suspicious or impersonating a legitimate company"
  },
  generic_email: {
    points: 15,
    severity: "MEDIUM",
    description: "Recruiter uses a free or generic email provider"
  },
  recruiter_mismatch: {
    points: 15,
    severity: "MEDIUM",
    description: "Recruiter identity does not match the hiring company"
  },
  unrealistic_salary: {
    points: 15,
    severity: "MEDIUM",
    description: "Salary is unrealistically high for the role"
  },
  telegram_whatsapp: {
    points: 20,
    severity: "HIGH",
    description: "Requests communication exclusively over Telegram or WhatsApp"
  },
  payment_request: {
    points: 30,
    severity: "HIGH",
    description: "Requests payment for equipment or software"
  },
  urgency: {
    points: 10,
    severity: "MEDIUM",
    description: "Job posting uses high-pressure or urgent language"
  },
  off_platform_contact: {
    points: 15,
    severity: "MEDIUM",
    description: "Asks to contact outside of the hiring platform"
  }
};
