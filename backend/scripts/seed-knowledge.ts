import mongoose from "mongoose";
import { KnowledgeItem } from "../src/models/KnowledgeItem";
import { env } from "../src/config/env";
import "../src/config/loadEnv";

const INITIAL_KNOWLEDGE = [
  {
    title: "Registration Fee Employment Scam",
    content: "Scammers request registration, verification, or training fees before employment. Victims are asked to pay a registration or verification fee upfront, often via untraceable methods like CashApp, Zelle, or Bitcoin. Legitimate employers never ask candidates to pay to work.",
    category: "advance_payment",
    severity: "HIGH",
    source: "Employment Fraud Advisory",
    sourceType: "advisory",
    tags: ["payment", "fake-job", "fee"]
  },
  {
    title: "Unverified Telegram/WhatsApp Recruiter",
    content: "Scammers move communication immediately to encrypted chat platforms like Telegram or WhatsApp to avoid platform moderation. They often use generic handles and refuse video calls. Legitimate recruiting generally starts via official company email or verified LinkedIn.",
    category: "telegram_whatsapp",
    severity: "MEDIUM",
    source: "Cybersecurity Threat Intel",
    sourceType: "threat_intel",
    tags: ["off-platform", "telegram", "whatsapp"]
  },
  {
    title: "Unrealistic Data Entry Salary",
    content: "Scam campaigns offer heavily inflated salaries (e.g., $35-$50/hr or $500/day) for basic, unskilled data entry or virtual assistant roles. The compensation claim appears unusually high for a generic role to quickly attract victims.",
    category: "unrealistic_salary",
    severity: "MEDIUM",
    source: "Fraud Analysis Report 2025",
    sourceType: "report",
    tags: ["salary", "data-entry", "too-good-to-be-true"]
  },
  {
    title: "Fake Company Impersonation",
    content: "Attackers impersonate Fortune 500 companies or high-growth startups, using lookalike domains (e.g., careers-google.com instead of google.com) and scraping actual job descriptions. Contact emails often use generic providers like @gmail.com or @outlook.com instead of the corporate domain.",
    category: "impersonation",
    severity: "CRITICAL",
    source: "Industry Impersonation Watchlist",
    sourceType: "watchlist",
    tags: ["impersonation", "lookalike-domain", "gmail"]
  }
];

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(env.mongoUri);
  console.log("Connected.");

  console.log("Clearing existing KnowledgeItems...");
  await KnowledgeItem.deleteMany({});

  console.log("Inserting curated threat evidence...");
  await KnowledgeItem.insertMany(INITIAL_KNOWLEDGE);

  console.log("Done.");
  process.exit(0);
}

seed();
